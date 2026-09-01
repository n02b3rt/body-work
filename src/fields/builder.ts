/**
 * The two fields every builder-backed document carries: the tree itself, and the
 * derived list of saved components it references.
 *
 * `builder` replaces both the old `layout` (blocks) and, on `pages`/`posts`, the
 * plain-text `content` (richText) field. One factory, not three copies, because
 * `pages`, `posts` and `site-components` all need the identical shape and the
 * identical "open in the editor instead" admin component.
 *
 * The field type is `json`: Payload stores it as a single `jsonb` column rather
 * than a table per block type, which is what lets a `container` node hold
 * another `container` node without hitting Payload's "a block cannot reference
 * itself" limit that capped the previous builder at one level of nesting.
 */

import type { JSONField, TextField } from 'payload'

import { coerceBuilderDoc, emptyBuilderDoc } from '@/lib/builder/types'

export function builderField(): JSONField {
  return {
    name: 'builder',
    type: 'json',
    label: 'Układ',
    defaultValue: emptyBuilderDoc,
    admin: {
      description: 'Edytowany w kreatorze pełnoekranowym, nie tutaj.',
      components: {
        Field: '/components/admin/builder-link/OpenInBuilder#OpenInBuilder',
      },
    },
    // `json` fields do not sanitize their own contents; a value saved by anything
    // other than the builder (an import script, a stale draft) must not crash the
    // renderer, so every reader goes through `coerceBuilderDoc` rather than trusting
    // the stored shape.
    validate: (value: unknown) => {
      if (value === null || value === undefined) return true
      return coerceBuilderDoc(value) !== null || 'Nieprawidłowa struktura układu.'
    },
  }
}

/**
 * Ids of `site-components` documents this document references in reference mode
 * (as opposed to copied-in composition subtrees, which carry no reference at
 * all). Written by a `beforeChange` hook that walks `builder`, not by hand: it
 * exists so a saved component's own `afterChange` hook knows which pages and
 * posts to revalidate, and so its edit view can show "used on N pages".
 */
export function componentRefsField(): TextField {
  return {
    name: 'componentRefs',
    type: 'text',
    hasMany: true,
    admin: { hidden: true },
  }
}
