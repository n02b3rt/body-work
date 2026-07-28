import Image from "next/image";
import {
  asRecord,
  color,
  flexAlign,
  num,
  radius,
  sectionHeight,
  str,
  textAlign,
} from "@/lib/component-values";
import { mediaFrom } from "@/lib/media";
import { ComponentButton, linkedButtonSettings } from "./ComponentButton";

/** Opening section: background photograph, darkening overlay, heading and a button. */
export function HeroBlock({ data }: { data: unknown }) {
  const hero = asRecord(data);
  const image = mediaFrom(hero.image, "hero");
  const heading = str(hero.heading);
  const subheading = str(hero.subheading);
  const buttonSettings = linkedButtonSettings(hero.ctaButton);

  const corner = radius(hero.radius, "md");
  const overlay = Math.min(Math.max(num(hero.overlayOpacity, 45), 0), 100) / 100;

  return (
    <div
      className="relative isolate flex w-full overflow-hidden"
      style={{ borderRadius: corner, minHeight: sectionHeight(hero.height) }}
    >
      {image ? (
        <Image
          alt={image.alt}
          className="object-cover"
          fill
          sizes="100vw"
          src={image.url}
          {...(image.blurDataURL
            ? { placeholder: "blur" as const, blurDataURL: image.blurDataURL }
            : {})}
        />
      ) : null}

      {image && overlay > 0 ? (
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background: color({ token: "surface.overlay" }, "surface.overlay"),
            opacity: overlay,
          }}
        />
      ) : null}

      <div
        className="relative z-10 flex w-full flex-col justify-center gap-6 px-6 py-16 sm:px-10"
        style={{
          alignItems: flexAlign(hero.align),
          color: color(hero.textColor, "text.inverted"),
          textAlign: textAlign(hero.align),
        }}
      >
        {/* The type scale is shared with `SectionHeading`, but not the component
          * itself: it hardcodes `text-brand-navy`, and these blocks take their
          * colour from the palette the editor picked. */}
        {heading ? (
          <h2 className="max-w-4xl font-normal text-h-mobile wide:text-h-section">{heading}</h2>
        ) : null}
        {subheading ? <p className="max-w-2xl text-body">{subheading}</p> : null}
        {buttonSettings ? <ComponentButton data={buttonSettings} /> : null}
      </div>
    </div>
  );
}
