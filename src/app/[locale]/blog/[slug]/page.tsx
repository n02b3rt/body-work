import { notFound } from "next/navigation";
import Image from "next/image";
import { getPayload } from "payload";
import { getTranslations, setRequestLocale } from "next-intl/server";
import config from "@payload-config";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { mediaFrom } from "@/lib/media";
import { routing } from "@/i18n/routing";
import { PostBody } from "@/components/centrum/PostBody";
import { ClockIcon } from "@/components/centrum/BlogIcons";
import { PostCard } from "@/components/centrum/PostCard";
import { blogPostingJsonLd, breadcrumbJsonLd } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/metadata";
import { findTranslation, localisePost, publishedTranslations } from "@/lib/post-translation";

type PostPageProps = { params: Promise<{ slug: string; locale: string }> };

/**
 * Pre-render every published post at build time, for both locales.
 *
 * Until now each of the 62 post pages was rendered on demand, so every visit and every
 * crawler hit opened a database connection to fetch an article that changes a few times a
 * year. Time to first byte is a ranking input, and this is the cheapest place to win it.
 *
 * `revalidate` keeps the CMS usable: a post edited in the panel appears within the hour
 * without a deploy. A slug that does not exist yet still renders on first request, thanks to
 * `dynamicParams` defaulting to true, and is cached from then on.
 */
export const revalidate = 3600;

export async function generateStaticParams() {
  const payload = await getPayload({ config });
  const posts = await payload.find({
    collection: "posts",
    depth: 0,
    limit: 500,
    where: { _status: { not_equals: "draft" } },
  });

  // English URLs are only prerendered where a published translation exists. Without one the
  // page 404s, per the fallback rule in docs/i18n.md, so there is nothing to build.
  const translations = await publishedTranslations();

  return routing.locales.flatMap((locale) =>
    posts.docs
      .filter((doc) => doc.slug)
      .filter((doc) => locale === routing.defaultLocale || translations.has(doc.id))
      .map((doc) => ({ locale, slug: doc.slug as string })),
  );
}

function formatDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/**
 * Per-post metadata. Prefers whatever an editor typed into the SEO `meta` fields, and
 * falls back to the article's own title, excerpt and featured image, so a post that
 * nobody has optimised still gets a distinct title and a real share image.
 */
export async function generateMetadata({ params }: PostPageProps) {
  const { slug, locale } = await params;
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "posts",
    depth: 2,
    limit: 1,
    where: { and: [{ slug: { equals: slug } }, { _status: { not_equals: "draft" } }] },
  });
  const post = result.docs[0];
  if (!post) return {};

  const localised = localisePost(post, locale, await findTranslation(post.id));
  if (!localised) return {};

  const meta = post.meta ?? {};
  const image = mediaFrom(meta.image ?? post.featuredImage, "hero", localised.title);
  const author = post.author && typeof post.author === "object" ? post.author.name : undefined;
  const metaCategories = (post.categories ?? []).filter((c) => typeof c === "object");

  return pageMetadata({
    locale,
    path: `/blog/${slug}`,
    title: meta.title || localised.title,
    description: meta.description || localised.excerpt || undefined,
    image: image?.url ?? null,
    imageWidth: image?.width ?? null,
    imageHeight: image?.height ?? null,
    type: "article",
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    section: metaCategories[0]?.title,
    authors: author ? [author] : undefined,
    // An English alternate is advertised only where a translation actually exists. Claiming
    // one over Polish prose is what made the two URLs compete before.
    singleLanguage: !localised.translated && locale === "pl" ? true : false,
  });
}

/**
 * Post page, in the reference's order: title, then a rule, then the date and reading time,
 * then the author, then the article.
 *
 * **One deliberate departure, at the client's request.** The reference puts the author block
 * and the article body side by side at 50% each (`ho:w50p` on both), which leaves the text
 * in a half-width gutter: *"narazie jest rozjebany pół wpis pół autor... a to brzydko jest
 * i tragedia"*. Here the author block spans the row and the article runs full width beneath
 * it. Recorded in `docs/migration-tracker.md`.
 *
 * No hero image above the article, and no excerpt: `featuredImage` is the listing thumbnail
 * and the excerpt is the listing blurb, so rendering either here just repeated what the body
 * already opens with. Categories aren't shown either: the reference's post page has none;
 * they still drive the listing filter.
 */
