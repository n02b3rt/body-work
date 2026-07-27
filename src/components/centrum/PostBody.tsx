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
        sizes="(min-width: 1024px) 672px, 100vw"
        className="h-auto w-full"
      />
    );
  },
});

export function PostBody({ content }: PostBodyProps) {
  return (
    <div className="blog-prose max-w-[42rem]">
      <RichText data={content} converters={converters} />
    </div>
  );
}
