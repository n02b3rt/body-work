import { asRecord, color, flexAlign, radius, str, textAlign } from "@/lib/component-values";
import { ComponentButton, linkedButtonSettings } from "./ComponentButton";

const PADDING = {
  sm: "1.5rem 1.75rem",
  md: "2.5rem 2rem",
  lg: "4rem 2.5rem",
} as const;

/** Highlighted band with a heading, a line of copy and one button. */
export function CtaBlock({ data }: { data: unknown }) {
  const cta = asRecord(data);
  const heading = str(cta.heading);
  const text = str(cta.text);
  const buttonSettings = linkedButtonSettings(cta.button);
  const paddingKey = str(cta.padding, "md") as keyof typeof PADDING;

  return (
    <div
      className="flex w-full flex-col gap-4"
      style={{
        alignItems: flexAlign(cta.align),
        background: color(cta.background, "brand.secondary"),
        borderRadius: radius(cta.radius, "lg"),
        color: color(cta.textColor, "text.inverted"),
        padding: PADDING[paddingKey] ?? PADDING.md,
        textAlign: textAlign(cta.align),
      }}
    >
      {heading ? <h2 className="font-normal text-h-tile">{heading}</h2> : null}
      {text ? <p className="max-w-2xl text-body">{text}</p> : null}
      {buttonSettings ? <ComponentButton data={buttonSettings} /> : null}
    </div>
  );
}
