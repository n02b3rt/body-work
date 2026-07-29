/**
 * Column counts are an editor choice, so the classes have to be spelled out:
 * Tailwind only emits what it can see in the source, and a template string like
 * `grid-cols-${n}` produces nothing.
 *
 * `lg:` rather than `wide:` on purpose. A `wide:` variant orders *before* `sm:`,
 * so `sm:grid-cols-2` wins over it and the grid silently stays at two columns
 * (see the trap recorded in docs/architecture.md).
 */
const COLUMN_CLASSES: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

export function gridColumnsClass(columns: number): string {
  return COLUMN_CLASSES[columns] ?? COLUMN_CLASSES[3]!;
}
