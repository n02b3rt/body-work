import { RichText } from "@payloadcms/richtext-lexical/react";
import type { JSXConvertersFunction } from "@payloadcms/richtext-lexical/react";
import Image from "next/image";
import { mediaFrom } from "@/lib/media";

type PostBodyProps = {
  content: Parameters<typeof RichText>[0]["data"];
};

/**
 * Renders a post's Lexical body.
 *
 * The `upload` converter is overridden because the default one emits Payload's absolute
 * URL, which points at the dashboard host (`serverURL`) — unreachable for a public
 * visitor and rejected outright by `next/image`. Going through `mediaFrom` gives a
 * relative path and the `content`-width variant instead of the full original.
 */
const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  upload: ({ node }) => {
    const image = mediaFrom(node.value, "content");
    if (!image) return null;
    return (
      <Image
        src={image.url}
        alt={image.alt}
        width={image.width ?? 1200}
        height={image.height ?? 800}
        sizes="(min-width: 1440px) 1376px, (min-width: 1024px) calc(100vw - 4rem), 100vw"
        className="h-auto w-full"
      />
    );
  },
});

/**
 * No measure cap: the article fills its container, which `Container` already holds to
 * 1440px like every other section on the site.
 *
 * This was `max-w-[42rem]` (a 672px column in a 1440px row, which read as broken), then
 * briefly 60rem. Full width is the client's call, made twice — I flagged that a 1440px
 * measure puts roughly 180 characters on a line, which is past what is comfortable to read,
 * and they want it full width anyway. Noted in `docs/migration-tracker.md`; if it ever needs
 * walking back, this one class is the whole change.
 */
export function PostBody({ content }: PostBodyProps) {
  return (
    <div className="blog-prose">
      <RichText data={content} converters={converters} />
    </div>
  );
}
