import test from 'node:test'
import assert from 'node:assert/strict'

import { hubJsonLd, toE164, type HubJsonLdInput } from '../src/lib/hub-jsonld.ts'

const input: HubJsonLdInput = {
  locale: 'pl',
  hubUrl: 'https://body-work.pl',
  pageUrl: 'https://body-work.pl/',
  centrumUrl: 'https://centrum.body-work.pl/',
  academyUrl: 'https://akademia.body-work.pl',
  alfabetRuchuUrl: 'https://alfabetruchu.podia.com/',
  title: 'BODYWORK',
  description: 'Opis',
  logo: '/icons/logo.svg',
  image: '/images/og/hub.jpg',
  sameAs: ['https://www.facebook.com/bodyworkpl/'],
  contact: {
    streetAddress: 'ul. Kajki 14',
    postalCode: '60-573',
    city: 'Poznań',
    phone: '609 805 660',
    email: 'info@body-work.pl',
    trainingPhone: '609 805 678',
    trainingEmail: 'szkolenia@body-work.pl',
    latitude: 52.4182498,
    longitude: 16.8907633,
    mapUrl: 'https://maps.example/bodywork',
  },
  destinations: {
    centrum: { name: 'Centrum BODYWORK', description: 'a' },
    academy: { name: 'Akademia Szkoleniowa', description: 'b' },
    alfabetRuchu: { name: 'Alfabet Ruchu', description: 'c' },
  },
  faq: [{ question: 'Gdzie?', answer: 'W Poznaniu.' }],
}

type Node = Record<string, unknown>
const graph = () => (hubJsonLd(input)['@graph'] as Node[])
const byType = (type: string) => graph().filter((node) => node['@type'] === type)

test('phone numbers come out in E.164, with or without a country code', () => {
  assert.equal(toE164('609 805 660'), '+48609805660')
  assert.equal(toE164('+48 609 805 660'), '+48609805660')
})

test('Centrum reuses the @id its own pages declare, so crawlers merge the two', () => {
  // `structured-data.ts` declares `${SITE_URL}/#business`; a trailing slash on the
  // env var must not turn that into a second, unrelated business.
  const [centrum] = byType('HealthAndBeautyBusiness')
  assert.equal(centrum['@id'], 'https://centrum.body-work.pl/#business')
})

test('every sub-organisation the umbrella names is defined in the graph', () => {
  const [org] = byType('Organization')
  const ids = new Set(graph().map((node) => node['@id']))
  for (const ref of org.subOrganization as { '@id': string }[]) {
    assert.ok(ids.has(ref['@id']), `${ref['@id']} is referenced but not defined`)
  }
})

test('relative images become absolute on the hub origin', () => {
  const [org] = byType('Organization')
  assert.equal(org.image, 'https://body-work.pl/images/og/hub.jpg')
  assert.deepEqual(org.logo, { '@type': 'ImageObject', url: 'https://body-work.pl/icons/logo.svg' })
})

test('the FAQ carries each answer, and disappears when there are no questions', () => {
  const [faq] = byType('FAQPage')
  assert.deepEqual(faq.mainEntity, [
    { '@type': 'Question', name: 'Gdzie?', acceptedAnswer: { '@type': 'Answer', text: 'W Poznaniu.' } },
  ])
  const empty = hubJsonLd({ ...input, faq: [] })['@graph'] as Node[]
  assert.equal(empty.filter((node) => node['@type'] === 'FAQPage').length, 0)
})
