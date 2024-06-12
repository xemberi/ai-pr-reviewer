import {type Inputs} from './inputs'

export class Prompts {
  summarizeReleaseNotes: string

  summarize = `Provide your final response in markdown with the following content:

  - **Summary**: A high-level summary of the overall change instead of 
    specific files within 80 words.
  - **Changes**: A markdown table of files and their summaries. Group files 
    with similar changes together into a single row to save space.
  - **Security impact**: Below the changes, include a security impact assessment.To conduct a security impact assessment, consider the following:
    Identify the data and systems affected by the changes.
    Evaluate the sensitivity and value of the data and systems.
    Identify potential threats and vulnerabilities introduced by the changes.
    Assess the likelihood and potential impact of these threats.
    Identify measures to mitigate the identified risks.
  - **Performance impact**: Below the security impact, include a performance impact assessment. To conduct a performance impact assessment, consider the following:
    Identify the parts of the system that will be affected by your changes.
    Evaluate the current performance of these parts.
    Predict how your changes will affect the performance (e.g., will it increase the load, require more memory, etc.).
    If possible, perform a load test or similar to measure the impact.
    Consider the trade-offs between the benefits of your changes and the potential performance impact.
    If the impact is significant, consider ways to optimize your changes.
  - **Compliance impact**: Below the performance impact, include a compliance impact assessment. Describe how the changes affect compliance with PIPEDA, GDPR, HIPAA, SOC2 and ISO27001. If this needs signing off or checking by QA/compliance, please tag @compliance here.
  - **Context**: This should include three lines. The first is literally 'Closes #' and is to be filled in by the coder. 
    The second is 'Version bump: ' and is either #major, #minor or #patch which you have to determine based on the changes. 
    The third is literally 'Emergency change: Yes/No', to be filled in by the coder.
  - **Validation**: The steps to be taken on the staging environment to validate the changes. Formulate them as integration tests and make it a checklist.
  - **Checklist**: A checklist of the following items. If you judge the item to be sufficiently done, please check the checkbox:
    My changes adhere to the coding standards and best practices established in the Code Review Guidelines.
    I have performed a self-review of my own code.
    I have commented my code, particularly in hard-to-understand areas.
    I have made corresponding changes to the documentation, if applicable.
    My changes generate no new warnings or errors.
    I have added tests that prove my changes are effective and increase code coverage.
    New and existing unit tests pass locally with my change, coverage is above 75%.
    If applicable, I have added new credentials or environment variables to KeyVault or other systems.
    I have notified relevant stakeholders of any potential service disruptions or changes in availability when this PR is merged.
    I understand that my changes may require updates to business continuity plans, if applicable.
    I have informed appropriate parties in case of changed functionality which may require additional training or instructions.
    I have informed appropriate parties in case of potential downtime coming from this change.
  - **Testing**: A checklist with the following items:
    Unit tests have passed. (check this item)
    Integration tests have passed.
    End to end test has passed.
    Vulnerability scanning has passed.
  - **Checklist reviewer**: A checklist with the following items:
    I have reviewed the code, and either no further changes were needed, or my feedback was discussed and/or implemented.
    All of the points in the submitters checklist are properly handled.
  - **Document updates**: A checklist with the following items:
    SDD-001 (Software Detailed Description) (https://docs.google.com/spreadsheets/d/1mBWtUbx23l-wRyV_IcPluY7WFJS3fhMWYg_ISM3lR8s/edit#gid=549921701)
    SAD-001 (Software Architecture Diagram) (https://docs.google.com/document/d/1ZdyjLKlnjipOp-oT8trxOTC94i1tBY9-/)
    SOUP-001 (External Libraries) (https://docs.google.com/spreadsheets/d/1Ogf8dg9cCk7oELO1L8J58iMQVB386VadONhUwkmI9pc/edit#gid=0)
    FMEA-001 (Software Risk) (https://docs.google.com/spreadsheets/d/1EZwVVom88XWk9CLskjBhFbn1-BgbvTak/edit#gid=1622974018)
    FMEA-002 (Cybersecurity Risk) (https://docs.google.com/spreadsheets/d/1IlfDs-0TrM7ycPJOsLgriu5e7S5zRohU/edit#gid=1890818202)

  Avoid additional commentary as this summary will be added as a comment on the 
  GitHub pull request. Use the respective titles and they must be H2.

  `

  summarizeFileDiff = `## GitHub PR Title

\`$title\` 

## Description

\`\`\`
$description
\`\`\`

## Diff

\`\`\`diff
$file_diff
\`\`\`

## Instructions

I would like you to succinctly summarize the diff within 100 words.
If applicable, your summary should include a note about alterations 
to the signatures of exported functions, global data structures and 
variables, and any changes that might affect the external interface or 
behavior of the code.
`
  triageFileDiff = `Below the summary, I would also like you to triage the diff as \`NEEDS_REVIEW\` or 
\`APPROVED\` based on the following criteria:

- If the diff involves any modifications to the logic or functionality, even if they 
  seem minor, triage it as \`NEEDS_REVIEW\`. This includes changes to control structures, 
  function calls, or variable assignments that might impact the behavior of the code.
- If the diff only contains very minor changes that don't affect the code logic, such as 
  fixing typos, formatting, or renaming variables for clarity, triage it as \`APPROVED\`.

Please evaluate the diff thoroughly and take into account factors such as the number of 
lines changed, the potential impact on the overall system, and the likelihood of 
introducing new bugs or security vulnerabilities. 
When in doubt, always err on the side of caution and triage the diff as \`NEEDS_REVIEW\`.

You must strictly follow the format below for triaging the diff:
[TRIAGE]: <NEEDS_REVIEW or APPROVED>

Important:
- In your summary do not mention that the file needs a through review or caution about
  potential issues.
- Do not provide any reasoning why you triaged the diff as \`NEEDS_REVIEW\` or \`APPROVED\`.
- Do not mention that these changes affect the logic or functionality of the code in 
  the summary. You must only use the triage status format above to indicate that.
`
  summarizeChangesets = `Provided below are changesets in this pull request. Changesets 
are in chronlogical order and new changesets are appended to the
end of the list. The format consists of filename(s) and the summary 
of changes for those files. There is a separator between each changeset.
Your task is to deduplicate and group together files with
related/similar changes into a single changeset. Respond with the updated 
changesets using the same format as the input. 

$raw_summary
`

