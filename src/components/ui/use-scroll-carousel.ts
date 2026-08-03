"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

/** Same client-only gate `FullBleedVideo` uses, for the same reason: tell the server and the
 * first client render apart without a hydration mismatch. */
const subscribe = () => () => {};
const onClient = () => true;
const onServer = () => false;

/**
 * The slides to render: the real ones on the server, doubled once the browser has them.
 *
 * The loop needs a second copy to wrap into, but only script can drive that loop, so shipping
 * the copy in the HTML makes the server render, and every visitor hydrate, twice the DOM for
 * something nothing can use yet. LCP on this site is 85% render delay, which is main-thread
 * time, so DOM that exists before it is needed is the exact wrong kind of weight.
 *
 * The second pass must stay `aria-hidden`: see how the call sites index against `items.length`.
 */
export function useLoopedSlides<T>(items: T[], loop = true): T[] {
  const hydrated = useSyncExternalStore(subscribe, onClient, onServer);
  return loop && hydrated ? [...items, ...items] : items;
}

/**
 * A looping, autoplaying carousel built on the browser's own scroller.
 *
 * Replaces `embla-carousel-react` plus `embla-carousel-autoplay`, which cost about 7 KB
 * gzipped per page to do in JavaScript what `scroll-snap-type: x mandatory` does natively:
 * snapping, dragging, momentum, trackpads, touch, keyboard, and the platform's own feel.
 * What is left here is only what CSS has no answer for: arrows, autoplay and the loop.
 *
 * **The track must render its slides twice**, the same trick `PartnerLogos` uses for its
 * marquee, and `count` must say how many are real. That is what makes the loop seamless:
 * past the first copy the scroller is looking at an identical second one, so jumping back by
 * exactly one copy is invisible. The reference site loops (Swiper, `loop: true`), so
 * rewinding to the start instead would have changed the behaviour, not just the machinery.
 */
