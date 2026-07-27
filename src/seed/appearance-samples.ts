/**
 * Seeds a few example components for "Wygląd → Komponenty".
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

// Reuse whatever images already live in the media library.
const images = await payload.find({
  collection: 'media',
  depth: 0,
  limit: 6,
  where: { kind: { equals: 'image' } },
})
const imageIds = images.docs.map((doc) => doc.id)
const imageAt = (index: number) => imageIds[index % (imageIds.length || 1)] ?? null

const bookButton = await upsert(payload, 'przycisk-rezerwacja', {
  name: 'Przycisk — Zarezerwuj wizytę',
  type: 'button',
  description: 'Główne wezwanie do działania, używane w hero i na podstronach oferty.',
  button: {
    label: 'Zarezerwuj wizytę',
    href: '/kontakt',
    newTab: false,
    variant: 'solid',
    size: 'lg',
    radius: 'full',
    fullWidth: false,
    background: { token: 'brand.primary' },
    textColor: { token: 'text.inverted' },
    borderColor: { token: 'none' },
  },
})

const priceButton = await upsert(payload, 'przycisk-cennik', {
  name: 'Przycisk — Zobacz cennik',
  type: 'button',
  description: 'Wariant obramowany na ciemnym tle (pasek CTA).',
  button: {
    label: 'Zobacz cennik',
    href: '/cennik',
    newTab: false,
    variant: 'outline',
    size: 'md',
    radius: 'full',
    fullWidth: false,
    background: { token: 'brand.accent' },
    textColor: { token: 'text.inverted' },
    borderColor: { token: 'brand.accent' },
  },
})

await upsert(payload, 'hero-strona-glowna', {
  name: 'Hero — strona główna',
  type: 'hero',
  description: 'Sekcja otwierająca stronę główną.',
  hero: {
    image: imageAt(0),
    heading: 'Wróć do formy z BodyWork Centrum',
    subheading:
      'Fizjoterapia, dietetyka, masaż i trening personalny w jednym miejscu. Zespół specjalistów prowadzi Cię od diagnozy po powrót do pełnej sprawności.',
    height: 'lg',
    align: 'center',
    overlayOpacity: 55,
    radius: 'md',
    textColor: { token: 'text.inverted' },
    ctaButton: bookButton.id,
  },
})

await upsert(payload, 'karuzela-gabinet', {
  name: 'Karuzela — nasz gabinet',
  type: 'carousel',
  description: 'Zdjęcia wnętrz na stronie „O nas”.',
  carousel: {
    slides: [
      { image: imageAt(0), caption: 'Sala fizjoterapii' },
      { image: imageAt(1), caption: 'Strefa treningu funkcjonalnego' },
      { image: imageAt(2), caption: 'Gabinet masażu' },
    ].filter((slide) => slide.image !== null),
    slidesPerView: '1',
    aspectRatio: '16-9',
    radius: 'md',
    gap: 'md',
    autoplay: true,
    interval: 6,
    showArrows: true,
    showDots: true,
    loop: true,
  },
})

await upsert(payload, 'galeria-zespol', {
  name: 'Galeria — zespół',
  type: 'gallery',
  description: 'Siatka zdjęć specjalistów na podstronie zespołu.',
  gallery: {
    images: imageIds.slice(0, 6),
    columns: '3',
    gap: 'md',
    aspectRatio: '1-1',
    radius: 'md',
    lightbox: true,
    showCaptions: true,
  },
})

await upsert(payload, 'cta-konsultacja', {
  name: 'CTA — bezpłatna konsultacja',
  type: 'cta',
  description: 'Pasek zachęty pod treścią artykułów i stron oferty.',
  cta: {
    heading: 'Nie wiesz, którą terapię wybrać?',
    text: 'Umów bezpłatną konsultację wstępną — dobierzemy plan leczenia i treningu do Twoich celów.',
    align: 'center',
    padding: 'lg',
    background: { token: 'brand.secondary' },
    textColor: { token: 'text.inverted' },
    radius: 'lg',
    button: priceButton.id,
  },
})

await upsert(payload, 'karty-korzysci', {
  name: 'Karty — dlaczego BodyWork',
  type: 'features',
  description: 'Trzy karty z przewagami centrum, na stronie głównej.',
  features: {
    items: [
      {
        title: 'Diagnoza, nie zgadywanie',
        text: 'Każdą terapię zaczynamy od badania funkcjonalnego i planu na piśmie.',
        image: imageAt(0),
      },
      {
        title: 'Jeden zespół, wiele dziedzin',
        text: 'Fizjoterapeuta, dietetyk i trener pracują na wspólnym celu pacjenta.',
        image: imageAt(1),
      },
      {
        title: 'Opieka między wizytami',
        text: 'Dostajesz zestaw ćwiczeń i kontakt do prowadzącego specjalisty.',
        image: imageAt(2),
      },
    ],
    columns: '3',
    gap: 'md',
    cardBackground: { token: 'surface.surface' },
    cardBorder: { token: 'surface.border' },
    titleColor: { token: 'text.heading' },
    radius: 'md',
  },
})

payload.logger.info('Przykładowe komponenty gotowe.')
process.exit(0)
