import './fetch-polyfill'

import {info, setFailed, warning} from '@actions/core'
import {
  ChatGPTAPI,
  ChatGPTError,
  ChatMessage,
  SendMessageOptions
  // eslint-disable-next-line import/no-unresolved
} from 'chatgpt'
import pRetry from 'p-retry'
import {OpenAIOptions, Options} from './options'

// define type to save parentMessageId and conversationId
export interface Ids {
  parentMessageId?: string
  conversationId?: string
}

export class Bot {
  private readonly api: ChatGPTAPI | null = null // not free

  private readonly options: Options
  private readonly model: string
  private readonly responseTokens: number

  constructor(options: Options, openaiOptions: OpenAIOptions) {
    this.options = options
    this.model = openaiOptions.model
    this.responseTokens = openaiOptions.tokenLimits.responseTokens
    if (process.env.OPENAI_API_KEY) {
      const currentDate = new Date().toISOString().split('T')[0]
      const systemMessage = `${options.systemMessage}
Knowledge cutoff: ${openaiOptions.tokenLimits.knowledgeCutOff}
Current date: ${currentDate}

IMPORTANT: Entire response must be in the language with ISO code: ${options.language}
`

      const usesResponsesApi = this.model.startsWith('gpt-5')
      const completionParams: Record<string, unknown> = {
        temperature: options.openaiModelTemperature,
        model: this.model
      }
      if (!usesResponsesApi) {
        this.api = new ChatGPTAPI({
          apiBaseUrl: options.apiBaseUrl,
          systemMessage,
          apiKey: process.env.OPENAI_API_KEY,
          apiOrg: process.env.OPENAI_API_ORG ?? undefined,
          debug: options.debug,
          maxModelTokens: openaiOptions.tokenLimits.maxTokens,
          maxResponseTokens: openaiOptions.tokenLimits.responseTokens,
          completionParams
        })
      }
    } else {
      const err =
        "Unable to initialize the OpenAI API, both 'OPENAI_API_KEY' environment variable are not available"
      throw new Error(err)
    }
  }

  chat = async (message: string, ids: Ids): Promise<[string, Ids]> => {
    let res: [string, Ids] = ['', {}]
    try {
      res = await this.chat_(message, ids)
      return res
    } catch (e: unknown) {
      if (e instanceof ChatGPTError) {
        warning(`Failed to chat: ${e}, backtrace: ${e.stack}`)
      }
      return res
    }
  }

  private readonly chat_ = async (
    message: string,
    ids: Ids
  ): Promise<[string, Ids]> => {
    // record timing
    const start = Date.now()
    if (!message) {
      return ['', {}]
    }

    let response: ChatMessage | undefined
    let responseText = ''

    if (this.api != null) {
      const opts: SendMessageOptions = {
        timeoutMs: this.options.openaiTimeoutMS
      }
      if (ids.parentMessageId) {
        opts.parentMessageId = ids.parentMessageId
      }
      try {
        response = await pRetry(() => this.api!.sendMessage(message, opts), {
          retries: this.options.openaiRetries
        })
      } catch (e: unknown) {
        if (e instanceof ChatGPTError) {
          info(
            `response: ${response}, failed to send message to openai: ${e}, backtrace: ${e.stack}`
          )
        }
      }
      const end = Date.now()
      info(`response: ${JSON.stringify(response)}`)
      info(
        `openai sendMessage (including retries) response time: ${
          end - start
        } ms`
      )
    } else if (this.model.startsWith('gpt-5')) {
      try {
        responseText = await this.sendResponsesApiMessage(message)
      } catch (e: unknown) {
        if (e instanceof ChatGPTError) {
          warning(`Failed to chat: ${e}, backtrace: ${e.stack}`)
        } else {
          warning(`Failed to chat: ${e as string}`)
        }
      }
    } else {
      setFailed('The OpenAI API is not initialized')
    }
    if (response != null) {
      responseText = response.text
    } else if (responseText.length === 0) {
      warning('openai response is null')
    }
    // remove the prefix "with " in the response
    if (responseText.startsWith('with ')) {
      responseText = responseText.substring(5)
    }
    if (this.options.debug) {
      info(`openai responses: ${responseText}`)
    }
    const newIds: Ids = {
      parentMessageId: response?.id,
      conversationId: response?.conversationId
    }
    return [responseText, newIds]
  }

  private readonly sendResponsesApiMessage = async (
    message: string
  ): Promise<string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    }
    if (process.env.OPENAI_API_ORG) {
      headers['OpenAI-Organization'] = process.env.OPENAI_API_ORG
    }

    const body = {
      model: this.model,
      input: message,
      temperature: this.options.openaiModelTemperature,
      max_output_tokens: this.responseTokens
    }

    const response = await fetch(`${this.options.apiBaseUrl}/responses`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })
    if (!response.ok) {
      const reason = await response.text()
      throw new ChatGPTError(`OpenAI error ${response.status}: ${reason}`)
    }
    const payload: any = await response.json()
    if (typeof payload.output_text === 'string') {
      return payload.output_text
    }
    if (Array.isArray(payload.output)) {
      const textParts: string[] = []
      for (const item of payload.output) {
        if (item?.type === 'message' && Array.isArray(item.content)) {
          for (const content of item.content) {
            if (content?.type === 'output_text' && content.text) {
              textParts.push(content.text)
            }
          }
        }
      }
      if (textParts.length > 0) {
        return textParts.join('')
      }
    }
    return ''
  }
}
