/**
 * Creates one complete English translation, as a worked example of the workflow.
 *
 * Run with: `pnpm payload run scripts/seed-translation-example.ts`
 *
 * The point is not this one article. It is that an editor can open "Tłumaczenia wpisów" in the
 * panel, see what a finished one looks like, and copy the shape for the next. Everything here
 * is doable by hand in the admin UI; the script exists so the example is reproducible and so
 * `/en/blog` is not empty while the rest are still Polish.
 *
 * The remaining 61 are deliberately left alone. Machine-translating that much physiotherapy
 * advice with nobody to review it is not something to ship quietly; see the note in
 * `docs/i18n.md`.
 */
import { getPayload } from 'payload'
import config from '@payload-config'

const SLUG = 'czy-to-na-pewno-rwa-kulszowa'

const TITLE = 'Is it really sciatica?'

const EXCERPT =
  'Have you ever felt your buttock go numb during or after a long drive? Or noticed, with some alarm, numbness running down your leg that you associate with long hours at a desk?'

const PARAGRAPHS = [
  'Have you ever felt your buttock go numb during or after a long drive? Or noticed, with some alarm, numbness running down your leg that you associate with long hours at a desk? You can probably breathe a sigh of relief, because most often these symptoms are not caused by a problem with a "disc", by the sacroiliac joint, or even by damage to the sciatic nerve.',
  'There is one more structure in that area, and it is behind the whole confusion: the gluteal fascia, along with its network of receptors and fibrous connections to the muscles, nerves, vessels, organs and bones that it surrounds and passes through.',
  'Pain around the buttock does not have to mean genuine sciatica. More than that, its source may not even be in the buttock. How is that possible?',
  'Let us try a small experiment.',
  'Picture a tablecloth lying on a table. You pinch it anywhere you like with your fingertips, then start lifting it and pulling it sideways. Do the creases appear only where you are holding it? By pulling in different directions, can you put the fabric under tension somewhere else entirely? Now take your other hand and pull at that distant point. Does the cloth not try to escape from under the fingers that were holding it first?',
  'The same happens with our fascia, because it is a network of tissues that act on one another, connected and interdependent, forming a complex whole and working together during movement. Seen that way it is not hard to imagine how a single problem, specifically a restriction (which is what our fingers holding the tablecloth were), can produce pain somewhere entirely different.',
  'A simple example is the connection between the gluteal fascia and the thoracolumbar fascia (the latter provides 80% of the spine’s stability). Their pulling on one another, meaning a restriction appearing in either area, can produce symptoms that mimic back pain or sciatica, and even numbness in the feet.',
  'So is irritation of the sciatic nerve or of the nerve roots still the only possible source of pain around the buttock, often radiating down the limb? Definitely not.',
  'This is why, rather than relying on pharmacotherapy, which does not relieve this kind of pain, it is worth undergoing fascial therapy (fascial manipulation, for instance) and then making sure you get an appropriate amount of movement.',
]

function paragraph(text: string) {
  return {
    type: 'paragraph',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    textFormat: 0,
    children: [
      {
        type: 'text',
        detail: 0,
        format: 0,
        mode: 'normal',
        style: '',
        text,
        version: 1,
      },
    ],
  }
}

const content = {
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: PARAGRAPHS.map(paragraph),
  },
}

const payload = await getPayload({ config })

const found = await payload.find({
  collection: 'posts',
  where: { slug: { equals: SLUG } },
  limit: 1,
  overrideAccess: true,
})

const post = found.docs[0]
if (!post) {
  console.error(`No post with slug ${SLUG}`)
  process.exit(1)
}

const existing = await payload.find({
  collection: 'post-translations',
  where: { post: { equals: post.id } },
  limit: 1,
  overrideAccess: true,
})

const data = {
  post: post.id,
  status: 'published' as const,
  title: TITLE,
  excerpt: EXCERPT,
  content: content as never,
}

if (existing.docs[0]) {
  await payload.update({
    collection: 'post-translations',
    id: existing.docs[0].id,
    data,
    overrideAccess: true,
  })
  console.log(`updated the translation of ${SLUG}`)
} else {
  await payload.create({ collection: 'post-translations', data, overrideAccess: true })
  console.log(`created a translation of ${SLUG}`)
}

const total = await payload.count({ collection: 'post-translations', overrideAccess: true })
const posts = await payload.count({ collection: 'posts', overrideAccess: true })
console.log(`translations: ${total.totalDocs} of ${posts.totalDocs} posts`)

process.exit(0)
