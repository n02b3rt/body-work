/**
 * End-to-end check for the page builder: writes a saved composition and a page
 * whose sections hold elements from the library, then reads the page back the
 * way the public route does and asserts everything resolves.
 *
 * Self-cleaning: both documents are deleted at the end, so running it twice
 * leaves the database as it found it.
 *
 * Run with: pnpm smoke:builder
 */

import { getPayload } from 'payload'

// The `@/` alias, not a relative `../src/…` path: `payload run` rewrites aliased
// imports but leaves relative ones outside its root alone, and a file reached
// that way fails to resolve `@payload-config` and kills the process with no
// output and exit code 0.
import { findPublishedPage, pagePath } from '@/lib/cms-page'

const PAGE_SLUG = 'smoke-kreator-stron'
const COMPONENT_NAME = 'Smoke: złożenie testowe'

let passed = 0
let failed = 0

function check(label: string, condition: boolean, detail?: string) {
  if (condition) {
    passed += 1
    console.log(`  ok   ${label}`)
  } else {
    failed += 1
    console.log(`  FAIL ${label}${detail ? `: ${detail}` : ''}`)
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

/**
 * **Top-level `await`, not an async `main()`.**
 *
 * Wrapped in a function, `payload run` lets the module finish evaluating while
 * the promise is still pending, Node finds no open handle, and the process exits
 * with **code 0 having printed only the first line** — which reads exactly like
 * a script that ran and did nothing. `src/seed/appearance-samples.ts` has always
 * been written this way; this file was not, and it cost hours. Everything below
 * therefore runs at module scope.
 */
console.log('Łączę z bazą…')

const { default: config } = await import('@payload-config')
const payload = await getPayload({ config })
console.log('Połączono.')

// A picture, if the library has one: it is what proves population reached
// inside the blocks rather than stopping at the section.
const media = await payload.find({ collection: 'media', depth: 0, limit: 1 })
const image = media.docs[0]?.id
console.log(image ? `Używam zdjęcia ${image}` : 'Brak mediów: pomijam sprawdzenie zdjęć')

// Clean up leftovers from an interrupted run.
for (const [collection, where] of [
  ['pages', { slug: { equals: PAGE_SLUG } }],
  ['site-components', { name: { equals: COMPONENT_NAME } }],
] as const) {
  const existing = await payload.find({ collection, depth: 0, limit: 5, where })
  for (const doc of existing.docs) {
    await payload.delete({ collection, id: doc.id })
  }
}

const composition = await payload.create({
  collection: 'site-components',
  data: {
    name: COMPONENT_NAME,
    slug: 'smoke-zlozenie-testowe',
    category: 'cta',
    content: [
      {
        blockType: 'cta',
        heading: 'Umów bezpłatną konsultację',
        text: 'Zadzwoń albo napisz, dobierzemy termin.',
        buttons: [{ label: 'Napisz do nas', href: '/kontakt' }],
      },
    ],
  },
})
console.log(`Utworzono złożenie ${composition.id}`)

const created = await payload.create({
  collection: 'pages',
  data: {
    title: 'Smoke: kreator stron',
    slug: PAGE_SLUG,
    _status: 'published',
    layout: [
      {
        name: 'Otwarcie',
        width: 'full',
        spacing: 'none',
        content: [
          {
            blockType: 'hero',
            heading: 'Wróć do formy',
            ...(image ? { image } : {}),
            style: { align: 'center' },
          },
        ],
      },
      {
        name: 'Dwie kolumny',
        width: 'container',
        spacing: 'lg',
        anchor: 'Korzyści dla Ciebie!',
        background: { token: 'surface.surfaceAlt' },
        content: [
          {
            blockType: 'columns',
            gap: 'lg',
            columns: [
              {
                weight: '1',
                content: image ? [{ blockType: 'image', image }] : [],
              },
              {
                weight: '2',
                content: [
                  { blockType: 'heading', text: 'Po lewej zdjęcie, po prawej tekst' },
                  { blockType: 'buttons', items: [{ label: 'Cennik', href: '/cennik' }] },
                ],
              },
            ],
          },
        ],
      },
      {
        name: 'Zapisany komponent',
        width: 'narrow',
        spacing: 'md',
        content: [{ blockType: 'savedComponent', component: composition.id }],
      },
      {
        name: 'Ukryta',
        hidden: true,
        content: [{ blockType: 'divider' }],
      },
    ],
  },
})

const path = pagePath(created)
console.log(`\nUtworzono stronę ${created.id} pod ścieżką ${path}`)

console.log('\nOdczyt tak, jak robi to trasa publiczna:')
const found = await findPublishedPage(path)

check('strona znaleziona po ścieżce', found !== null)
check('liczba sekcji zgadza się z zapisaną', (found?.layout?.length ?? 0) === 4)

const opening = asRecord(found?.layout?.[0])
const hero = asRecord((opening.content as unknown[])?.[0])
check('pierwsza sekcja zawiera element hero', hero.blockType === 'hero')

if (image) {
  check(
    'zdjęcie w hero jest rozwinięte do dokumentu media',
    typeof hero.image === 'object' && hero.image !== null,
    `typeof image = ${typeof hero.image}`,
  )
}

const columnsSection = asRecord(found?.layout?.[1])
const columns = asRecord((columnsSection.content as unknown[])?.[0])
check('druga sekcja zawiera element kolumn', columns.blockType === 'columns')
check(
  'kolumny mają zagnieżdżone elementy',
  Array.isArray(columns.columns) &&
    (columns.columns as Record<string, unknown>[]).some(
      (column) => Array.isArray(column.content) && column.content.length > 0,
    ),
)

const savedSection = asRecord(found?.layout?.[2])
const saved = asRecord((savedSection.content as unknown[])?.[0])
const savedDoc = asRecord(saved.component)
check('zapisany komponent jest rozwinięty do dokumentu', typeof savedDoc.id !== 'undefined')
check(
  'złożenie przyniosło własną treść',
  Array.isArray(savedDoc.content) && (savedDoc.content as unknown[]).length > 0,
)

check(
  'ukryta sekcja nadal jest w danych',
  found?.layout?.some((row) => row.hidden === true) ?? false,
)

const wrongPath = await findPublishedPage('/nie-ma-takiej-strony-smoke')
check('nieistniejąca ścieżka zwraca null', wrongPath === null)

/**
 * A page saved as a draft must not be readable by the public route.
 *
 * Note the missing `draft: true`: with that flag Payload writes a *new draft
 * version* and leaves the published row in the collection's own table, so the
 * page stays live. Unpublishing means updating the row itself.
 */
await payload.update({
  collection: 'pages',
  id: created.id,
  data: { _status: 'draft' },
})
check('szkic nie jest publikowany', (await findPublishedPage(path)) === null)

await payload.delete({ collection: 'pages', id: created.id })
await payload.delete({ collection: 'site-components', id: composition.id })
check('po usunięciu strony ścieżka jest wolna', (await findPublishedPage(path)) === null)

console.log(`\n${passed} przeszło, ${failed} nie przeszło`)
process.exit(failed > 0 ? 1 : 0)
