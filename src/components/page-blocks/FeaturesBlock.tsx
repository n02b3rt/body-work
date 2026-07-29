import Image from "next/image";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import {
  asArray,
  asRecord,
  color,
  columnCount,
  gap,
  radius,
  str,
} from "@/lib/component-values";
import { mediaFrom } from "@/lib/media";
import { gridColumnsClass } from "./grid-columns";

/** Grid of cards, each with an optional icon/photo, a title and a short description. */
export function FeaturesBlock({ data }: { data: unknown }) {
  const features = asRecord(data);
  const items = asArray(features.items);
  if (items.length === 0) return null;

  const corner = radius(features.radius, "md");
  const cardBackground = color(features.cardBackground, "surface.surface");
  const cardBorder = color(features.cardBorder, "surface.border");
  const titleColor = color(features.titleColor, "text.heading");

  return (
    <div
      className={`grid ${gridColumnsClass(columnCount(features.columns))}`}
      style={{ gap: gap(features.gap) }}
    >
      {items.map((item, index) => {
        const title = str(item.title);
        const text = str(item.text);
        const image = mediaFrom(item.image, "card", title);

        return (
          <FeatureCard
            background={cardBackground}
            border={cardBorder}
            href={str(item.href)}
            key={index}
            radius={corner}
          >
            {image ? (
              <Image
                alt={image.alt}
                className="h-16 w-16 object-cover"
                height={image.height ?? 64}
                sizes="64px"
                src={image.url}
                style={{ borderRadius: corner }}
                width={image.width ?? 64}
              />
            ) : null}
            {title ? (
              <strong className="font-normal text-h-menu" style={{ color: titleColor }}>
                {title}
              </strong>
            ) : null}
            {text ? <span className="text-body">{text}</span> : null}
          </FeatureCard>
        );
      })}
    </div>
  );
}

function FeatureCard({
  background,
  border,
  children,
  href,
  radius: corner,
}: {
  background?: string;
  border?: string;
  children: ReactNode;
  href: string;
  radius: string;
}) {
  const className = "flex flex-col items-start gap-3 p-6 transition-opacity hover:opacity-90";
  const style = {
    background,
    border: `1px solid ${border ?? "transparent"}`,
    borderRadius: corner,
  };

  if (!href) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  const isInternal = href.startsWith("/") && !href.startsWith("//");
  return isInternal ? (
    <Link className={className} href={href} style={style}>
      {children}
    </Link>
  ) : (
    <a className={className} href={href} rel="noreferrer" style={style} target="_blank">
      {children}
    </a>
  );
}
