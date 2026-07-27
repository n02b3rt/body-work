import { RichText } from "@payloadcms/richtext-lexical/react";
import type { JSXConvertersFunction } from "@payloadcms/richtext-lexical/react";
import Image from "next/image";
import { mediaFrom } from "@/lib/media";

type PostBodyProps = {
  content: Parameters<typeof RichText>[0]["data"];
};

/**
 * Builds the converters for one article.
 *
 * A function rather than a module constant because the heading converter counts levels as it
 * goes, and that counter has to start fresh for every post. Shared at module scope it would
 * leak the first article's structure into the next one.
 */
function buildConverters(): JSXConvertersFunction {
  /** The level the article's own first heading used, whatever it happened to be. */
  let topLevel: number | null = null;

  return ({ defaultConverters }) => ({
    ...defaultConverters,

    /**
     * Re-bases the article's headings so its top level renders as `h2`.
     *
     * Lighthouse flags "heading elements are not in a sequentially-descending order": some
     * imported articles open at `h3` with no `h2` above them, which leaves a hole in the
     * outline a screen reader reads out. The page's `h1` is the post title, so the article's
     * own top level belongs at `h2` and everything under it shifts by the same amount, which
     * keeps the author's relative structure intact.
     *
     * **Not a word of the copy changes**, only the tag wrapped around it.
     */
    heading: ({ node, nodesToJSX }) => {
      const level = Number(String(node.tag ?? "h2").replace("h", "")) || 2;
      if (topLevel === null) topLevel = level;

      const shifted = Math.min(6, Math.max(2, level - topLevel + 2));
      const Tag = `h${shifted}` as "h2" | "h3" | "h4" | "h5" | "h6";

      return <Tag>{nodesToJSX({ nodes: node.children })}</Tag>;
    },

    /**
     * Overridden because the default emits Payload's absolute URL, which points at the
     * dashboard host (`serverURL`): unreachable for a public visitor and rejected outright by
     * `next/image`. Going through `mediaFrom` gives a relative path instead.
     */
    upload: ({ node }) => {
      // `hero` (1920) rather than `content` (1200): the article body is full width now, so its
      // images occupy up to 1376 CSS px and a 1200px source was being stretched. This costs
      // nothing in transfer, since the width served is decided by `sizes` below rather than by
      // how large the source is; it only stops the optimizer working from too small a picture.
      const image = mediaFrom(node.value, "hero");
      if (!image) return null;

      return (
        <Image
          src={image.url}
          alt={image.alt}
          width={image.width ?? 1200}
          height={image.height ?? 800}
          sizes="(min-width: 1440px) 1376px, (min-width: 1024px) calc(100vw - 4rem), 100vw"
          // Never blown up past its own pixels. The body is 1376px wide and **75 of the 150
          // in-article images are narrower than that**, one of them 196px, so `w-full` alone
          // was stretching them by up to seven times into mush. The reference does the same
          // thing (`db w100p ha`, no cap) but its column was half the width, which hid how
          // bad it was. Centred, so a narrow figure reads as deliberate rather than stranded.
          className="mx-auto h-auto w-full"
          style={image.width ? { maxWidth: `${image.width}px` } : undefined}
          {...(image.blurDataURL
            ? { placeholder: "blur" as const, blurDataURL: image.blurDataURL }
            : {})}
        />
      );
    },
  });
}

/**
 * No measure cap: the article fills its container, which `Container` already holds to
 * 1440px like every other section on the site.
 *
 * This was `max-w-[42rem]` (a 672px column in a 1440px row, which read as broken), then
 * briefly 60rem. Full width is the client's call, made twice. I flagged that a 1440px measure
 * puts roughly 180 characters on a line, which is past what is comfortable to read, and they
 * want it full width anyway. Noted in `docs/migration-tracker.md`; if it ever needs walking
 * back, this one class is the whole change.
 */
export function PostBody({ content }: PostBodyProps) {
  return (
    <div className="blog-prose">
      <RichText data={content} converters={buildConverters()} />
    </div>
  );
}
