/**
 * Reads and writes one "property family" (padding, background colour, ...)
 * inside a node's `tw` bucket for the breakpoint being edited.
 *
 * `tw[breakpoint]` is a flat array of class strings, not a property bag, so
 * "what is the current padding" means finding whichever entry matches a
 * property's pattern, and "set the padding" means replacing that entry (or
 * appending one, or removing it for "none") without touching any other class
 * in the array — a colour class, a `flex` a container element carries, and
 * so on all have to survive editing an unrelated property.
 */

export function findClassMatching(classes: string[], pattern: RegExp): string | undefined {
  return classes.find((cls) => pattern.test(cls))
}

/** Replaces the one entry matching `pattern` with `next` (or removes it if `next` is null), leaving everything else untouched. */
export function setClassMatching(classes: string[], pattern: RegExp, next: string | null): string[] {
  const withoutMatch = classes.filter((cls) => !pattern.test(cls))
  return next ? [...withoutMatch, next] : withoutMatch
}

export function classPattern(prefix: string): RegExp {
  return new RegExp(`^${prefix}-`)
}
