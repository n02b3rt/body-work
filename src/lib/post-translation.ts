import { getPayload } from "payload";
import config from "@payload-config";
import { routing } from "@/i18n/routing";
import type { Post, PostTranslation } from "@/payload-types";

/**
 * Resolves a post into the language being viewed.
 *
 * The rule comes from `docs/i18n.md`: content with no English translation **does not appear in
 * English**. Not a half-translated page, and not Polish prose under an English URL, which is
 * what the site served before the translations collection existed. So on `/en` this returns
 * null unless a published translation exists, and the caller turns that into a 404.
 *
 * Polish is the default locale and always resolves to the post itself.
 */

export type LocalisedPost = {
  title: string;
  excerpt?: string | null;
  content: Post["content"] | null;
  /** True when the reader is seeing a translation rather than the original. */
  translated: boolean;
};

/**
 * Publishable means marked published **and** carrying a body.
 *
 * The status flag alone is not enough: an editor can tick "published" with only the title
 * filled in, and that would put a page with a heading and no article on the site. Treating it
 * as untranslated keeps the page out until there is something to read.
 */
function isPublished(translation: PostTranslation | undefined): translation is PostTranslation {
  return Boolean(translation && translation.status === "published" && translation.content);
}

export function localisePost(
  post: Post,
  locale: string,
  translation?: PostTranslation,
): LocalisedPost | null {
  if (locale === routing.defaultLocale) {
    return {
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      translated: false,
    };
  }

  if (!isPublished(translation)) return null;

  return {
    title: translation.title,
    excerpt: translation.excerpt,
    // A translation may carry only a title and excerpt while the body is still being written.
    // Falling back to the Polish body would be the half-translated page the rule forbids.
    content: translation.content ?? null,
    translated: true,
  };
}

/** One post's translation, or undefined. */
export async function findTranslation(postId: number | string) {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "post-translations",
    where: { post: { equals: postId } },
    limit: 1,
    depth: 0,
  });
  return result.docs[0];
}

/** Every published translation, keyed by post id, for the listing and the sitemap. */
export async function publishedTranslations(): Promise<Map<number, PostTranslation>> {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "post-translations",
    where: { status: { equals: "published" } },
    limit: 500,
    depth: 0,
  });

  const byPost = new Map<number, PostTranslation>();
  for (const doc of result.docs) {
    const id = typeof doc.post === "object" && doc.post ? doc.post.id : doc.post;
    if (typeof id === "number") byPost.set(id, doc);
  }
  return byPost;
}
