import type {
  CollectionBeforeChangeHook,
  CollectionBeforeOperationHook,
  CollectionBeforeValidateHook,
  CollectionConfig,
} from 'payload'

import { isAdministrator, isModerator, staff } from '@/access/roles'
import {
  compressUploadFile,
  type ConvertFormat,
  type ImageQuality,
  type MaxDimension,
} from '@/lib/compress-media'
import { formatSlug } from '@/lib/format-slug'
import {
  mediaKindFromMime,
  suggestAltFromFilename,
  suggestSlugFromFilename,
} from '@/lib/media-filename'

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

function readCompressOptions(data: Record<string, unknown> | undefined) {
  return {
    convertFormat: (asString(data?.convertFormat) as ConvertFormat | undefined) ?? 'optimized',
    maxDimension: (asString(data?.maxDimension) as MaxDimension | undefined) ?? '1920',
    imageQuality: (asString(data?.imageQuality) as ImageQuality | undefined) ?? 'balanced',
  }
}

const compressOnUpload: CollectionBeforeOperationHook = async ({ context, req, operation }) => {
  if (operation !== 'create' && operation !== 'update') return
  if (!req.file?.data) return

  // `scripts/backfill-image-sizes.ts` re-feeds a file that is already stored in order to make
  // Payload generate a newly added size. Re-compressing it there would add a second lossy
  // generation to every image in the library for no reason at all, so that script asks to be
  // let through untouched. Nothing in the admin sets this.
  if (context?.skipCompression) return

  const options = readCompressOptions(req.data as Record<string, unknown> | undefined)

  try {
    const compressed = await compressUploadFile(
      {
        data: req.file.data as Buffer,
        mimetype: req.file.mimetype,
        name: req.file.name,
        size: req.file.size,
      },
      options,
    )
    req.file.data = compressed.data
    req.file.mimetype = compressed.mimetype
    req.file.name = compressed.name
    req.file.size = compressed.size
  } catch (error) {
    req.payload.logger.error({ err: error }, 'Media compression failed; keeping original file')
  }
}

const autofillFromFilename: CollectionBeforeValidateHook = async ({ data, req, operation }) => {
  if (!data) return data

  const filename = req.file?.name || asString(data.filename) || ''
  const mime = req.file?.mimetype || asString(data.mimeType)

  if (!asString(data.kind)) {
    data.kind = mediaKindFromMime(mime)
  }

  if (filename) {
    if (!asString(data.slug)) {
      data.slug = suggestSlugFromFilename(filename)
    } else {
      data.slug = formatSlug(String(data.slug))
    }

    if (!asString(data.title)) {
      data.title = suggestAltFromFilename(filename)
    }

    const decorative = Boolean(data.isDecorative)
    if (!decorative && !asString(data.alt) && (operation === 'create' || !data.alt)) {
      data.alt = suggestAltFromFilename(filename)
    }
  } else if (asString(data.slug)) {
    data.slug = formatSlug(String(data.slug))
  }

  if (data.isDecorative) {
    data.alt = data.alt || ''
  }

  return data
}

