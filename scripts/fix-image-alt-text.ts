/**
 * Gives in-article images an alt text that says where in the article they sit.
 *
 * Run with: `pnpm payload run scripts/fix-image-alt-text.ts`
 * Preview only: `DRY=1 pnpm payload run scripts/fix-image-alt-text.ts`
 *
 * **Why this is not invention.** Every one of the reference's 572 content images ships with
 * no `alt` attribute at all, so there was nothing to import and no description to copy. The
 * import fell back to the post's title, which meant up to six images in one article all
 * announced the same sentence: for anyone using a screen reader that is worse than useless,
 * because it cannot tell them apart.
 *
 * So the alt becomes `"<post title>: <nearest heading above the image>"`. Every word of it is
 * already the client's own copy, taken from the article the image lives in, and it does what
 * an alt is for here: it locates the image. Writing what each photograph actually depicts
 * needs eyes on the photograph, which is an editorial job; `scripts/content-health.ts` lists
 * what is still outstanding.
 *
 * Safe to run per-image because no media document is used by more than one post (checked:
 * 150 in-content images, 150 distinct documents).
 */
import { getPayload } from 'payload'
import config from '@payload-config'

const DRY = process.env.DRY === '1' || process.env.DRY === 'true'

type Node = {
  type?: string
  text?: string
  children?: Node[]
  value?: unknown
}

function textOf(node: Node): string {
  if (typeof node.text === 'string') return node.text
  return (node.children ?? []).map(textOf).join('')
}

function squash(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

/** Cut at a word boundary rather than mid-word, and only if there is something to cut. */
function clip(value: string, max: number) {
  if (value.length <= max) return value
  const cut = value.slice(0, max)
  const space = cut.lastIndexOf(' ')
  return (space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,;:.]+$/, '')
}

/**
 * Joins the article title to the section heading.
 *
 * Two things learned from the first run. Several of these "headings" are whole sentences, so
 * the result needs clipping to stay near the ~125 characters screen readers and search
 * engines expect. And most titles already end in a full stop while some end in a question
 * mark, so a blind `": "` produced `"...ostateczność?: Ponieważ"`.
 */
function buildAlt(title: string, heading: string) {
  const cleanTitle = clip(squash(title), 70).replace(/\.$/, '')
  const cleanHeading = clip(squash(heading), 80)
  const separator = /[?!]$/.test(cleanTitle) ? ' ' : ': '
  return `${cleanTitle}${separator}${cleanHeading}`
}

const payload = await getPayload({ config })

console.log(DRY ? '\nDRY RUN, nothing will be written.' : '\nWRITING to the database.')

const posts = await payload.find({
  collection: 'posts',
  limit: 500,
  depth: 0,
  overrideAccess: true,
})

/** media id -> the alt we want it to carry */
const wanted = new Map<number, string>()
let beforeAnyHeading = 0

for (const post of posts.docs) {
  const root = (post.content as unknown as { root?: Node })?.root
  if (!root) continue

  let lastHeading = ''

  const walk = (node: Node) => {
    if (node.type === 'heading') lastHeading = squash(textOf(node))

    if (node.type === 'upload') {
      const value = node.value as { id?: number } | number | undefined
      const id = typeof value === 'number' ? value : value?.id

      if (typeof id === 'number') {
        if (lastHeading) {
          wanted.set(id, buildAlt(post.title, lastHeading))
        } else {
          // Sits above the first heading, so there is no section to name. The post title on
          // its own stays the honest answer.
          beforeAnyHeading += 1
        }
      }
    }

    for (const child of node.children ?? []) walk(child)
  }

  walk(root)
}

console.log(`in-article images that can name their section: ${wanted.size}`)
console.log(`images above the first heading, left as they are: ${beforeAnyHeading}`)

let updated = 0
let unchanged = 0
let missing = 0

for (const [id, alt] of wanted) {
  const doc = await payload
    .findByID({ collection: 'media', id, depth: 0, overrideAccess: true })
    .catch(() => null)

  if (!doc) {
    missing += 1
    continue
  }

  if (doc.alt === alt) {
    unchanged += 1
    continue
  }

  if (!DRY) {
    await payload.update({
      collection: 'media',
      id,
      data: { alt },
      overrideAccess: true,
    })
  }
  updated += 1
}

console.log(`\n${DRY ? '[dry run] ' : ''}results`)
console.log(`  alt text rewritten : ${updated}`)
console.log(`  already correct    : ${unchanged}`)
console.log(`  media not found    : ${missing}`)

process.exit(0)
