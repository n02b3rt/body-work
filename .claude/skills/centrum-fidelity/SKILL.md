---
name: centrum-fidelity
description: How faithfully a Centrum page must match the scraped reference, and when you are allowed to deviate from it. Use whenever you build or change a page under src/app/[locale]/ or a component in src/components/centrum/, when comparing our output against the mirror, or when the reference itself looks broken and you are deciding whether to copy the defect or fix it.
---

The reference mirror is `scripts/scrape/scraped/`. Which live URL maps to which folder, plus the
verified brand colours, breakpoints and type scale: `docs/scraped-site-map.md`. Do not re-guess
those values, they were measured.

**Reproduce it 1:1, except where it is plainly defective.** Copy, colours, imagery and section
content match the reference. Layout mechanics (container behaviour, grid implementation,
breakpoints) are fair game to adapt.

- **Defect** = something a visitor would read as a bug: a dead link, unreadable type, content
  colliding or stranded, an empty half-column. Fix it. Worked examples: `LegalDocument` (body size,
  column layout, heading scale) and `external-links.ts` (the dead `/galeria` target).
- **Taste** = you would have designed it differently. Keep the reference and ask.
- Use the real assets from that page's `media/` folder, not gradient or text placeholders. Photos go
  through `next/image`; video is served as a plain optimised static file.

**Every deviation gets a row in the "Deliberate deviations" table in `docs/migration-tracker.md`**,
saying what changed and why. A deviation that is not in that table did not happen as far as the
next person is concerned.

Update that page's row in the tracker in the same change: components used or created, i18n, QA, status.
