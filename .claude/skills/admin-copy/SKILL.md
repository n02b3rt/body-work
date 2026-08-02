---
name: admin-copy
description: The house style for text an editor sees in the dashboard: short, dry, one line that names the thing. Use whenever you write or edit a Payload label, an admin.description, a view lead, a card hint, a toolbar string, an empty state, or a placeholder, anywhere under src/components/admin/, src/collections/, src/globals/ or src/fields/.
---

Full rule, worked good-vs-bad examples and where it applies: `docs/admin-copy.md`.

Editors work in Polish and they are competent. The whole rule in five lines:

- **One short line by default.** Two only when a real constraint must be stated (format, max length,
  required relation).
- **Name the thing, don't teach it.** No walkthroughs, no "you can also…", no cross-links to other
  menu paths in a lead.
- **No filler openers**: "Ta sekcja pozwala…", "W tym miejscu możesz…", "Użyj tego pola do…".
- **Prefer silence.** If the description only restates the label, delete it. An empty `description`
  beats a paragraph.
- **Placeholders are examples** (`Jan Kowalski`, `np. 120`), not instructions.

Behaviour that genuinely needs documenting goes in `docs/*.md` or a code comment, **not** in the
string an editor reads every day.

**No em-dashes**, here or anywhere else in this repo. Colon, comma, semicolon, or split the sentence.
