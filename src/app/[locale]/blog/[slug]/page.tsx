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

type PostPageProps = { params: Promise<{ slug: string; locale: string }> };

function formatDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

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

  const hero = mediaFrom(post.featuredImage, "hero", post.title);
  const author = post.author && typeof post.author === "object" ? post.author : null;
  const authorPhoto = author ? mediaFrom(author.photo, "thumbnail", author.name) : null;
  const date = formatDate(post.publishedAt);
  const categories = (post.categories ?? []).filter((c) => typeof c === "object");

  return (
    <>
      <Container className="py-10 lg:py-14">
        <p className="text-label uppercase tracking-[1px] text-brand-navy/70">
          {[date, post.readingMinutes ? t("readingTime", { minutes: post.readingMinutes }) : null, author?.name]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <SectionHeading as="h1" className="mt-6">
          {post.title}
        </SectionHeading>
        {categories.length > 0 ? (
          <p className="mt-6 text-label uppercase tracking-[1px] text-brand-navy/70">
            {categories.map((c) => c.title).join(" · ")}
          </p>
        ) : null}
      </Container>

      {hero ? (
        <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[2.4/1]">
          <Image src={hero.url} alt={hero.alt || post.title} fill priority sizes="100vw" className="object-cover" />
        </div>
      ) : null}

      <article className="border-t border-brand-navy-soft bg-background">
        <Container className="py-12 lg:py-16">
          {post.excerpt ? (
            <p className="mb-10 max-w-[42rem] text-statement text-brand-navy">{post.excerpt}</p>
          ) : null}

          {/* Payload stores Lexical JSON; this renders it with the default converters.
            * `blog-prose` carries the typography for headings, lists and images inside
            * the article — see globals.css. */}
          {post.content ? <PostBody content={post.content} /> : null}
        </Container>
      </article>

      {author ? (
        <section className="border-t border-brand-navy-soft bg-background">
          <Container className="flex flex-col gap-6 py-12 sm:flex-row sm:items-center lg:py-16">
            {authorPhoto ? (
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full">
                <Image src={authorPhoto.url} alt={author.name} fill sizes="96px" className="object-cover" />
              </div>
            ) : null}
            <div>
              <p className="text-label uppercase tracking-[1px] text-brand-navy/70">{t("author")}</p>
              <p className="mt-2 text-h-menu text-brand-navy">{author.name}</p>
              {author.role ? <p className="mt-1 text-body text-brand-navy/80">{author.role}</p> : null}
              {author.bio ? <p className="mt-4 max-w-[42rem] text-body text-brand-navy/80">{author.bio}</p> : null}
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
