import type { CollectionBeforeOperationHook, CollectionConfig } from 'payload'

import { isAdministrator, isModerator, staff } from '@/access/roles'
import { compressUploadFile } from '@/lib/compress-media'

const compressOnUpload: CollectionBeforeOperationHook = async ({ req, operation }) => {
  if (operation !== 'create' && operation !== 'update') return
  if (!req.file?.data) return

  try {
    const compressed = await compressUploadFile({
      data: req.file.data as Buffer,
      mimetype: req.file.mimetype,
      name: req.file.name,
      size: req.file.size,
    })
    req.file.data = compressed.data
    req.file.mimetype = compressed.mimetype
    req.file.name = compressed.name
    req.file.size = compressed.size
  } catch (error) {
    req.payload.logger.error({ err: error }, 'Media compression failed; keeping original file')
  }
}

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Plik mediów',
    plural: 'Media',
  },
  admin: {
    group: 'Treści',
    description: 'Biblioteka mediów. Obrazy zapisywane jako WebP, wideo jako WebM.',
    defaultColumns: ['filename', 'alt', 'mimeType', 'updatedAt'],
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
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Tekst alternatywny',
      required: true,
      admin: {
        description: 'Krótki opis obrazu (dostępność i SEO).',
      },
    },
  ],
  upload: {
    mimeTypes: ['image/*', 'video/*', 'application/pdf'],
    // Payload generates these with sharp on upload, so the frontend can ask for a size
    // near what it actually renders instead of pulling the full original. Widths are
    // matched to the real slots: `thumbnail` for admin lists, `card` for the blog
    // listing grid, `content` for in-article images, `hero` for full-bleed.
    // `withoutEnlargement` keeps a small upload from being blown up into a bigger file.
    imageSizes: [
      { name: 'thumbnail', width: 400, withoutEnlargement: true, formatOptions: { format: 'webp', options: { quality: 78 } } },
      { name: 'card', width: 768, withoutEnlargement: true, formatOptions: { format: 'webp', options: { quality: 80 } } },
      { name: 'content', width: 1200, withoutEnlargement: true, formatOptions: { format: 'webp', options: { quality: 80 } } },
      { name: 'hero', width: 1920, withoutEnlargement: true, formatOptions: { format: 'webp', options: { quality: 82 } } },
    ],
    adminThumbnail: 'thumbnail',
    focalPoint: true,
  },
}
