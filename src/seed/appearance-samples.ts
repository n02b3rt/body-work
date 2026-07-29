/**
 * Seeds a few example compositions for "Wygląd → Komponenty".
 *
 * They are what the collection holds now: named *arrangements of elements*, to
 * be dropped into a page as one item. The element library itself needs no
 * seeding — it is config, not data.
 *
 * Idempotent: documents are matched by slug and updated in place.
 *
 * Run with: pnpm seed:appearance
 */

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { Payload } from 'payload'

type SampleData = Record<string, unknown>

async function upsert(payload: Payload, slug: string, data: SampleData) {
  const existing = await payload.find({
    collection: 'site-components',
    depth: 0,
    limit: 1,
    where: { slug: { equals: slug } },
  })

  if (existing.docs[0]) {
    const doc = await payload.update({
      collection: 'site-components',
      id: existing.docs[0].id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- sample payloads are typed by the collection at runtime
      data: data as any,
      depth: 0,
    })
    payload.logger.info(`Zaktualizowano komponent: ${slug}`)
    return doc
  }

  const doc = await payload.create({
    collection: 'site-components',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- sample payloads are typed by the collection at runtime
    data: { ...data, slug } as any,
    depth: 0,
  })
  payload.logger.info(`Utworzono komponent: ${slug}`)
  return doc
}

const payload = await getPayload({ config: configPromise })

await upsert(payload, 'cta-bezplatna-konsultacja', {
  name: 'CTA: bezpłatna konsultacja',
  category: 'cta',
  description: 'Pasek z zachętą i przyciskiem do formularza kontaktowego.',
  content: [
    {
      blockType: 'cta',
      heading: 'Umów bezpłatną konsultację',
      text: 'Opowiedz nam, co Ci dolega. Dobierzemy terapię i termin.',
      align: 'center',
      padding: 'md',
      buttons: [{ label: 'Napisz do nas', href: '/kontakt', variant: 'solid' }],
    },
  ],
})

await upsert(payload, 'zdjecie-i-tekst', {
  name: 'Zdjęcie + tekst (2 kolumny)',
  category: 'section',
  description: 'Klasyczny układ: zdjęcie po lewej, nagłówek z opisem i przyciskiem po prawej.',
  content: [
    {
      blockType: 'columns',
      gap: 'lg',
      stackOn: 'mobile',
      verticalAlign: 'center',
      columns: [
        {
          weight: '1',
          content: [
            {
              blockType: 'image',
              aspectRatio: '4-3',
              radius: 'md',
              caption: 'Podmień zdjęcie na własne',
            },
          ],
        },
        {
          weight: '1',
          content: [
            { blockType: 'heading', text: 'Terapia dobrana do Ciebie', level: 'h2', size: 'lg' },
            {
              blockType: 'iconList',
              columns: '1',
              items: [
                { icon: 'check', text: 'Diagnoza na pierwszej wizycie' },
                { icon: 'check', text: 'Plan terapii na piśmie' },
                { icon: 'check', text: 'Kontakt z terapeutą między wizytami' },
              ],
            },
            {
              blockType: 'buttons',
              items: [{ label: 'Zobacz cennik', href: '/cennik', variant: 'outline' }],
            },
          ],
        },
      ],
    },
  ],
})

await upsert(payload, 'trzy-korzysci', {
  name: 'Trzy korzyści (karty)',
  category: 'card',
  description: 'Rząd trzech kart z ikoną, tytułem i krótkim opisem.',
  content: [
    {
      blockType: 'features',
      columns: '3',
      gap: 'md',
      cardAlign: 'left',
      items: [
        {
          icon: 'shield',
          title: 'Doświadczony zespół',
          text: 'Fizjoterapeuci z wieloletnią praktyką kliniczną.',
        },
        {
          icon: 'clock',
          title: 'Terminy bez kolejek',
          text: 'Wizytę umówisz zwykle w ciągu kilku dni.',
        },
        {
          icon: 'sparkle',
          title: 'Nowoczesny sprzęt',
          text: 'Diagnostyka i terapia w jednym miejscu.',
        },
      ],
    },
  ],
})

payload.logger.info('Gotowe: przykładowe komponenty zapisane.')
process.exit(0)
