---
name: northwind-pr
description: Write the pull request description for the current branch in the Northwind team's required format (title, what changed, how I verified it, acceptance criteria, deliberately not done). Use when the user asks for a Northwind PR description or invokes /northwind-pr.
---

# /northwind-pr

Write the pull request description for the work on this branch, in the team's required format.

Read first, write second. Nothing goes into the description until you have read the diff, the log and the ticket.

## What to do

### 1. Read the facts. Do not guess at them.

Find the base branch: use `main` if it exists locally, otherwise `upstream/main` or `origin/main`. Then read:

- `git diff <base>...HEAD --stat`, then the diff itself. This is what actually changed.
- `git log <base>..HEAD --oneline`. This is how the work was sequenced.
- The ticket in `docs/tickets/`. Get the ID from the branch name (for example `NWP-101-export-options` gives `NWP-101`) or from the user. Copy its acceptance criteria verbatim.
- The spec in `docs/specs/`, if one exists, to see where the build departed from the plan.

If you cannot find the ticket, ask for the ID. Do not invent acceptance criteria.

### 2. Establish what was verified

List the verification steps that were actually run in this session or are visible in the conversation: test commands and their output, requests made, pages clicked through. For anything you are not sure was run, ask the user, or run it now if it is cheap (`npm test`).

### 3. Check each acceptance criterion honestly

For each criterion, find the code that satisfies it, or find that nothing does. A criterion is met only if you can point to the code and to how it was checked. Otherwise leave it unticked and say why. If it is half done, say which half.

### 4. Write the description in exactly this format

```markdown
# <TICKET-ID>: <what it does>

## What changed

<One plain-language paragraph. What can the app do now that it could not
before? Not a file list; the diff already is one.>

## How I verified it

<The actual commands run and what they output. Paste the summary lines.
Name what was clicked and what appeared. Anything not run is left out or
marked "not run".>

## Acceptance criteria

- [x] <criterion from the ticket, verbatim>
- [ ] <criterion not met, or partial: say which part, and why>

## Deliberately not done

<Out of scope, left for a follow-up, or known rough edges. Bulleted. Write
"Nothing" only if that is true.>
```

The title is `<TICKET-ID>: <what it does>`, for example `NWP-101: add export options`. Use the ticket's ID, lowercase verb phrase, no trailing period.

### 5. Offer to open it

Print the finished description. Then offer to open the PR:

```bash
gh pr create --title "<TICKET-ID>: <what it does>" --body-file <file>
```

Ask before running it. Opening a pull request is the user's call.

## Rules

- **Never claim a verification step that was not actually run.** If you did not run it, do not write that you ran it. Say "not run" or leave it out.
- **Quote output, don't paraphrase it.** "`npm test`: 35 passed" with the real numbers beats "tests pass".
- **Tick honestly.** An unmet or partial criterion reported as such is correct. A ticked box with no code behind it is the failure.
- **Plain language.** "Ops can now pick which columns go in the export" beats "implemented export column selection".
- **Say what was not done.** The "Deliberately not done" section is required, not optional.
- **Keep it scannable.** Short paragraphs, real bullets, no filler, no emoji.
- **Do not edit code.** This skill only reads and writes the description.