export default async function PostPage({ params }: PostPageProps) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Blog");
  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: "posts",
    depth: 2,
    limit: 1,
    where: { and: [{ slug: { equals: slug } }, { _status: { not_equals: "draft" } }] },
  });

  const post = result.docs[0];
  if (!post) notFound();

  // No translation means no English page. Not a Polish page under an English URL, which is
  // what this served before, and not a half-translated one either. See docs/i18n.md.
  const localised = localisePost(post, locale, await findTranslation(post.id));
  if (!localised) notFound();

  const author = post.author && typeof post.author === "object" ? post.author : null;
  // 10rem on screen: 320px on a 2x display, so the 400px `thumbnail` is the right
  // source. It was asking for `card` (768px), which caps nothing but makes the optimizer
  // decode a picture four times larger than anything it can show.
  const authorPhoto = author ? mediaFrom(author.photo, "thumbnail", author.name) : null;
  const date = formatDate(post.publishedAt);
  const categories = (post.categories ?? []).filter((c) => typeof c === "object");
  const categoryIds = categories.map((c) => c.id);

  // Posts sharing a category. The reference has no related block at all, but nothing here
  // linked one article to another, and internal links between related pages are among the
  // cheapest ranking signals there are. Logged as a deliberate addition.
  const related =
    categoryIds.length > 0
      ? await payload.find({
          collection: "posts",
          depth: 1,
          limit: 3,
          sort: "-publishedAt",
          where: {
            and: [
              { id: { not_equals: post.id } },
              { categories: { in: categoryIds } },
              { _status: { not_equals: "draft" } },
            ],
          },
        })
      : null;

  const relatedCards = (related?.docs ?? []).map((item) => ({
    slug: item.slug ?? String(item.id),
    title: item.title,
    readingMinutes: item.readingMinutes,
    authorName: item.author && typeof item.author === "object" ? item.author.name : null,
    image: mediaFrom(item.featuredImage, "card", item.title),
  }));

  const articleImage = mediaFrom(post.featuredImage, "hero", localised.title);
  const jsonLd = [
    blogPostingJsonLd({
      locale,
      slug,
      title: localised.title,
      description: localised.excerpt,
      imageUrl: articleImage?.url ?? null,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      authorName: author?.name,
      categoryNames: categories.map((c) => c.title),
      readingMinutes: post.readingMinutes,
    }),
    breadcrumbJsonLd(
      [
        { name: t("breadcrumbHome"), path: "/" },
        { name: t("title"), path: "/blog" },
        { name: localised.title, path: `/blog/${slug}` },
      ],
      locale,
    ),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        // Our own objects, serialised by us. No user input reaches them.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="border-b border-brand-navy-soft bg-background">
        <Container className="py-12 wide:py-16">
          {/* Half width on desktop, as on the reference, a 1440px-wide line of 68px type
            * is unreadable, and the wrap is part of how the title looks. */}
          <SectionHeading as="h1" className="tracking-[-0.025em] wide:w-1/2">
            {localised.title}
          </SectionHeading>
        </Container>
      </section>

      {date || post.readingMinutes ? (
        <section className="border-b border-brand-navy-soft bg-background">
          <Container className="flex flex-wrap items-center gap-x-6 gap-y-2 py-8">
            {date ? <span className="text-body text-brand-navy">{date}</span> : null}
            {post.readingMinutes ? (
              <span className="flex items-center text-body text-brand-navy">
                <ClockIcon />
                <span className="ml-1">{t("readingTime", { minutes: post.readingMinutes })}</span>
              </span>
            ) : null}
            {/* Category links. The reference prints no categories on a post page, but an
              * archive nobody links to is an orphan, and this is the edge that turns 43
              * physiotherapy articles into a cluster. Logged as a deliberate addition. */}
            {categories.map((category) =>
              category.slug ? (
                <Link
                  key={category.id}
                  href={`/blog/kategoria/${category.slug}`}
                  className="text-body text-brand-navy underline underline-offset-4 hover:opacity-70"
                >
                  {category.title}
                </Link>
              ) : null,
            )}
          </Container>
        </section>
      ) : null}

      {author ? (
        <section className="border-b border-brand-navy-soft bg-background">
          <Container className="flex flex-col gap-6 py-8 sm:flex-row sm:items-center sm:gap-10">
            {authorPhoto ? (
              <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-full">
                <Image
                  src={authorPhoto.url}
                  // Decorative: the name is printed next to the portrait.
                  alt=""
                  fill
                  sizes="160px"
                  className="object-cover"
                  {...(authorPhoto.blurDataURL
                    ? { placeholder: "blur" as const, blurDataURL: authorPhoto.blurDataURL }
                    : {})}
                />
              </div>
            ) : null}
            <div>
              {/* The reference writes this label in capitals; uppercasing in CSS keeps the
                * message file sentence-case and translatable. */}
              <p className="uppercase text-body text-brand-navy">{t("author")}:</p>
              <p className="pt-5 text-h-tile text-brand-navy">{author.name}</p>
              {author.role ? <p className="pt-4 text-body text-brand-navy">{author.role}</p> : null}
              {author.bio ? (
                <p className="max-w-[42rem] pt-4 text-body text-brand-navy/80">{author.bio}</p>
              ) : null}
            </div>
          </Container>
        </section>
      ) : null}

      <article className="bg-background">
        <Container className="py-12 wide:py-16">
          {/* Payload stores Lexical JSON; this renders it with the default converters.
            * `blog-prose` carries the typography for headings, lists and images inside
            * the article, see globals.css. */}
          {localised.content ? (
            <PostBody
              content={localised.content}
              // Only when this is a translation: image widths follow the Polish version.
              syncSizesFrom={localised.translated ? post.content : null}
            />
          ) : null}
        </Container>
      </article>

      {relatedCards.length > 0 ? (
        <section className="border-t border-brand-navy-soft bg-background">
          <Container className="py-12 wide:py-16">
            <h2 className="text-h-menu text-brand-navy">{t("relatedHeading")}</h2>
            <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {relatedCards.map((item) => (
                <PostCard
                  key={item.slug}
                  post={item}
                  minutesLabel={(minutes) => t("readingTime", { minutes })}
                />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      <section className="border-t border-brand-navy-soft bg-background">
        <Container className="py-12">
          <Link href="/blog" className={buttonClasses("outline")}>
            {t("backToBlog")}
          </Link>
        </Container>
      </section>
    </>
  );
}
