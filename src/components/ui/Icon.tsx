import { ICON_VIEWBOX, type IconName } from "./icon-names";

/**
 * One brand mark, drawn from the sprite `IconSprite` puts at the top of `<body>`.
 *
 * Costs no network request: `<use>` points at a `<symbol>` already in the document. Colour
 * comes from `currentColor`, so a Tailwind text colour here or on any ancestor is what
 * paints it. That is how navy, white and the hover state are all the same symbol.
 *
 * `label` decides what assistive technology hears. Give it to the one that carries meaning,
 * usually the logo inside the home link, and leave it off the decorative repeats: an
 * unlabelled icon renders `aria-hidden` and drops out of the accessibility tree entirely.
 */
export function Icon({
  name,
  label,
  className,
}: {
  name: IconName;
  label?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox={ICON_VIEWBOX[name]}
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <use href={`#bw-icon-${name}`} />
    </svg>
  );
}
