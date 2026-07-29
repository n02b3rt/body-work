"use client";

import { useSyncExternalStore } from "react";

type FullBleedVideoProps = {
  src: string;
};

/** Client-only gate so browser extensions that inject into `<video>` (e.g. Video
 * Speed Controller's `vsc-controller` wrapper) cannot rewrite SSR HTML before
 * React hydrates and trigger a recoverable mismatch. */
const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/** Full-viewport-height video break: the scraped reference's hero video sits in its
 * own section below the title block, not layered behind the hero text (see Hero). */
export function FullBleedVideo({ src }: FullBleedVideoProps) {
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  return (
    <section className="relative h-[70vh] w-full bg-brand-navy sm:h-screen">
      {mounted ? (
        <video className="h-full w-full object-cover" autoPlay loop muted playsInline>
          <source src={src} type="video/mp4" />
        </video>
      ) : null}
    </section>
  );
}
