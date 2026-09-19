export type SplitPanel = { key: string; heading: string; body: string; ctaLabel: string; href: string };

type ThreeWaySplitProps = { pageHeading: string; items: SplitPanel[] };

/**
 * The reference's `#trojpodzial` band (`body-work.com.pl/pl/home-trojpodzial/`): three centred
 * columns on its navy, split by its light rules, each a name, a line and an outlined link.
 *
 * The reference sizes everything in `vw` (headings at 2.5vw, body at 0.9vw), which is unreadable on
 * a phone and oversized on a wide screen; here the columns stack below `md` and the type is fixed.
 * Every `href` is a different host, so each link is a plain anchor, in the same tab: leaving the
 * hub is the point of the page. The reference's three `<h1>`s become one visually hidden page
 * heading and three `<h2>`s.
 */
export function ThreeWaySplit({ pageHeading, items }: ThreeWaySplitProps) {
  return (
    <section aria-labelledby="hub-heading" className="bg-[#003b5e]">
      <h1 id="hub-heading" className="sr-only">
        {pageHeading}
      </h1>
      <ul className="grid border-t border-[#cbd0d6] md:grid-cols-3">
        {items.map((item) => (
          <li
            key={item.key}
            className="flex flex-col items-center justify-center border-b border-[#cbd0d6] px-6 py-16 text-center last:border-b-0 md:min-h-[26rem] md:border-b-0 md:border-r md:px-8 md:last:border-r-0 lg:px-12"
          >
            <h2 className="text-balance text-[1.75rem] font-semibold uppercase leading-[1.2] tracking-[0.03em] text-white lg:text-[2.25rem]">
              {item.heading}
            </h2>
            <p className="mt-5 max-w-[36ch] text-[0.9375rem] leading-[1.6] tracking-[0.04em] text-white/90">
              {item.body}
            </p>
            <a
              href={item.href}
              className="mt-8 inline-flex min-h-12 items-center border border-white px-6 text-[0.875rem] uppercase tracking-[0.04em] text-white transition-colors hover:bg-white hover:text-[#003b5e] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              {item.ctaLabel}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
