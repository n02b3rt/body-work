import { ICON_VIEWBOX } from "./icon-names";
import { ICON_MARKUP } from "./icon-shapes";

/**
 * Every brand mark the site draws, once per document, as `<symbol>` definitions.
 *
 * Render it high in `<body>` from the locale layout. A `<use>` can only reference a symbol
 * already present in the document, so anything above this in the tree would point at nothing.
 *
 * **Keep it a server component and keep it out of any `"use client"` subtree.** It is the
 * only importer of `icon-shapes.ts`, and that is what stops 12 KB of path data being bundled
 * for the browser on top of the HTML that already carries it.
 *
 * `dangerouslySetInnerHTML` is the point rather than a shortcut: these are our own static
 * brand files with no input of any kind reaching them, and holding them as raw SVG is what
 * avoids rewriting `fill-rule` and `stroke-width` into JSX by hand. See `icon-shapes.ts`.
 */
export function IconSprite() {
  return (
    <svg
      aria-hidden
      focusable="false"
      // Not `hidden` and not `display: none`: both take the symbols out of rendering in a
      // way some engines extend to anything referencing them. Zero-sized and out of flow
      // takes no space and no paint while leaving every `<use>` able to resolve.
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      {Object.entries(ICON_MARKUP).map(([name, markup]) => (
        <symbol
          key={name}
          id={`bw-icon-${name}`}
          viewBox={ICON_VIEWBOX[name as keyof typeof ICON_VIEWBOX]}
          dangerouslySetInnerHTML={{ __html: markup }}
        />
      ))}
    </svg>
  );
}
