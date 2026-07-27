"use client";

import { useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { buttonClasses } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { Chevron, ClockIcon, PersonIcon } from "@/components/centrum/BlogIcons";

export type BlogCard = {
  slug: string;
  title: string;
  excerpt?: string | null;
  readingMinutes?: number | null;
  authorName?: string | null;
  categoryIds: string[];
  image?: { url: string; alt: string } | null;
};

export type BlogCategory = { id: string; title: string };

type BlogListProps = {
  posts: BlogCard[];
  categories: BlogCategory[];
};

const ALL = "all";

/**
 * Reading time and author. **No date** — the reference prints one on its featured card, but
 * the client asked for no dates anywhere on the listing; see `docs/migration-tracker.md`.
 *
 * The two layouts are the reference's own: the featured card sets them side by side with a
 * wide gap, the grid cards push them to opposite ends of the card.
 */
function MetaRow({
  minutes,
  author,
  label,
  layout,
}: {
  minutes?: number | null;
  author?: string | null;
  label: (minutes: number) => string;
  layout: "inline" | "spread";
}) {
  if (!minutes && !author) return null;

  const spread = layout === "spread";

  return (
    <div
      className={`flex items-center text-body text-brand-navy ${spread ? "w-full justify-between" : ""}`}
    >
      {minutes ? (
        <span className={`flex items-center ${spread ? "mr-4" : "mr-16"}`}>
          <ClockIcon />
          <span className="ml-1">{label(minutes)}</span>
        </span>
      ) : null}
      {author ? (
        <span className="flex items-center">
          <PersonIcon />
          <span className={spread ? "ml-1" : "ml-2"}>{author}</span>
        </span>
      ) : null}
    </div>
  );
}

/**
 * Listing with the reference's category select and free-text search, both filtering the
 * already-loaded set client-side — which is what the reference does too. At ~60 posts a
 * round trip per keystroke would be worse, not better.
 *
 * The newest post gets the reference's featured treatment: half-width image, the rest of
 * the row given over to an oversized title and the lead. It steps aside while a filter or a
 * search is active, because a "featured" post that is really just the first match reads as
 * an accident — the reference's own featured card carries an empty `data-category`, so its
 * filter hides it too.
 */
export function BlogList({ posts, categories }: BlogListProps) {
  const t = useTranslations("Blog");
  const [category, setCategory] = useState(ALL);
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return posts.filter((post) => {
      if (category !== ALL && !post.categoryIds.includes(category)) return false;
      if (!needle) return true;
      return `${post.title} ${post.excerpt ?? ""} ${post.authorName ?? ""}`
        .toLowerCase()
        .includes(needle);
    });
  }, [posts, category, query]);

  const filtering = category !== ALL || query.trim() !== "";
  const featured = filtering ? null : visible[0];
  const grid = featured ? visible.slice(1) : visible;

  const minutesLabel = (minutes: number) => t("readingTime", { minutes });

  return (
    <div className="border-t border-brand-navy-soft bg-background">
      {/* Filtering is live as you type, so submitting only re-applies what is already
        * applied. The button is kept because the reference has it and people look for
        * one; `preventDefault` here hides no missing behaviour. */}
      <form
        onSubmit={(event: FormEvent) => event.preventDefault()}
        className="border-b border-brand-navy-soft"
      >
        <Container className="flex flex-col gap-4 py-8 wide:flex-row wide:items-center">
          <label className="sr-only" htmlFor="blog-category">
            {t("allCategories")}
          </label>
          {/* Square, not a pill — the reference's select has no border radius, and the
            * native arrow inside a rounded box is what looked broken. */}
          <div className="relative w-full wide:w-auto">
            <select
              id="blog-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-14 w-full appearance-none border border-brand-navy-soft bg-background pl-6 pr-12 text-label uppercase tracking-[1px] text-brand-navy focus:border-brand-navy focus:outline-none"
            >
              <option value={ALL}>{t("allCategories")}</option>
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
            <Chevron className="pointer-events-none absolute right-[22px] top-1/2 -translate-y-1/2 text-brand-navy" />
          </div>

          <label className="sr-only" htmlFor="blog-search">
            {t("searchLabel")}
          </label>
          <input
            id="blog-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("searchPlaceholder")}
            // `flex-1` is the reference's `fg1`: the field takes whatever the row has left.
            className="h-14 w-full flex-1 rounded-full border border-brand-navy-soft bg-background px-6 text-body text-brand-navy placeholder:text-brand-navy/60 focus:border-brand-navy focus:outline-none"
          />

          <button type="submit" className={buttonClasses("solid", "hidden wide:inline-flex")}>
            {t("searchLabel")}
          </button>
        </Container>
      </form>

      {visible.length === 0 ? (
        <Container className="py-20">
          <p className="text-body text-brand-navy">
            {posts.length === 0 ? t("noPosts") : t("empty")}
          </p>
        </Container>
      ) : null}

      {featured ? (
        <article className="border-b border-brand-navy-soft">
          <div className="flex flex-wrap">
            <div className="flex w-full flex-col justify-between wide:w-1/2">
              <div className="p-6 wide:p-12">
                <MetaRow
                  minutes={featured.readingMinutes}
                  author={featured.authorName}
                  label={minutesLabel}
                  layout="inline"
                />
              </div>

              <div className="p-6 pt-0 wide:p-12 wide:pt-0">
                <h2 className="tracking-[-0.025em] text-h-mobile text-brand-navy wide:text-h-hero">
                  <Link href={`/blog/${featured.slug}`} className="hover:opacity-70">
                    {featured.title}
                  </Link>
                </h2>
                {featured.excerpt ? (
                  <p className="max-w-lg pt-12 tracking-[-0.025em] text-body text-brand-navy">
                    {featured.excerpt}
                  </p>
                ) : null}
              </div>

              <div className="p-6 pt-6 wide:p-12 wide:pt-12">
                <Link href={`/blog/${featured.slug}`} className={buttonClasses("outline")}>
                  {t("readMore")}
                </Link>
              </div>
            </div>

            {/* `order-first` on desktop puts the photo on the left, as the reference does,
              * while keeping the text first in the source for mobile and for screen readers. */}
            {featured.image ? (
              <div className="relative aspect-video w-full wide:order-first wide:aspect-auto wide:w-1/2">
                <Image
                  src={featured.image.url}
                  alt={featured.image.alt}
                  fill
                  priority
                  sizes="(min-width: 1060px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            ) : null}
          </div>
        </article>
      ) : null}

      {grid.length > 0 ? (
        // `lg:` and not the project's `wide:` here on purpose. With `sm:grid-cols-2` and
        // `wide:grid-cols-3` both on the element, the `sm` rule wins above 1060px and the
        // grid silently stays at two columns — measured, not assumed. `lg` (1024px) is a
        // default breakpoint that orders after `sm`, and 1024 vs the reference's 1060 is a
        // difference no one will see.
        <Container className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {grid.map((post) => (
            <article
              key={post.slug}
              // Dividers are the reference's own border-right/border-bottom. Dropping the
              // right border on the last column keeps the line off the container edge —
              // a grid mechanic, which CLAUDE.md allows adapting.
              className="flex flex-col border-b border-brand-navy-soft py-8 sm:border-r sm:px-6 sm:[&:nth-child(2n)]:border-r-0 lg:px-8 lg:[&:nth-child(2n)]:border-r lg:[&:nth-child(3n)]:border-r-0"
            >
              <Link href={`/blog/${post.slug}`} className="group flex flex-col">
                {post.image ? (
                  <div className="relative aspect-video w-full overflow-hidden bg-brand-navy/5">
                    <Image
                      src={post.image.url}
                      alt={post.image.alt}
                      fill
                      sizes="(min-width: 1060px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                ) : null}
                <h3 className="pt-7 text-h-tile text-brand-navy group-hover:opacity-90">
                  {post.title}
                </h3>
              </Link>

              {post.excerpt ? (
                <p className="mb-auto max-w-lg grow pb-13 pt-10 tracking-[-0.025em] text-body text-brand-navy">
                  {post.excerpt}
                </p>
              ) : null}

              <Link
                href={`/blog/${post.slug}`}
                className={buttonClasses("outline", "w-fit")}
              >
                {t("readMore")}
              </Link>

              <div className="flex pt-8">
                <MetaRow
                  minutes={post.readingMinutes}
                  author={post.authorName}
                  label={minutesLabel}
                  layout="spread"
                />
              </div>
            </article>
          ))}
        </Container>
      ) : null}
    </div>
  );
}
