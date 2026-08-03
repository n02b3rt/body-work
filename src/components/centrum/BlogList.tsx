"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { buttonClasses } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { Chevron, ClockIcon, PersonIcon } from "@/components/centrum/BlogIcons";
import { BLOG_PAGE_SIZE } from "@/lib/blog-page-size";

export type BlogCard = {
  slug: string;
  title: string;
  excerpt?: string | null;
  readingMinutes?: number | null;
  authorName?: string | null;
  categoryIds: string[];
  /** `blurDataURL` is the reference's own LQIP, imported by
   *  `scripts/import-blur-placeholders.ts`; absent on anything uploaded since. */
  image?: { url: string; alt: string; blurDataURL?: string } | null;
};

export type BlogCategory = { id: string; title: string };

type BlogListProps = {
  posts: BlogCard[];
  categories: BlogCategory[];
  /**
   * Cards rendered on the server. Comes from `?page=N`, so a crawler that follows the "show
   * more" link reaches every post. With a window of nine and no such link, only 10 of the 62
   * post URLs appeared anywhere in the HTML.
   */
  initialCount?: number;
  /** `?page=N+1`, or null once everything is already on the page. */
  nextPageHref?: string | null;
};

const ALL = "all";

/** Cards added per batch after the first scroll: three full rows of the desktop grid. See the
 *  note on `shown` for why this is a rendering window rather than server-side pagination. */
const PAGE_SIZE = BLOG_PAGE_SIZE;

/**
 * Reading time and author. **No date**: the reference prints one on its featured card, but
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
 * already-loaded set client-side, which is what the reference does too. At ~60 posts a
 * round trip per keystroke would be worse, not better.
 *
 * The newest post gets the reference's featured treatment: half-width image, the rest of
 * the row given over to an oversized title and the lead. It steps aside while a filter or a
 * search is active, because a "featured" post that is really just the first match reads as
 * an accident: the reference's own featured card carries an empty `data-category`, so its
 * filter hides it too.
 */