export function useScrollCarousel({
  autoplayMs,
  count,
  loop = true,
  stopOnInteraction = false,
  trackActive = false,
}: {
  autoplayMs?: number;
  /** How many slides are real, ignoring the duplicated copy. Required to loop. */
  count?: number;
  /**
   * Track which slide is showing, for a caller that draws dots.
   *
   * Off by default, and that is not a micro-optimisation: it re-renders the whole track on
   * every scroll, and the track holds twice the slides. The two site carousels have no dots,
   * and setting this for them cost about 140 ms of total blocking time for a number nothing
   * read. Measured with Lighthouse, three runs each way.
   */
  trackActive?: boolean;
  /** Off means no duplicate copy and no wrap: the scroller stops at both ends. The page
   * builder exposes this per carousel. */
  loop?: boolean;
  /** The quotes carousel stops for good once touched; the news ticker keeps going. */
  stopOnInteraction?: boolean;
} = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const stopped = useRef(false);
  const settle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [active, setActive] = useState(0);

  const slidesOf = (node: HTMLElement) => node.firstElementChild?.children;

  /**
   * One slide's worth of travel, measured rather than assumed: slides are sized in
   * percentages that change at every breakpoint, so the elements are the only honest source.
   * Two offsets rather than a width plus a gap, because that also absorbs whatever padding
   * or border the track carries.
   */
  const step = useCallback((node: HTMLElement) => {
    const slides = slidesOf(node);
    const first = slides?.[0];
    const second = slides?.[1];
    if (!(first instanceof HTMLElement) || !(second instanceof HTMLElement)) {
      return node.clientWidth;
    }
    return second.offsetLeft - first.offsetLeft;
  }, []);

  /**
   * The distance from a slide to its duplicate: exactly one copy of the track.
   *
   * **Not `scrollWidth / 2`.** The track's own left and right padding is not part of either
   * copy, so half the scroll width lands a few pixels off, and with `snap-mandatory` the
   * browser then quantises the wrap to the nearest snap point. The loop drifted visibly.
   */
  const copy = useCallback(
    (node: HTMLElement) => {
      const slides = slidesOf(node);
      const first = slides?.[0];
      const twin = count ? slides?.[count] : undefined;
      if (!(first instanceof HTMLElement) || !(twin instanceof HTMLElement)) return 0;
      return twin.offsetLeft - first.offsetLeft;
    },
    [count],
  );

  /**
   * Reposition without the snap engine correcting it.
   *
   * A plain `scrollLeft` assignment on a `snap-mandatory` scroller is snapped to the nearest
   * snap point, which is exactly what must not happen to a wrap that is supposed to be
   * invisible. Suspending snapping for the assignment is the standard way round it.
   */
  const jump = (node: HTMLElement, to: number) => {
    const previous = node.style.scrollSnapType;
    node.style.scrollSnapType = "none";
    node.scrollLeft = to;
    // Force a reflow so the assignment is committed before snapping comes back on.
    void node.offsetHeight;
    node.style.scrollSnapType = previous;
  };

  const nudge = useCallback(
    (direction: 1 | -1) => {
      const node = ref.current;
      if (!node) return;
      if (stopOnInteraction) stopped.current = true;

      // Going back from the very start would hit the scroller's floor at 0 and stop. Jumping
      // forward one whole copy first gives the smooth scroll somewhere to go, and the copies
      // are identical so nothing moves on screen.
      const distance = loop ? copy(node) : 0;
      if (distance && direction === -1 && node.scrollLeft < step(node)) {
        jump(node, node.scrollLeft + distance);
      }
      node.scrollBy({ left: direction * step(node), behavior: "smooth" });
    },
    [copy, loop, step, stopOnInteraction],
  );

  const scrollPrev = useCallback(() => nudge(-1), [nudge]);
  const scrollNext = useCallback(() => nudge(1), [nudge]);

  /** Jump straight to one slide, for the page builder's dots. */
  const scrollTo = useCallback(
    (index: number) => {
      const node = ref.current;
      if (!node) return;
      if (stopOnInteraction) stopped.current = true;
      node.scrollTo({ left: index * step(node), behavior: "smooth" });
    },
    [step, stopOnInteraction],
  );

  // Wrap back by one copy once the scroller comes to rest inside the second one, and note
  // which slide it settled on. Both wait for the same lull: moving `scrollLeft` while a
  // smooth scroll is running cancels it, which reads as the carousel stuttering.
  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    function onScroll() {
      if (!node) return;
      clearTimeout(settle.current);
      settle.current = setTimeout(() => {
        const distance = loop ? copy(node) : 0;
        if (distance && node.scrollLeft >= distance) {
          jump(node, node.scrollLeft - distance);
        }
        if (trackActive && count) {
          const size = step(node);
          if (size > 0) setActive(Math.round(node.scrollLeft / size) % count);
        }
      }, 120);
    }

    node.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      node.removeEventListener("scroll", onScroll);
      clearTimeout(settle.current);
    };
  }, [copy, count, loop, step, trackActive]);

  // Autoplay, which nobody who asked for less motion gets at all.
  useEffect(() => {
    if (!autoplayMs) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = setInterval(() => {
      if (stopped.current) return;
      // A carousel advancing in a background tab is wasted work, and it lands the reader
      // somewhere they did not leave it. Chrome will not animate a hidden tab anyway.
      if (document.hidden) return;
      const node = ref.current;
      if (!node) return;
      node.scrollBy({ left: step(node), behavior: "smooth" });
    }, autoplayMs);

    return () => clearInterval(timer);
  }, [autoplayMs, step]);

  return { active, ref, scrollNext, scrollPrev, scrollTo };
}

/**
 * Utility classes for the scroll container, so the call sites cannot drift apart.
 *
 * Deliberately **not** `flex`: the track inside it is the flex container and the slides size
 * themselves as a percentage of it. Making this one a flex container too would turn that
 * track into a flex item that shrinks to its content, and every percentage would resolve
 * against the wrong box.
 *
 * The scrollbar is hidden rather than styled, matching the reference, which shows none.
 * Tailwind has no `scrollbar-width` utility, hence the bracket syntax.
 */
export const carouselViewport =
  "snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
