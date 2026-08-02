---
name: finish-task
description: The definition of done for this repo: what to update, verify and commit before calling a change finished. Use when you have finished implementing something and are about to commit, open a pull request, or tell the user it is done.
---

Work through this in order. Skipping step 1 is what makes the map start lying.

0. **Added or renamed a skill?** `pnpm sync:skills`, so Grok Code sees the same trigger.
   `pnpm check:docs` fails if you forget.
1. **The map.** Did you add a file, a route, a collection, a script? Add it to the matching
   `docs/map/<domain>.md`. A whole new domain also gets a row in `docs/map.md`. Did you build
   something listed under "Not built yet" in `docs/map.md`? Move it into its domain file.
   If a map file is now over 6 KB, split it the way `docs/map.md` prescribes.
2. **The relevant `docs/*.md`.** A Centrum page means a row in `migration-tracker.md` (plus the
   deviations table if you deviated). A cross-cutting choice means a row in `decisions.md`.
3. **`docs/log.md`**, only if there is a decision or a gotcha the diff does not show. "What I did" is
   `git log`. Use `/log`, which keeps the file at 20 entries.
4. **Regenerate** if the schema or admin components changed: `pnpm generate:types`, then
   `pnpm generate:importmap`.
5. **Verify.** Start with the cheap one, which enforces steps 1 to 3 for you:

```bash
pnpm check:docs
```
```bash
pnpm test
```
```bash
pnpm build
```

   Plus `pnpm check:messages` if you touched translations, `pnpm smoke:builder` if you touched the
   builder. **Changed a pure function in `src/lib/`? It probably has a test in `tests/`, and if it
   does not, that is the cheapest one you will ever write.** **`pnpm lint` is broken on `main` too**
   (eslint-plugin-react 7.37 vs ESLint 10), so a failure there is not necessarily yours: check before
   you blame your diff.

6. **Commit** on a `feat/` `fix/` `refactor/` `chore/` branch, never straight to `main`. Title:
   `type: short, on-point summary`, English, ~60 characters. No AI or tool authorship anywhere.
   No em-dashes.

Report failures as failures. A red `build` means it is not done.
