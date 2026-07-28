import type { CollectionConfig } from 'payload'

import { isAdministrator, isModerator, staff } from '@/access/roles'

/**
 * English versions of blog posts, one document per post.
 *
 * **Why a collection rather than `localized: true` on Posts.** `docs/i18n.md` settles on
 * Payload's field-level localisation for CMS content, and that remains the right long-term
 * answer. Turning it on for an existing table is the problem: it moves every localised column
 * into a `_locales` table, and the dev-mode schema push asks for confirmation before a
 * destructive change. With no TTY it simply hangs, which is exactly what happened here, twice,
 * for ten minutes. Nothing was lost (there was a backup, and the data was verified intact
 * afterwards), but doing it safely on 62 imported posts needs a written migration and a
 * maintenance window, not a dev push.
 *
 * This gets the same outcome with no schema surgery: an editor opens "Tłumaczenia wpisów",
 * picks a post, and writes the English version. `/en/blog/...` reads from here.
 *
 * **The fallback rule from `docs/i18n.md` is enforced, not softened.** A post with no
 * translation, or one still marked as a draft translation, does not exist in English: the page
 * 404s and the English listing omits it. Serving Polish prose under an English URL is worse
 * than not having the page, and it is what the site did before this collection existed.
 *
 * If the localised-fields migration is ever done properly, this collection is the source to
 * migrate *from*, and it can be dropped afterwards.
 */
export const PostTranslations: CollectionConfig = {
  slug: 'post-translations',
  labels: {
    singular: 'Tłumaczenie wpisu',
    plural: 'Tłumaczenia wpisów',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['post', 'title', 'status', 'updatedAt'],
    group: 'Treści',
    description:
      'Angielskie wersje wpisów. Wpis bez gotowego tłumaczenia nie pojawia się na /en, zamiast pokazywać polski tekst pod angielskim adresem.',
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
  fields: [
    {
      name: 'post',
      type: 'relationship',
      relationTo: 'posts',
      required: true,
      unique: true,
      label: 'Wpis',
      admin: {
        description: 'Który wpis tłumaczysz. Jeden wpis ma najwyżej jedno tłumaczenie.',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      label: 'Status',
      options: [
        { label: 'Szkic, nie publikuj', value: 'draft' },
        { label: 'Gotowe, publikuj na /en', value: 'published' },
      ],
      admin: {
        position: 'sidebar',
        description:
          'Dopóki jest szkicem, wpis nie pojawia się w wersji angielskiej. Nic nie zostanie opublikowane przypadkiem.',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Tytuł (EN)',
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Zajawka (EN)',
      admin: {
        description: 'Krótki opis na liście wpisów i w wynikach wyszukiwania.',
      },
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Treść (EN)',
      admin: {
        description:
          'Startuje jako kopia polskiej treści, razem ze zdjęciami i układem. Nadpisz sam tekst, zdjęć nie trzeba wstawiać od nowa ani ruszać.',
      },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, operation, req }) => {
        if (operation !== 'create' || !data) return data
        // Only when the editor has not written anything yet.
        if (data.content || !data.post) return data

        const postId = typeof data.post === 'object' ? data.post?.id : data.post
        if (!postId) return data

        /**
         * A new translation opens as a copy of the Polish body.
         *
         * Without this the editor starts from an empty rich-text field, and any image the
         * article had is simply gone from the English version: which is exactly what happened
         * to the first translation written here. Copying the body means the pictures and the
         * order of things survive, and translating becomes overwriting text in place.
         */
        const post = await req.payload
          .findByID({ collection: 'posts', id: postId, depth: 0, overrideAccess: true })
          .catch(() => null)

        if (post?.content) data.content = post.content

        return data
      },
    ],
  },
  timestamps: true,
}
