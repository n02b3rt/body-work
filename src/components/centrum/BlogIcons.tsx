/**
 * The two line icons the reference draws next to a post's reading time and author.
 *
 * Its exact path data and transforms, with the hard-coded `rgb(0,60,94)` swapped for
 * `currentColor` so they follow the text they sit beside. No `"use client"`: these are pure
 * markup, so the listing (a Client Component) and the post page (a Server Component) can
 * both use them.
 */

export function ClockIcon() {
  return (
    <svg width="31" height="31" viewBox="0 0 31 31" aria-hidden="true" className="shrink-0">
      <g transform="matrix(1,0,0,1,-1120.47,-694.543)">
        <g transform="matrix(0.942809,-0.942809,-0.942809,-0.942809,1143.62,709.739)">
          <ellipse
            cx="-4.218"
            cy="4.219"
            rx="6.027"
            ry="5.967"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </g>
        <g transform="matrix(1.33333,0,0,1.33333,1135.66,710.685)">
          <path d="M0,-4.226L0,0L3.371,0" fill="none" stroke="currentColor" strokeWidth="1" />
        </g>
      </g>
    </svg>
  );
}

export function PersonIcon() {
  return (
    <svg width="18" height="23" viewBox="0 0 18 23" aria-hidden="true" className="shrink-0">
      <g transform="matrix(1,0,0,1,-1259.12,-697.54)">
        <g transform="matrix(1.33333,0,0,1.33333,1261.87,700.289)">
          <path
            d="M0,13.079L0.009,12.181C0.009,9.673 1.949,7.641 4.342,7.641C6.736,7.641 8.676,9.673 8.676,12.181L8.685,13.079M6.936,2.717C6.936,4.218 5.775,5.435 4.342,5.435C2.91,5.435 1.748,4.218 1.748,2.717C1.748,1.216 2.91,0 4.342,0C5.775,0 6.936,1.216 6.936,2.717Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </g>
      </g>
    </svg>
  );
}

/** The chevron the reference paints onto its `<select>` after killing the native one. */
export function Chevron({ className }: { className?: string }) {
  return (
    <svg width="14" height="7" viewBox="0 0 14 7" aria-hidden="true" className={className}>
      <path d="M0,0L7,7L14,0" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
