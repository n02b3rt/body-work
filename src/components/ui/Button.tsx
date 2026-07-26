import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "outline" | "solid" | "brand";

export function buttonClasses(variant: ButtonVariant = "outline", className?: string) {
  return cn(
    // Sizing/type copied from the reference's button (mih14/ph7/f2.5s2/ls0.1em, no
    // font-weight class → body weight). See docs/scraped-site-map.md.
    "inline-flex min-h-14 w-fit items-center justify-center rounded-full border border-brand-navy-soft px-7 text-center text-btn font-normal uppercase tracking-[0.1em] transition-colors duration-200",
    variant === "outline" &&
      "bg-background text-brand-navy hover:bg-brand-navy hover:text-background",
    variant === "solid" &&
      "bg-brand-navy text-background hover:bg-background hover:text-brand-navy",
    variant === "brand" &&
      "border-transparent bg-brand-green text-background hover:bg-brand-navy",
    className,
  );
}

type ButtonAsLink = {
  variant?: ButtonVariant;
  className?: string;
  href: string;
} & AnchorHTMLAttributes<HTMLAnchorElement>;

type ButtonAsButton = {
  variant?: ButtonVariant;
  className?: string;
  href?: undefined;
} & ButtonHTMLAttributes<HTMLButtonElement>;

/** Plain-anchor / plain-button styled CTA. For internal, locale-aware links, prefer
 * next-intl's `Link` from `@/i18n/navigation` with `buttonClasses()` instead. */
export function Button(props: ButtonAsLink | ButtonAsButton) {
  const { variant = "outline", className, ...rest } = props;
  const classes = buttonClasses(variant, className);

  if (rest.href) {
    return <a className={classes} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)} />;
  }
  return <button className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)} />;
}
