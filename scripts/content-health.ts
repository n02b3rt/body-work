/**
 * Reports the editorial gaps on the blog, the ones no script can honestly close.
 *
 * Run with: `pnpm payload run scripts/content-health.ts`
 *
 * Read-only. It writes nothing, it just turns "somebody should look at the posts" into a
 * list of slugs somebody can work through. Re-run it to see the list shrink.
 */
import { getPayload } from 'payload'
import config from '@payload-config'

type Node = { type?: string; text?: string; children?: Node[]; value?: unknown }

function textOf(node: Node): string {
  if (typeof node.text === 'string') return node.text
  return (node.children ?? []).map(textOf).join('')
}

function words(node: Node): number {
  return textOf(node).split(/\s+/).filter(Boolean).length
}

function headings(root: Node): number {
  let count = 0
  const walk = (node: Node) => {
    if (node.type === 'heading') count += 1
    for (const child of node.children ?? []) walk(child)
  }
  walk(root)
  return count
}

const payload = await getPayload({ config })

const posts = await payload.find({
  collection: 'posts',
  limit: 500,
  depth: 1,
  overrideAccess: true,
})

const noHeadings: { slug: string; words: number; minutes: number }[] = []
const noExcerpt: string[] = []
const noAuthor: string[] = []
const noImage: string[] = []
const noCategory: string[] = []

for (const post of posts.docs) {
  const slug = post.slug ?? String(post.id)
  const root = (post.content as unknown as { root?: Node })?.root

  if (root && headings(root) === 0) {
    noHeadings.push({ slug, words: words(root), minutes: post.readingMinutes ?? 0 })
  }
  if (!post.excerpt?.trim()) noExcerpt.push(slug)
  if (!post.author) noAuthor.push(slug)
  if (!post.featuredImage) noImage.push(slug)
  if (!(post.categories ?? []).length) noCategory.push(slug)
}

const media = await payload.find({
  collection: 'media',
  limit: 2000,
  depth: 0,
  overrideAccess: true,
})

const postTitles = new Set(posts.docs.map((p) => p.title))

// A thumbnail's alt *should* be the article title: it is the link's subject, and that is what
// a screen-reader user needs to hear. Counting those as a gap would invent one, so separate
// the two populations first.
const featuredIds = new Set(
  posts.docs
    .map((post) => (typeof post.featuredImage === 'object' ? post.featuredImage?.id : post.featuredImage))
    .filter((id): id is number => typeof id === 'number'),
)

const inContentIds = new Set<number>()
for (const post of posts.docs) {
  const root = (post.content as unknown as { root?: Node })?.root
  if (!root) continue
  const walk = (node: Node) => {
    if (node.type === 'upload') {
      const v = node.value as { id?: number } | number | undefined
      const id = typeof v === 'number' ? v : v?.id
      if (typeof id === 'number') inContentIds.add(id)
    }
    for (const child of node.children ?? []) walk(child)
  }
  walk(root)
}

// The real gap: an image inside an article whose alt is still just the article's title,
// because it sits above the first heading and there was no section to name.
const titleOnlyAlt = media.docs.filter(
  (m) => m.alt && postTitles.has(m.alt) && inContentIds.has(m.id as number),
)
const thumbnailsWithTitleAlt = media.docs.filter(
  (m) => m.alt && postTitles.has(m.alt) && featuredIds.has(m.id as number),
)
const emptyAlt = media.docs.filter((m) => !m.alt?.trim())

console.log(`\nposts: ${posts.docs.length}   media: ${media.docs.length}`)

console.log(`\nNo subheadings at all (${noHeadings.length}). A wall of text, and nothing for a`)
console.log('search engine to pull a jump link from. Longest first:')
for (const item of noHeadings.sort((a, b) => b.words - a.words)) {
  console.log(`  ${String(item.words).padStart(5)} words  ${String(item.minutes).padStart(2)} min  ${item.slug}`)
}

console.log(`\nIn-article images still labelled only with the post title (${titleOnlyAlt.length}).`)
console.log('These sit above the first heading, so there was no section to name. They need')
console.log('someone who can see the picture.')
for (const m of titleOnlyAlt.slice(0, 20)) {
  console.log(`  ${m.filename}  ${JSON.stringify(m.alt)}`)
}
if (titleOnlyAlt.length > 20) console.log(`  ... and ${titleOnlyAlt.length - 20} more`)

console.log(`\nThumbnails labelled with the post title: ${thumbnailsWithTitleAlt.length} (correct, not a gap)`)
console.log(`Empty alt text: ${emptyAlt.length}`)
console.log(`Missing excerpt: ${noExcerpt.length}${noExcerpt.length ? ` (${noExcerpt.join(', ')})` : ''}`)
console.log(`Missing author: ${noAuthor.length}${noAuthor.length ? ` (${noAuthor.join(', ')})` : ''}`)
console.log(`Missing featured image: ${noImage.length}${noImage.length ? ` (${noImage.join(', ')})` : ''}`)
console.log(`Missing category: ${noCategory.length}${noCategory.length ? ` (${noCategory.join(', ')})` : ''}`)

console.log('\nNothing here is a bug. It is the list of things that need a person.')

process.exit(0)