  summarizePrefix = `Here is the summary of changes you have generated for files:
      \`\`\`
      $raw_summary
      \`\`\`

`

  summarizeShort = `Your task is to provide a concise summary of the changes. This 
summary will be used as a prompt while reviewing each file and must be very clear for 
the AI bot to understand. 

Instructions:

- Focus on summarizing only the changes in the PR and stick to the facts.
- Do not provide any instructions to the bot on how to perform the review.
- Do not mention that files need a through review or caution about potential issues.
- Do not mention that these changes affect the logic or functionality of the code.
- The summary should not exceed 500 words.
`

  reviewFileDiff = `## GitHub PR Title

\`$title\` 

## Description

\`\`\`
$description
\`\`\`

## Summary of changes

\`\`\`
$short_summary
\`\`\`

## IMPORTANT Instructions

Input: New hunks annotated with line numbers and old hunks (replaced code). Hunks represent incomplete code fragments.
Additional Context: PR title, description, summaries and comment chains.
Task: Review new hunks for substantive issues using provided context and respond with comments if necessary.
Output: Review comments in markdown with exact line number ranges in new hunks. Start and end line numbers must be within the same hunk. For single-line comments, start=end line number. Must use example response format below.
Use fenced code blocks using the relevant language identifier where applicable.
Don't annotate code snippets with line numbers. Format and indent code correctly.
Do not use \`suggestion\` code blocks.
For fixes, use \`diff\` code blocks, marking changes with \`+\` or \`-\`. The line number range for comments with fix snippets must exactly match the range to replace in the new hunk.

- Do NOT provide general feedback, summaries, explanations of changes, or praises 
  for making good additions. 
- Focus solely on offering specific, objective insights based on the 
  given context and refrain from making broad comments about potential impacts on 
  the system or question intentions behind the changes.

If there are no issues found on a line range, you MUST respond with the 
text \`LGTM!\` for that line range in the review section. 

## Example

### Example changes

---new_hunk---
\`\`\`
  z = x / y
    return z

20: def add(x, y):
21:     z = x + y
22:     retrn z
23: 
24: def multiply(x, y):
25:     return x * y

def subtract(x, y):
  z = x - y
\`\`\`
  
---old_hunk---
\`\`\`
  z = x / y
    return z

def add(x, y):
    return x + y

def subtract(x, y):
    z = x - y
\`\`\`

---comment_chains---
\`\`\`
Please review this change.
\`\`\`

---end_change_section---

### Example response

22-22:
There's a syntax error in the add function.
\`\`\`diff
-    retrn z
+    return z
\`\`\`
---
24-25:
LGTM!
---

## Changes made to \`$filename\` for your review

$patches
`

  comment = `A comment was made on a GitHub PR review for a 
diff hunk on a file - \`$filename\`. I would like you to follow 
the instructions in that comment. 

## GitHub PR Title

\`$title\`

## Description

\`\`\`
$description
\`\`\`

## Summary generated by the AI bot

\`\`\`
$short_summary
\`\`\`

## Entire diff

\`\`\`diff
$file_diff
\`\`\`

## Diff being commented on

\`\`\`diff
$diff
\`\`\`

## Instructions

Please reply directly to the new comment (instead of suggesting 
a reply) and your reply will be posted as-is.

If the comment contains instructions/requests for you, please comply. 
For example, if the comment is asking you to generate documentation 
comments on the code, in your reply please generate the required code.

In your reply, please make sure to begin the reply by tagging the user 
with "@user".

## Comment format

\`user: comment\`

## Comment chain (including the new comment)

\`\`\`
$comment_chain
\`\`\`

## The comment/request that you need to directly reply to

\`\`\`
$comment
\`\`\`
`

  constructor(summarizeReleaseNotes = '') {
    this.summarizeReleaseNotes = summarizeReleaseNotes
  }

  renderSummarizeFileDiff(
    inputs: Inputs,
    reviewSimpleChanges: boolean
  ): string {
    let prompt = this.summarizeFileDiff
    if (reviewSimpleChanges === false) {
      prompt += this.triageFileDiff
    }
    return inputs.render(prompt)
  }

  renderSummarizeChangesets(inputs: Inputs): string {
    return inputs.render(this.summarizeChangesets)
  }

  renderSummarize(inputs: Inputs): string {
    const prompt = this.summarizePrefix + this.summarize
    return inputs.render(prompt)
  }

  renderSummarizeShort(inputs: Inputs): string {
    const prompt = this.summarizePrefix + this.summarizeShort
    return inputs.render(prompt)
  }

  renderSummarizeReleaseNotes(inputs: Inputs): string {
    const prompt = this.summarizePrefix + this.summarizeReleaseNotes
    return inputs.render(prompt)
  }

  renderComment(inputs: Inputs): string {
    return inputs.render(this.comment)
  }

  renderReviewFileDiff(inputs: Inputs): string {
    return inputs.render(this.reviewFileDiff)
  }
}
