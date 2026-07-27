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
        sizes="(min-width: 1024px) 960px, 100vw"
        className="h-auto w-full"
      />
    );
  },
});

/**
 * The measure is 60rem, not the 42rem this used to be.
 *
 * 42rem left the article in a 672px column inside a 1440px container — half the row empty,
 * which is what the client saw as the page being broken. 60rem (960px) is a little wider
 * than the reference's own body column (~886px, being 50% of the row less its padding) and
 * fills the space without running the text to the full 1440px, where a line would be about
 * 180 characters and genuinely hard to read. Left-aligned so it shares an edge with the
 * title and author above it.
 */
export function PostBody({ content }: PostBodyProps) {
  return (
    <div className="blog-prose max-w-[60rem]">
      <RichText data={content} converters={converters} />
    </div>
  );
}
