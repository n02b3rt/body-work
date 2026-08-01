---
description: Append one line to docs/log.md and roll older entries into the archive
---

Add an entry to `docs/log.md` for: $ARGUMENTS

Rules for the entry:

- **One line.** Format: `- **YYYY-MM-DD, short topic:** what was decided or what bites. ⚠ gotcha.`
  Today's date, newest at the top of the list.
- **Only if it earns its place.** An entry exists when there is a decision, or a gotcha the diff
  does not show. "What I did" is `git log`; do not restate the commit.
- If `$ARGUMENTS` is empty, work out the entry from what happened in this session, then show it to
  the user before writing.
- No em-dashes. English.

Then keep the file in budget: if the list holds **more than 20 entries**, move the oldest ones to
the newest file in `docs/archive/` (or create `docs/archive/log-<YYYY-MM>.md` if the current archive
covers a different month) so exactly 20 remain, and make sure `docs/log.md` still links to it.

Report what you appended and whether anything rolled off.
