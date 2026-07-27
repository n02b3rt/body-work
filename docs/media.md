# Media library

Admin media module for BodyWork Centrum (Payload collection `media`).

## Capabilities

- **Accessibility / SEO fields:** title, ALT (required unless decorative), caption, description, slug, tags, `isDecorative`.
- **Automation:** on create, title / ALT / slug are suggested from the upload filename (`src/lib/media-filename.ts`). No vision/ML API: editors should review ALT.
- **Conversion (on upload / file replace):** `convertFormat` (`optimized` → WebP/WebM, `avif`, or `original`), `maxDimension` (default 1920), `imageQuality` (default balanced/82). Implemented in `src/lib/compress-media.ts` via `beforeOperation`.
- **Responsive sizes:** Payload `imageSizes`: `thumb` (400), `card` (800), `large` (1600), WebP.
- **Explorer list view:** custom `MediaLibrary` replaces the default table: grid / list, folders by `kind`, sort, search, details panel with preview + copy URL.

## Key paths

| Piece | Path |
|---|---|
| Collection | `src/collections/Media.ts` |
| Compression | `src/lib/compress-media.ts` |
| Filename helpers | `src/lib/media-filename.ts` |
| Admin explorer | `src/components/admin/media/` |
| Styles | `src/app/(payload)/custom.css` (`.bw-media*`) |

## Notes

- Conversion options apply when a file is uploaded or replaced, not when only metadata is edited.
- Video → WebM is CPU-heavy; on failure the original file is kept.
- After changing the list Component path, run `pnpm generate:importmap`. After field changes, `pnpm generate:types`.
