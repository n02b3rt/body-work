> Read when: changing upload handling, image conversion, blur placeholders, video encodes, or the admin media explorer.

# Media

Uploads land in the `media` collection, get downscaled and converted, and are served through
`next/image` on the site. The admin has a custom explorer rather than Payload's stock table.

## Collection

`src/collections/Media.ts`. Uploads are downscaled to a 2560px long edge and converted to WebP;
four `imageSizes` are generated (thumbnail, card, content, hero). Conversion also supports exact
formats (WebP, AVIF, JPEG, PNG, WebM, MP4) through the sharp and fluent-ffmpeg already installed:
**no new conversion library is needed or wanted**.

## Admin UI

`src/components/admin/media/`

| File | Does |
|---|---|
| `MediaLibrary.tsx` | the explorer (grid, list, folders) |
| `MediaBrowser.tsx` | picker used from other fields |
| `MediaDetailsPanel.tsx` | detail sidebar |
| `MediaAutofill.tsx` | fills title, ALT, slug and `kind` the moment a file is picked |
| `MediaTagsField.tsx` | comma-committed tag chips |
| `MediaMaxSizeField.tsx`, `MediaQualityField.tsx` | preset plus custom controls |
| `MediaSaveButton.tsx`, `MediaGotoLibrary.tsx`, `media-goto-library.ts` | return to the library after a successful create |
| `media-library-utils.ts` | shared helpers |

## Helpers

`src/lib/compress-media.ts` (format, size, quality), `media-filename.ts` (ALT and slug from the
filename), `media.ts`, `image-display.ts`.

## Blur placeholders (LQIP)

Two separate systems, and they do not overlap:

- **Payload media:** `blurDataURL` on the collection, harvested by `scripts/import-blur-placeholders.ts`
  from the mirror's own `<picture>` backgrounds. 189 of 230 covered.
- **Static marketing pages:** no CMS behind them, so `scripts/generate-blur-placeholders.mjs` writes
  `static-blur.json`, read through `src/lib/static-blur.ts`. **Server components only**: a client
  component takes the string as a prop, see `FullBleedVideo`.

## Video

`scripts/optimize-hero-video.mjs` produces 720px and 1280px VP9 and h264 pairs plus a poster, no
audio, into `public/videos/`. 8388 KB down to 734 KB on a phone. The input `hero-source.mp4` is
gitignored. Next.js has no built-in video pipeline, so video is served as a plain static file.

## Gotchas

- **`kind` has no `defaultValue`.** It used to default to `other`, which blocked MIME classification.
- **Counting blurred images from a live page returns zero.** `next/image` drops the placeholder once
  the real file decodes; check the served HTML for `data:image/webp;base64,` instead.
- **`blurDataURL` is `admin.hidden`.** It stays in the schema for the site but is not shown in the panel.
- **Video encoding is CPU-heavy.** Expect a long wait on MP4 and WebM.
- **`scripts/backfill-image-sizes.ts`** regenerates `imageSizes` on uploads that predate a size change.

## Related

[`../media.md`](../media.md) · [`seo.md`](./seo.md)
