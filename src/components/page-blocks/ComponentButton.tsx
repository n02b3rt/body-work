import type { CSSProperties } from "react";
import { Link } from "@/i18n/navigation";
import { asRecord, bool, buttonSize, color, radius, str } from "@/lib/component-values";

/**
 * Renders a `button` component's parameter group.
 *
 * Used both for a button placed directly on a page and for the button a hero or
 * CTA references, which is why it takes the settings group rather than a whole
 * document.
 */
export function ComponentButton({ data }: { data: unknown }) {
  const button = asRecord(data);
  const label = str(button.label, "Przycisk");
  const href = str(button.href);

  const variant = str(button.variant, "solid");
  const size = buttonSize(button.size);
  const background = color(button.background, "brand.primary");
  const textColor = color(button.textColor, "text.inverted");
  const borderColor = color(button.borderColor, null);

  const isSolid = variant === "solid";
  const isOutline = variant === "outline";
  const isLink = variant === "link";

  const style: CSSProperties = {
    borderRadius: isLink ? 0 : radius(button.radius, "full"),
    fontSize: size.fontSize,
    padding: isLink ? 0 : size.padding,
    background: isSolid ? background : "transparent",
    color: isSolid ? textColor : (borderColor ?? background),
    border: isOutline
      ? `1.5px solid ${borderColor ?? background ?? "currentColor"}`
      : "1.5px solid transparent",
    textDecoration: isLink ? "underline" : "none",
  };

  const className = [
    "inline-flex items-center justify-center text-center transition-opacity hover:opacity-85",
    bool(button.fullWidth) ? "w-full" : "",
  ]
    .filter(Boolean)
    .join(" ");

  // A button with no target is still worth rendering: the section reads as
  // designed, and an editor filling the link in later changes nothing else.
  if (!href) {
    return (
      <span className={className} style={style}>
        {label}
      </span>
    );
  }

  const newTab = bool(button.newTab);
  const isInternal = href.startsWith("/") && !href.startsWith("//");

  if (isInternal) {
    return (
      <Link
        className={className}
        href={href}
        style={style}
        {...(newTab ? { target: "_blank", rel: "noreferrer" } : {})}
      >
        {label}
      </Link>
    );
  }

  return (
    <a
      className={className}
      href={href}
      style={style}
      {...(newTab ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {label}
    </a>
  );
}

/** Reads the button a hero/CTA points at, which arrives populated at depth ≥ 2. */
export function linkedButtonSettings(value: unknown): unknown {
  const doc = asRecord(value);
  return doc.button;
}
