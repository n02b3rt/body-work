"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type FullBleedVideoProps = {
  /** Base path without an extension: `.webm` is offered first, `.mp4` as the fallback. */
  src: string;
  poster: string;
  posterAlt: string;
  /**
   * The poster's blur placeholder, passed in rather than looked up here.
   *
   * This is a client component, and importing the placeholder map would ship all 3.4KB of it to
   * every visitor whether the page needs it or not. The page reads it on the server instead. See
   * `src/lib/static-blur.ts`.
   */
  posterBlur?: string;
};

/**
 * Full-viewport-height video break: the scraped reference's hero video sits in its own section
 * below the title block, not layered behind the hero text (see Hero).
 *
 * **The poster carries the first paint and the video only loads once it is nearly in view.** The
 * original file was 8388KB of 720p h264 with an audio track the muted player never used, and it
 * downloaded on every visit including phones. Now:
 *
 * - the poster is a 17KB WebP with a blur placeholder under it, so the section is never empty
 * - `preload="none"` plus an `IntersectionObserver` means nothing else is fetched until the
 *   section is within one viewport of being seen
 * - VP9 is offered first at 1736KB, h264 follows at 2800KB for Safari
 * - `prefers-reduced-motion` leaves the poster in place and never fetches the video at all
 *
 * See `scripts/optimize-hero-video.mjs` for the encode, which the video files are gitignored
 * inputs to only in the case of the original footage.
 */
export function FullBleedVideo({ src, poster, posterAlt, posterBlur }: FullBleedVideoProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Someone who has asked for less motion gets the still, and no video bytes.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Same for anyone on a metered connection who has turned Data Saver on: the poster is the
    // whole point of having one.
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (connection?.saveData) return;

    const node = sectionRef.current;
    if (!node) return;

    // No observer support means load it the old way rather than never.
    if (typeof IntersectionObserver === "undefined") {
      setLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setLoad(true);
          observer.disconnect();
        }
      },
      // One viewport of warning, so it is usually decoded by the time it is scrolled to.
      { rootMargin: "100% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[70vh] w-full overflow-hidden sm:h-screen">
      {/* Stays mounted underneath: it is what shows before the video loads, while it buffers, and
        * for anyone who never gets the video at all. `priority` because it is high on the page. */}
      <Image
        src={poster}
        alt={posterAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
        {...(posterBlur ? { placeholder: "blur" as const, blurDataURL: posterBlur } : {})}
      />

      {load ? (
        <video
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            ready ? "opacity-100" : "opacity-0"
          }`}
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          // Handing the poster to the element too keeps the frame steady if it stalls mid-buffer.
          poster={poster}
          onCanPlay={() => setReady(true)}
          aria-hidden
        >
          {/* Narrow screens first. A phone showing a 390px-wide section has no use for a 1280px
            * encode, and the 720px one is 733KB against 1736KB. `media` on a `<source>` is
            * evaluated once when the element loads, which is exactly when this mounts. */}
          <source media="(max-width: 640px)" src={`${src}-sm.webm`} type="video/webm" />
          <source media="(max-width: 640px)" src={`${src}-sm.mp4`} type="video/mp4" />
          <source src={`${src}.webm`} type="video/webm" />
          <source src={`${src}.mp4`} type="video/mp4" />
        </video>
      ) : null}
    </section>
  );
}
