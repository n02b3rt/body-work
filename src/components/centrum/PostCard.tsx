import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ClockIcon, PersonIcon } from "@/components/centrum/BlogIcons";

export type PostCardData = {
  slug: string;
  title: string;
  readingMinutes?: number | null;
  authorName?: string | null;
  image?: { url: string; alt: string; blurDataURL?: string } | null;
};

type PostCardProps = {
  post: PostCardData;
  /** Reading time label, passed in so this stays free of the translation namespace. */
  minutesLabel: (minutes: number) => string;
  /** Matches the slot the card occupies, which decides the width Next serves. */
  sizes?: string;
};

/**
 * One post card: photo, title, then reading time and author at opposite ends of the footer.
 *
 * Shared by the "read next" block and the category archives. The listing's own cards are
 * still written inline there, because they carry the grid's divider borders and the
 * `nth-child` rules that go with them.
 */
export function PostCard({
  post,
  minutesLabel,
  sizes = "(min-width: 1440px) 448px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
}: PostCardProps) {
  return (
    <article className="flex flex-col">
      <Link href={`/blog/${post.slug}`} className="group flex flex-col">
        {post.image ? (
          <div className="relative aspect-video w-full overflow-hidden bg-brand-navy/5">
            <Image
              src={post.image.url}
              alt={post.image.alt}
              fill
              sizes={sizes}
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              {...(post.image.blurDataURL
                ? { placeholder: "blur" as const, blurDataURL: post.image.blurDataURL }
                : {})}
            />
          </div>
        ) : null}
        <h3 className="pt-7 text-h-tile text-brand-navy group-hover:opacity-90">{post.title}</h3>
      </Link>

      <div className="mt-auto flex items-center justify-between pt-8 text-body text-brand-navy">
        {post.readingMinutes ? (
          <span className="flex items-center">
            <ClockIcon />
            <span className="ml-1">{minutesLabel(post.readingMinutes)}</span>
          </span>
        ) : null}
        {post.authorName ? (
          <span className="flex items-center">
            <PersonIcon />
            <span className="ml-1">{post.authorName}</span>
          </span>
        ) : null}
      </div>
    </article>
  );
}
