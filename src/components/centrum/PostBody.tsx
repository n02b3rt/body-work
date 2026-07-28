import { RichText } from "@payloadcms/richtext-lexical/react";
import type { JSXConvertersFunction } from "@payloadcms/richtext-lexical/react";
import Image from "next/image";
import { mediaFrom } from "@/lib/media";
import {
  collectDisplaySizes,
  resolveDisplayWidth,
  takeSyncedSize,
  type DisplaySizeMap,
} from "@/lib/image-display";

type PostBodyProps = {
  content: Parameters<typeof RichText>[0]["data"];
  /**
   * The Polish body, when rendering a translation.
   *
   * Image widths are chosen on the Polish version and the translation follows, so the two
   * languages cannot end up disagreeing about how big a photograph is. Only where the
   * translation puts a *different* file in that slot does it keep its own choice.
   */
  syncSizesFrom?: Parameters<typeof RichText>[0]["data"] | null;
};

/**
 * Builds the converters for one article.
 *
 * A function rather than a module constant because the heading converter counts levels as it
 * goes, and that counter has to start fresh for every post. Shared at module scope it would
 * leak the first article's structure into the next one.
 */
function buildConverters(syncedSizes: DisplaySizeMap | null): JSXConvertersFunction {
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

      /**
       * Width comes from the editor's choice on the upload node, or is worked out from the file
       * when they left it alone. Two things it guarantees: nothing is ever stretched past its own
       * pixels (which had left 75 of the 150 in-article images mushy, one of them by sevenfold),
       * and `auto` aims for double the displayed width so a photograph stays sharp on a 2x
       * screen. See src/lib/image-display.ts.
       */
      const value = node.value as { id?: number } | number | undefined;
      const mediaId = typeof value === "number" ? value : (value?.id ?? null);

      // The Polish version's choice wins where it is the same file; otherwise this node's own.
      const own = (node.fields as { displaySize?: string } | undefined)?.displaySize;
      const chosen = takeSyncedSize(syncedSizes, mediaId) ?? own;
      const displayWidth = resolveDisplayWidth(chosen, image.width);

      return (
        <Image
          src={image.url}
          alt={image.alt}
          width={image.width ?? 1200}
          height={image.height ?? 800}
          // The rendered box is known, so tell the optimizer that rather than the container.
          sizes={displayWidth ? `${displayWidth}px` : "(min-width: 1440px) 1376px, 100vw"}
          // Centred, so an image narrower than the column reads as deliberate rather than
          // stranded against the left edge.
          className="mx-auto h-auto w-full"
          style={displayWidth ? { maxWidth: `${displayWidth}px` } : undefined}
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
export function PostBody({ content, syncSizesFrom }: PostBodyProps) {
  // Built per render, because both the heading counter and the size queues are consumed as the
  // tree is walked and must start fresh for each article.
  const syncedSizes = syncSizesFrom ? collectDisplaySizes(syncSizesFrom) : null;

  return (
    <div className="blog-prose">
      <RichText data={content} converters={buildConverters(syncedSizes)} />
    </div>
  );
}