const syncKindFromMime: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  const mime = asString(data?.mimeType) || asString(originalDoc?.mimeType)
  if (mime && !asString(data?.kind)) {
    data.kind = mediaKindFromMime(mime)
  }

  if (asString(data?.slug)) {
    data.slug = formatSlug(String(data.slug))
  }

  return data
}

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Plik mediów',
    plural: 'Media',
  },
  admin: {
    group: 'Treści',
    useAsTitle: 'title',
    description:
      'Biblioteka mediów z polami dostępności/SEO, konwersją formatu i widokiem eksploratora.',
    defaultColumns: ['filename', 'alt', 'kind', 'mimeType', 'filesize', 'updatedAt'],
    listSearchableFields: ['title', 'alt', 'filename', 'slug', 'caption', 'tags'],
    pagination: {
      defaultLimit: 48,
      limits: [24, 48, 96],
    },
    components: {
      views: {
        list: {
          Component: '/components/admin/media/MediaLibrary#MediaLibrary',
        },
      },
    },
  },
  access: {
    read: () => true,
    create: staff,
    update: staff,
    delete: ({ req: { user } }) => {
      if (!user) return false
      return isAdministrator(user) || isModerator(user)
    },
  },
  hooks: {
    beforeOperation: [compressOnUpload],
    beforeValidate: [autofillFromFilename],
    beforeChange: [syncKindFromMime],
  },
  fields: [
    {
      name: 'aiAssist',
      type: 'ui',
      admin: {
        components: {
          Field: '/components/admin/ai/MediaAiPanel#MediaAiPanel',
        },
      },
    },
    {
      name: 'blurDataURL',
      type: 'textarea',
      label: 'Placeholder (LQIP)',
      admin: {
        readOnly: true,
        description: 'Rozmyta miniatura w base64, używana podczas ładowania zdjęcia.',
        position: 'sidebar',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Dostępność i SEO',
          fields: [
            {
              name: 'title',
              type: 'text',
              label: 'Tytuł',
              admin: {
                description: 'Nazwa wyświetlana w bibliotece. Domyślnie z nazwy pliku.',
              },
            },
            {
              name: 'alt',
              type: 'text',
              label: 'Tekst alternatywny (ALT)',
              validate: (
                value: unknown,
                { data }: { data?: Partial<{ isDecorative?: boolean | null }> },
              ) => {
                if (data?.isDecorative) return true
                if (typeof value === 'string' && value.trim().length > 0) return true
                return 'Podaj ALT albo oznacz plik jako dekoracyjny.'
              },
              admin: {
                description:
                  'Wymagany dla dostępności i SEO (chyba że dekoracyjny). Uzupełniany z nazwy pliku: sprawdź i popraw.',
              },
            },
            {
              name: 'isDecorative',
              type: 'checkbox',
              label: 'Obraz dekoracyjny (pusty ALT)',
              defaultValue: false,
              admin: {
                description:
                  'Zaznacz, gdy obraz nie niesie informacji (tło, ozdoba). ALT będzie traktowany jako pusty.',
              },
            },
            {
              name: 'caption',
              type: 'text',
              label: 'Podpis',
              admin: {
                description: 'Opcjonalny podpis widoczny przy obrazie na stronie.',
              },
            },
            {
              name: 'description',
              type: 'textarea',
              label: 'Opis',
              admin: {
                description: 'Dłuższy opis kontekstu (SEO, redakcja, wyszukiwanie w bibliotece).',
              },
            },
            {
              name: 'slug',
              type: 'text',
              label: 'Slug',
              unique: true,
              index: true,
              admin: {
                description: 'Identyfikator URL / nazwy pliku. Domyślnie z nazwy pliku.',
              },
            },
            {
              name: 'tags',
              type: 'text',
              label: 'Tagi',
              hasMany: true,
              admin: {
                description: 'Słowa kluczowe do filtrowania w bibliotece (np. fizjoterapia, sala).',
              },
            },
          ],
        },
        {
          label: 'Konwersja',
          fields: [
            {
              name: 'convertFormat',
              type: 'select',
              label: 'Format wyjściowy',
              defaultValue: 'optimized',
              options: [
                { label: 'Zoptymalizowany (WebP / WebM)', value: 'optimized' },
                { label: 'AVIF (tylko obrazy)', value: 'avif' },
                { label: 'Bez konwersji (oryginał)', value: 'original' },
              ],
              admin: {
                description:
                  'Stosowane przy uploadzie / wymianie pliku. Domyślnie WebP dla obrazów i WebM dla wideo.',
              },
            },
            {
              name: 'maxDimension',
              type: 'select',
              label: 'Maks. dłuższy bok',
              defaultValue: '1920',
              options: [
                { label: '1920 px (zalecane)', value: '1920' },
                { label: '1280 px (lżejsze)', value: '1280' },
                { label: '2560 px (retina / hero)', value: '2560' },
                { label: 'Bez zmiany rozmiaru', value: 'none' },
              ],
              admin: {
                description:
                  'Skalowanie obrazów przed zapisem (ignorowane dla wideo). 1920 px to dobry kompromis jakość/waga.',
              },
            },
            {
              name: 'imageQuality',
              type: 'select',
              label: 'Jakość obrazu',
              defaultValue: 'balanced',
              options: [
                { label: 'Zrównoważona (82)', value: 'balanced' },
                { label: 'Wysoka (90)', value: 'high' },
                { label: 'Mały plik (70)', value: 'small' },
              ],
              admin: {
                description: 'Dotyczy konwersji WebP / AVIF (ignorowane przy „bez konwersji”).',
                condition: (_, siblingData) => siblingData?.convertFormat !== 'original',
              },
            },
          ],
        },
        {
          label: 'Klasyfikacja',
          fields: [
            {
              name: 'kind',
              type: 'select',
              label: 'Typ',
              defaultValue: 'other',
              index: true,
              options: [
                { label: 'Obraz', value: 'image' },
                { label: 'Wideo', value: 'video' },
                { label: 'Dokument', value: 'document' },
                { label: 'Inne', value: 'other' },
              ],
              admin: {
                description: 'Ustawiane automatycznie z MIME; używane do folderów w bibliotece.',
                position: 'sidebar',
              },
            },
          ],
        },
      ],
    },
  ],
  // Low-quality image placeholder, as a base64 data URI, for `next/image`'s
  // `placeholder="blur"`. The reference site ships one of these per image in its own
  // metadata, so the imported posts get theirs for free; see
  // `scripts/import-blur-placeholders.ts`. Anything uploaded later simply has none, and
  // `next/image` falls back to no placeholder.
  //
  // Read-only in the panel: it is derived data, and a 300-character data URI in an editable
  // field is only ever going to be pasted over by accident.
  upload: {
    mimeTypes: ['image/*', 'video/*', 'application/pdf'],
    // Payload generates these with sharp on upload, so the frontend can ask for a size
    // near what it actually renders instead of pulling the full original. Widths are
    // matched to the real slots: `thumbnail` for admin lists, `card` for the blog
    // listing grid, `content` for in-article images, `hero` for full-bleed.
    // `withoutEnlargement` keeps a small upload from being blown up into a bigger file.
    //
    // **The names are load-bearing.** The media-library branch renamed these to
    // `thumb`/`card`/`large`; kept as they are, because `mediaFrom(..., 'card' | 'content' |
    // 'hero')` looks them up by name across the site and 230 existing media rows already
    // have these variants on disk. `mediaThumbUrl` in the library UI was pointed at
    // `thumbnail` instead. The `admin` flags below come from that branch, they keep the
    // generated sizes out of the admin list's columns, filters and grouping.
    displayPreview: true,
    crop: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        withoutEnlargement: true,
        formatOptions: { format: 'webp', options: { quality: 78 } },
        admin: { disableGroupBy: true, disableListColumn: true, disableListFilter: true },
      },
      {
        name: 'card',
        width: 768,
        withoutEnlargement: true,
        formatOptions: { format: 'webp', options: { quality: 80 } },
        admin: { disableGroupBy: true, disableListColumn: true, disableListFilter: true },
      },
      {
        // The blog grid's tile is 16:9 with `object-cover`, and a portrait photograph put in it
        // downloads its full height only to have most of it cropped away by the browser.
        // Measured: **17 of 62 featured images are portrait or square, discarding an average of
        // 51% of their bytes**, the worst of them 63%. `sizes` cannot help, because the wasted
        // pixels are height, so the crop has to happen before the file is served.
        //
        // Both dimensions are set, which is what makes Payload crop rather than scale, and it
        // positions the crop using the document's focal point when one is set.
        name: 'cardWide',
        // 960x540 and not 768x432: the widest 16:9 tile on the site is the listing grid's 480 CSS
        // px, which a 2x screen needs 960 device pixels to fill. 768 would have been serving a
        // soft tile to fix a heavy one.
        width: 960,
        height: 540,
        fit: 'cover',
        withoutEnlargement: true,
        formatOptions: { format: 'webp', options: { quality: 80 } },
        // Named rather than left to Payload's `<base>-<width>x<height>` convention, because a
        // source that is already 16:9 makes `card` (768 wide) come out 768x432 as well and the
        // two would fight over one filename. `scripts/backfill-image-sizes.ts` writes the same
        // name, so a backfilled file and a freshly uploaded one agree.
        generateImageName: ({ originalName, extension }) => `${originalName}-card16x9.${extension}`,
        admin: { disableGroupBy: true, disableListColumn: true, disableListFilter: true },
      },
      {
        name: 'content',
        width: 1200,
        withoutEnlargement: true,
        formatOptions: { format: 'webp', options: { quality: 80 } },
        admin: { disableGroupBy: true, disableListColumn: true, disableListFilter: true },
      },
      {
        name: 'hero',
        width: 1920,
        withoutEnlargement: true,
        formatOptions: { format: 'webp', options: { quality: 82 } },
        admin: { disableGroupBy: true, disableListColumn: true, disableListFilter: true },
      },
    ],
    adminThumbnail: 'thumbnail',
    focalPoint: true,
  },
}
