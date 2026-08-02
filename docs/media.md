> Read when: changing upload handling, conversion, or the admin media explorer.

# Media library

Admin media module for BodyWork Centrum (Payload collection `media`).

## Capabilities

- **Accessibility fields:** title, ALT (required unless decorative), caption, description, slug, tags (comma → chips), `isDecorative`. Stacked groups (not tabs). Admin copy follows `docs/conventions.md` (*Admin UI copy*).
- **Automation:** on file pick (client) and on create (server), title / ALT / slug / `kind` are filled from the upload filename and MIME (`src/lib/media-filename.ts`, `MediaAutofill`). No vision/ML API: editors should review ALT.
- **Conversion (on upload / file replace):** `convertFormat` (`optimized` → WebP/WebM by default, or exact `webp` / `avif` / `jpeg` / `png` / `webm` / `mp4`, or `original`), `maxDimension` (default 1920, presets or custom px), `imageQuality` (default balanced/82, presets or custom 1–100). Implemented in `src/lib/compress-media.ts` via `beforeOperation` using **sharp** (images) and **fluent-ffmpeg** (video): no extra conversion packages.
- **Responsive sizes:** Payload `imageSizes`: `thumbnail` (400), `card` (768), `content` (1200), `hero` (1920), WebP. Names are load-bearing (`mediaFrom` / admin library); do not rename to `thumb`/`large` without a DB migration: leftover `sizes_thumb_*` / `sizes_large_*` columns make `pnpm dev` ask for a destructive schema push on every start.
- **Explorer list view:** custom `MediaLibrary` replaces the default table: grid / list, folders by `kind`, sort, search, details panel with preview + copy URL.
- **Create → library:** after a successful create, the editor lands on the library list (`/admin/c/media`), not the new document’s edit view (`MediaSaveButton` + `MediaGotoLibrary` marker). Updates stay on the edit form.
- **No create sidebar:** `blurDataURL` (LQIP) stays in the schema for the site but is `admin.hidden`: no Placeholder column on create/edit.

## Key paths

| Piece | Path |
|---|---|
| Collection | `src/collections/Media.ts` |
| Compression | `src/lib/compress-media.ts` |
| Filename helpers | `src/lib/media-filename.ts` |
| Admin explorer | `src/components/admin/media/` |
| Create-form autofill / tags / size / quality | `MediaAutofill`, `MediaTagsField`, `MediaMaxSizeField`, `MediaQualityField` |
| Create → library redirect | `MediaSaveButton`, `MediaGotoLibrary`, `media-goto-library.ts` |
| Styles | `src/app/(payload)/custom.css` (`.bw-media*`, `.bw-media-tags*`, `.bw-media-option*`) |

## Notes

- Conversion options apply when a file is uploaded or replaced, not when only metadata is edited.
- `kind` is derived from MIME (jpg/png → Obraz, etc.). Do not put `defaultValue: 'other'` back: it blocked auto-classification because hooks treated `'other'` as an intentional choice.
- Video → WebM/MP4 is CPU-heavy; on failure the original file is kept.
- After changing admin Field components, run `pnpm generate:importmap`. After field changes, `pnpm generate:types`.