export function BlogList({
  posts,
  categories,
  initialCount = PAGE_SIZE,
  nextPageHref = null,
}: BlogListProps) {
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

  /**
   * How many cards are actually rendered. The full set stays in memory: filtering and
   * search run over all 62 posts client-side, as on the reference, and fetching in batches
   * would mean a round trip per keystroke, but only a window of them is put in the DOM.
   * That is where the cost was: 62 cards meant 1764 DOM nodes, a 20,000px page and a 119KB
   * document, while the images were already lazy (1 of 62 had loaded).
   *
   * The count is stored next to the filter it belongs to instead of being reset from an
   * effect: changing the category or the query has to start the window over, and doing that
   * in an effect both flashes the old list for a frame and trips the React Compiler's
   * set-state-in-effect rule.
   */
  const filterKey = `${category}|${query.trim()}`;
  const [window_, setWindow] = useState({ key: filterKey, count: initialCount });
  // Filtering restarts the window at one page: the server's larger initial count belongs to
  // the unfiltered list it was rendered for.
  const shown = window_.key === filterKey ? window_.count : PAGE_SIZE;

  const rendered = grid.slice(0, shown);
  const hasMore = shown < grid.length;

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;

    // `rootMargin` reveals the next batch before the sentinel is actually on screen, so the
    // grid grows ahead of the scroll rather than after a visible gap.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setWindow({ key: filterKey, count: shown + PAGE_SIZE });
        }
      },
      { rootMargin: "600px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [filterKey, hasMore, shown]);

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
          {/* Square, not a pill: the reference's select has no border radius, and the
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
                {/* `fetchPriority` without `preload`, unlike the heroes. This photo leads the
                  * card on desktop but follows the text on mobile (`wide:order-first`), so it
                  * is only sometimes the LCP element, and Next's own guidance is to prioritise
                  * rather than preload when that is true: a preload link would have every
                  * phone fetching it at top priority to paint it below the fold. */}
                <Image
                  src={featured.image.url}
                  // Decorative: the title is right beside it as real text.
                  alt=""
                  fill
                  fetchPriority="high"
                  sizes="(min-width: 1060px) 50vw, 100vw"
                  className="object-cover"
                  {...(featured.image.blurDataURL
                    ? { placeholder: "blur" as const, blurDataURL: featured.image.blurDataURL }
                    : {})}
                />
              </div>
            ) : null}
          </div>
        </article>
      ) : null}

      {rendered.length > 0 ? (
        // Not `Container` here, deliberately. The grid needs a border down its left and
        // right edges (the reference has them), and `Container`'s own horizontal padding
        // would sit between that line and the first card's padding: leaving 64px from the
        // edge line to the text against 32px at the interior dividers. Same width cap,
        // padding moved onto the cards, so every line has the same gap.
        //
        // `lg:` and not the project's `wide:`, with `sm:grid-cols-2` and `wide:grid-cols-3`
        // both on the element, the `sm` rule wins above 1060px and the grid silently stays
        // at two columns: measured, not assumed. `lg` (1024px) orders after `sm`, and 1024
        // against the reference's 1060 is a difference no one will see.
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 border-x border-brand-navy-soft sm:grid-cols-2 lg:grid-cols-3">
          {rendered.map((post) => (
            <article
              key={post.slug}
              // Dividers are the reference's own border-right/border-bottom. Dropping the
              // right border on the last column keeps the line off the container edge,
              // a grid mechanic, which CLAUDE.md allows adapting.
              className="flex flex-col border-b border-brand-navy-soft px-6 py-8 sm:border-r sm:[&:nth-child(2n)]:border-r-0 lg:px-8 lg:[&:nth-child(2n)]:border-r lg:[&:nth-child(3n)]:border-r-0"
            >
              <Link href={`/blog/${post.slug}`} className="group flex flex-col">
                {post.image ? (
                  <div className="relative aspect-video w-full overflow-hidden bg-brand-navy/5">
                    <Image
                      src={post.image.url}
                      // Decorative: the card heading carries the same words.
                      alt=""
                      fill
                      // The grid is capped at 1440px, so above that a card is a fixed
                      // 480px, not 33vw. Saying 33vw overstated the slot by a third at a
                      // 1920 viewport, which pushed Next to the 1920 candidate on a 2x
                      // screen: 270KB a card, measured, against 99KB for the honest 480px.
                      // The breakpoint is 1024px because the grid goes three-up at `lg`.
                      sizes="(min-width: 1440px) 480px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      {...(post.image.blurDataURL
                        ? { placeholder: "blur" as const, blurDataURL: post.image.blurDataURL }
                        : {})}
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
        </div>
      ) : null}

      {hasMore ? (
        <Container className="flex flex-col items-center gap-4 py-12">
          {/* The observer watches this; the button does the same thing on click. Both are
            * here on purpose: scroll alone leaves keyboard users and anything without an
            * IntersectionObserver unable to reach the rest of the list. */}
          <div ref={sentinelRef} aria-hidden className="h-px w-full" />
          {/* A real link, not a button. Without JavaScript, and for a crawler, it navigates
            * to the next server-rendered page; with JavaScript it grows the window in place
            * and the URL stays put. `nextPageHref` is null while a filter is active, since
            * the server pages describe the unfiltered list. */}
          <a
            href={nextPageHref ?? "#"}
            onClick={(event) => {
              event.preventDefault();
              setWindow({ key: filterKey, count: shown + PAGE_SIZE });
            }}
            className={buttonClasses("outline")}
          >
            {t("loadMore")}
          </a>
          <p aria-live="polite" className="text-label text-brand-navy/70">
            {t("shownCount", { shown: rendered.length, total: grid.length })}
          </p>
        </Container>
      ) : null}
    </div>
  );
}
