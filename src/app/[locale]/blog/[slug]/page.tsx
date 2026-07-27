import { notFound } from "next/navigation";
import Image from "next/image";
import { getPayload } from "payload";
import { getTranslations } from "next-intl/server";
import config from "@payload-config";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { mediaFrom } from "@/lib/media";
import { PostBody } from "@/components/centrum/PostBody";
import { ClockIcon } from "@/components/centrum/BlogIcons";
import { pageMetadata } from "@/lib/metadata";

type PostPageProps = { params: Promise<{ slug: string; locale: string }> };

function formatDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/**
 * Per-post metadata. Prefers whatever an editor typed into the SEO `meta` fields, and
 * falls back to the article's own title, excerpt and featured image — so a post that
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

  const meta = post.meta ?? {};
  const image = mediaFrom(meta.image ?? post.featuredImage, "hero", post.title);
  const author = post.author && typeof post.author === "object" ? post.author.name : undefined;

  return pageMetadata({
    locale,
    path: `/blog/${slug}`,
    title: meta.title || post.title,
    description: meta.description || post.excerpt || undefined,
    image: image?.url ?? null,
    type: "article",
    publishedTime: post.publishedAt,
    authors: author ? [author] : undefined,
  });
}

/**
 * Post page, in the reference's order: title, then a rule, then the date and reading time,
 * then the author, then the article.
 *
 * **One deliberate departure, at the client's request.** The reference puts the author block
 * and the article body side by side at 50% each (`ho:w50p` on both), which leaves the text
 * in a half-width gutter — *"narazie jest rozjebany pół wpis pół autor... a to brzydko jest
 * i tragedia"*. Here the author block spans the row and the article runs full width beneath
 * it. Recorded in `docs/migration-tracker.md`.
 *
 * No hero image above the article, and no excerpt: `featuredImage` is the listing thumbnail
 * and the excerpt is the listing blurb, so rendering either here just repeated what the body
 * already opens with. Categories aren't shown either — the reference's post page has none;
 * they still drive the listing filter.
 */
export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
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

  const author = post.author && typeof post.author === "object" ? post.author : null;
  // 10rem on screen, so ask for the card size rather than the 400px thumbnail.
  const authorPhoto = author ? mediaFrom(author.photo, "card", author.name) : null;
  const date = formatDate(post.publishedAt);

  return (
    <>
      <section className="border-b border-brand-navy-soft bg-background">
        <Container className="py-12 wide:py-16">
          {/* Half width on desktop, as on the reference — a 1440px-wide line of 68px type
            * is unreadable, and the wrap is part of how the title looks. */}
          <SectionHeading as="h1" className="tracking-[-0.025em] wide:w-1/2">
            {post.title}
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
                  alt={author.name}
                  fill
                  sizes="160px"
                  className="object-cover"
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
            * the article — see globals.css. */}
          {post.content ? <PostBody content={post.content} /> : null}
        </Container>
      </article>

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
