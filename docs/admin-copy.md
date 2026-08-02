> Read when: writing any string an editor will see: a `label`, an `admin.description`, a view lead, a card hint, an empty state.

# Admin UI copy

Editors and staff work in Polish. Labels and short hints in the dashboard are **orienting labels**,
not tutorials. Assume the reader is competent.

## Rules

1. **One short line by default.** Section leads, view subtitles, card hints, `admin.description` on
   fields/collections: usually a single short sentence or fragment. Two lines only when a real
   constraint must be stated (format, max length, required relation).
2. **Name the thing, don't teach it.** Say what the screen or field *is*, not how to use the whole
   product. No walkthroughs, no "you can also…", no "this panel only informs…", no cross-links to
   other menu paths in the lead.
3. **No filler.** Drop openers like "Ta sekcja pozwala…", "W tym miejscu możesz…", "Użyj tego pola
   do…", "Pełna lista… znajdziesz w…". If the label already says *Tytuł*, the description must add a
   fact the label does not (e.g. "Max ~60 znaków"), otherwise omit it.
4. **No patronizing tone.** No over-explaining obvious CMS concepts (what a slug is, that publish
   makes it live, that cache refreshes). No "for beginners" prose.
5. **Prefer silence over noise.** An empty `description` beats a paragraph that restates the title.
6. **Placeholders are examples** (`Jan Kowalski`, `np. 120`), not instructions.

## Good vs bad

| Where | Bad | Good |
|---|---|---|
| View lead | "Pakiety z package.json, dla których w npm jest nowsza wersja niż zainstalowana: zakres zadeklarowany, wersja w node_modules, najnowsza w rejestrze oraz link do opisu wydania. Pełna lista jest w Zarządzanie → Biblioteki. Wynik cache'owany 24h; panel tylko informuje." | "Pakiety z dostępną nowszą wersją." |
| View lead | "Wszystkie bezpośrednie zależności z package.json (runtime i dev): zainstalowana wersja oraz ikony do npm, strony projektu i GitHuba." | "Zainstalowane zależności projektu." |
| Field `description` | "Użyj tego pola, aby podać krótki opis autora wyświetlany na blogu pod imieniem." | "Pod imieniem na blogu." or omit |
| Field `description` | "Opcjonalnie: tylko jeśli ten autor ma też konto w panelu." | "Opcjonalne konto w panelu." |
| Card hint | "Przejdź tutaj, aby zarządzać strukturą i treściami podstron witryny." | "Struktura i treści podstron" |

## Where this applies

- Custom admin views (`*View.tsx` leads, toolbars, empty states)
- Payload `admin.description` and labels on collections, globals, fields, blocks, tabs
- Builder chrome (page builder, component builder, appearance panels)
- Nav labels stay short words; stubs don't need essays on the coming-soon page either

When you *must* document behaviour for agents or future humans, put it in `docs/*.md` or a code
comment: **not** in the UI string the editor sees every day.

## Punctuation

**No em-dashes anywhere**, in admin copy or elsewhere in this repo. See the rule and its two reasons
in [`conventions.md`](./conventions.md).
