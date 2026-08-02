/**
 * Reads the prices back out of the pricing page's own copy.
 *
 * The price list lives in `messages/*.json` as free text, because that is what an editor edits and
 * what the reference shows. Deriving the structured data from that same text is deliberate: a
 * second, hand-kept list of prices would drift, and a wrong price in a search result is worse than
 * no price at all.
 *
 * **Only the amounts are read, never the labels.** The amounts are unambiguous, every one of them
 * carrying a Polish price marker. The labels are not: on the massage row the name of the treatment
 * sits on the line *above* its price, and "1 trening" appears three times at three different
 * levels, so reconstructing 64 individually named offers means 64 chances to publish a mangled
 * one. A range per service says exactly as much as the page does and cannot be mangled.
 */

/** Lowest and highest amount found, and how many amounts that range was drawn from. */
export type PriceRange = { low: number; high: number; count: number };

/**
 * A number followed by a Polish price marker: `240,-`, `560zł`, `795 zł`.
 *
 * The marker is what makes this safe. "Konsultacja USG + trening (1,5h)" contains a comma-number
 * and "(pakiet 5x)" contains a bare digit; neither is followed by `,-` or `zł`, so neither can be
 * read as a price. Thousands are written without separators here, but a space is tolerated.
 */
const PRICE = /([0-9][0-9 ]*)\s*(?:,-|zł)/g;

/**
 * The price range across some pieces of copy, or null when they name no price at all.
 *
 * Pass the price list itself (a row's body and any per-person sub-lists). Deliberately **not** the
 * trailing note: those carry incidental amounts, such as the group-class entry cards sold
 * alongside a training package, which would stretch the range past what the row is about.
 */
export function priceRangeFrom(texts: (string | null | undefined)[]): PriceRange | null {
  const amounts: number[] = [];

  for (const text of texts) {
    if (!text) continue;
    for (const match of text.matchAll(PRICE)) {
      const value = Number(match[1].replace(/\s/g, ""));
      if (Number.isFinite(value) && value > 0) amounts.push(value);
    }
  }

  if (amounts.length === 0) return null;
  return { low: Math.min(...amounts), high: Math.max(...amounts), count: amounts.length };
}
