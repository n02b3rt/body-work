/** A spacer's height comes entirely from its own `tw` (`h-8`, `lg:h-16` by default); nothing to render but the box itself. */
export function Spacer() {
  return <div aria-hidden="true" />
}
