"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Link } from "@/i18n/navigation";

export type BlogCard = {
  slug: string;
  title: string;
  excerpt?: string | null;
  date?: string | null;
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

function formatDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  // The reference prints DD.MM.YYYY.
  return date.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/** Listing with the reference's category select and free-text search. Both filter the
 * already-loaded set client-side, which is what the reference does too — at this volume
 * (~60 posts) a round trip per keystroke would be worse, not better. */
export function BlogList({ posts, categories }: BlogListProps) {
  const t = useTranslations("Blog");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return posts.filter((post) => {
      if (category !== "all" && !post.categoryIds.includes(category)) return false;
      if (!needle) return true;
      return `${post.title} ${post.excerpt ?? ""} ${post.authorName ?? ""}`.toLowerCase().includes(needle);
    });
  }, [posts, category, query]);

  return (
    <div className="border-t border-brand-navy-soft bg-background">
      <Container className="flex flex-col gap-6 py-10 sm:flex-row sm:items-center lg:py-14">
        <label className="sr-only" htmlFor="blog-category">
          {t("allCategories")}
        </label>
        <select
          id="blog-category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="min-h-14 rounded-full border border-brand-navy-soft bg-background px-7 text-btn uppercase tracking-[0.1em] text-brand-navy"
        >
          <option value="all">{t("allCategories")}</option>
          {categories.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="blog-search">
          {t("searchLabel")}
        </label>
        <input
          id="blog-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("searchPlaceholder")}
          className="min-h-14 w-full rounded-full border border-brand-navy-soft bg-background px-7 text-body text-brand-navy sm:max-w-sm"
        />
      </Container>

      {visible.length === 0 ? (
        <Container className="pb-20">
          <p className="text-body text-brand-navy">{posts.length === 0 ? t("noPosts") : t("empty")}</p>
        </Container>
      ) : (
        <Container className="grid gap-x-10 gap-y-16 pb-20 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((post) => {
            const date = formatDate(post.date);
            return (
              <article key={post.slug} className="flex flex-col gap-5">
                <Link href={`/blog/${post.slug}`} className="group flex flex-col gap-5">
                  {post.image ? (
                    <div className="relative aspect-[3/2] w-full overflow-hidden">
                      <Image
                        src={post.image.url}
                        alt={post.image.alt}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                  ) : null}

                  {/* Meta line, as on the reference: date · reading time · author. */}
                  <p className="text-label uppercase tracking-[1px] text-brand-navy/70">
                    {[date, post.readingMinutes ? t("readingTime", { minutes: post.readingMinutes }) : null, post.authorName]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>

                  <h2 className="text-h-menu text-brand-navy group-hover:opacity-70">{post.title}</h2>
                </Link>

                {post.excerpt ? <p className="text-body text-brand-navy/80">{post.excerpt}</p> : null}
              </article>
            );
          })}
        </Container>
      )}
    </div>
  );
}
