---
name: payload-script
description: How to write a one-off or maintenance script that talks to Payload without it silently doing nothing or writing to production data by accident. Use whenever you add or run anything under scripts/ that uses payload run, a data backfill, an import, a smoke test, or a script that reports it finished but changed nothing.
---

**Read `.claude/skills/payload-script/SKILL.md` and follow it.** That file holds the actual guidance and
is written tool-agnostically, so ignore its frontmatter and treat every rule in it as if it were
written here.

This file exists only so Grok Code can see the trigger above. It is generated: run `pnpm sync:skills`
after editing the source, and never edit this copy by hand.
