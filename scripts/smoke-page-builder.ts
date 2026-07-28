/**
 * End-to-end check for the page builder: writes a page whose layout places
 * several components from "Wygląd → Komponenty", then reads it back the way the
 * public route does and asserts the sections resolve.
 *
 * Self-cleaning: the page it creates is deleted at the end, so running it twice
 * leaves the database as it found it.
 *
 * Run with: pnpm smoke:builder
 */

import configPromise from '@payload-config'
import { getPayload } from 'payload'

// The `@/` alias, not a relative `../src/…` path: `payload run` rewrites aliased
// imports but leaves relative ones outside its root alone, and a file reached
// that way fails to resolve `@payload-config` and kills the process with no
// output and exit code 0.
import { findPublishedPage, pagePath } from '@/lib/cms-page'

const SLUG = 'smoke-kreator-stron'

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

async function main() {
  console.log('Łączę z bazą…')
  const payload = await getPayload({ config: configPromise })
  console.log('Połączono.')

  const components = await payload.find({
    collection: 'site-components',
    depth: 0,
    limit: 50,
  })

  if (components.docs.length === 0) {
    console.log('Brak komponentów w bibliotece. Uruchom najpierw: pnpm seed:appearance')
    process.exit(1)
  }

  const pick = (type: string) => components.docs.find((doc) => doc.type === type)
  const hero = pick('hero')
  const cta = pick('cta')
  const features = pick('features')
  const placed = [hero, cta, features].filter(Boolean)

  console.log(`Biblioteka: ${components.docs.length} komponentów, wstawiam ${placed.length}`)

  // Clean up a leftover from an interrupted run before creating a new one.
  const existing = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 1,
    where: { slug: { equals: SLUG } },
  })
  if (existing.docs[0]) {
    await payload.delete({ collection: 'pages', id: existing.docs[0].id })
  }

  const created = await payload.create({
    collection: 'pages',
    data: {
      title: 'Smoke: kreator stron',
      slug: SLUG,
      _status: 'published',
      layout: [
        ...(hero
          ? [{ component: hero.id, width: 'full' as const, spacing: 'none' as const }]
          : []),
        ...(features
          ? [
              {
                component: features.id,
                width: 'container' as const,
                spacing: 'lg' as const,
                anchor: 'Korzyści dla Ciebie!',
                background: { token: 'surface.surfaceAlt' as const },
              },
            ]
          : []),
        ...(cta
          ? [
              {
                component: cta.id,
                width: 'narrow' as const,
                spacing: 'md' as const,
                hidden: true,
              },
            ]
          : []),
      ],
    },
  })

  console.log(`\nUtworzono stronę ${created.id} pod ścieżką ${pagePath(created)}`)

  console.log('\nOdczyt tak, jak robi to trasa publiczna:')
  const path = pagePath(created)
  const found = await findPublishedPage(path)

  check('strona znaleziona po ścieżce', found !== null)
  check(
    'liczba sekcji zgadza się z zapisaną',
    (found?.layout?.length ?? 0) === placed.length,
    `${found?.layout?.length} != ${placed.length}`,
  )

  const first = found?.layout?.[0]
  check(
    'komponent sekcji jest rozwinięty (depth 2), nie samym id',
    Boolean(first && typeof first.component === 'object'),
  )

  if (first && typeof first.component === 'object' && first.component) {
    const doc = first.component as unknown as Record<string, unknown>
    const type = String(doc.type)
    check(`ustawienia typu "${type}" są obecne`, doc[type] !== undefined)

    // depth 2 has to reach inside the component, or media renders as a bare id.
    if (type === 'hero') {
      const settings = doc.hero as Record<string, unknown>
      const image = settings?.image
      check(
        'zdjęcie w hero jest rozwinięte do dokumentu media',
        image === null || image === undefined || typeof image === 'object',
        `typeof image = ${typeof image}`,
      )
    }
  }

  check('ukryta sekcja nadal jest w danych', found?.layout?.some((row) => row.hidden === true) ?? false)

  const wrongPath = await findPublishedPage('/nie-ma-takiej-strony-smoke')
  check('nieistniejąca ścieżka zwraca null', wrongPath === null)

  // A page saved as a draft must not be readable by the public route.
  await payload.update({
    collection: 'pages',
    id: created.id,
    data: { _status: 'draft' },
    draft: true,
  })
  const asDraft = await findPublishedPage(path)
  check('szkic nie jest publikowany', asDraft === null)

  await payload.delete({ collection: 'pages', id: created.id })
  const afterDelete = await findPublishedPage(path)
  check('po usunięciu strony ścieżka jest wolna', afterDelete === null)

  console.log(`\n${passed} przeszło, ${failed} nie przeszło`)
  process.exit(failed > 0 ? 1 : 0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
