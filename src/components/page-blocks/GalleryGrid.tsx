"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { gridColumnsClass } from "./grid-columns";

export type GalleryTile = {
  alt: string;
  blurDataURL?: string;
  caption?: string;
  height?: number;
  url: string;
  width?: number;
};

type Props = {
  aspectRatio: string;
  columns: number;
  gap: string;
  lightbox: boolean;
  radius: string;
  showCaptions: boolean;
  tiles: GalleryTile[];
};

/**
 * The gallery grid, plus the lightbox when the component asks for one.
 *
 * A client component only because of the lightbox: with it switched off the
 * markup is the same grid, so an editor who does not want the overlay does not
 * pay for the interaction either.
 */
export function GalleryGrid({
  aspectRatio,
  columns,
  gap,
  lightbox,
  radius,
  showCaptions,
  tiles,
}: Props) {
  const t = useTranslations("Gallery");
  const [openIndex, setOpenIndex] = useState<null | number>(null);
  const open = openIndex !== null ? tiles[openIndex] : undefined;

  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback(
    (delta: number) =>
      setOpenIndex((current) =>
        current === null ? null : (current + delta + tiles.length) % tiles.length,
      ),
    [tiles.length],
  );

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close, openIndex, step]);

  const sizes =
    columns >= 3
      ? "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
      : "(min-width: 640px) 50vw, 100vw";

  return (
    <>
      <div className={`grid ${gridColumnsClass(columns)}`} style={{ gap }}>
        {tiles.map((tile, index) => {
          const picture = (
            <span className="relative block w-full overflow-hidden" style={{ aspectRatio, borderRadius: radius }}>
              <Image
                alt={tile.alt}
                className="object-cover"
                fill
                sizes={sizes}
                src={tile.url}
                {...(tile.blurDataURL
                  ? { placeholder: "blur" as const, blurDataURL: tile.blurDataURL }
                  : {})}
              />
            </span>
          );

          return (
            <figure className="m-0" key={`${tile.url}-${index}`}>
              {lightbox ? (
                <button
                  aria-label={t("enlarge", { name: tile.alt || tile.caption || "" })}
                  className="block w-full cursor-zoom-in transition-opacity hover:opacity-90"
                  onClick={() => setOpenIndex(index)}
                  type="button"
                >
                  {picture}
                </button>
              ) : (
                picture
              )}
              {showCaptions && tile.caption ? (
                <figcaption className="pt-2 text-label">{tile.caption}</figcaption>
              ) : null}
            </figure>
          );
        })}
      </div>

      {open ? (
        <div
          aria-label={t("lightbox")}
          aria-modal="true"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/85 p-4"
          onClick={close}
          role="dialog"
        >
          <div
            className="relative max-h-[80vh] w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              alt={open.alt}
              className="h-auto max-h-[80vh] w-full object-contain"
              height={open.height ?? 900}
              sizes="(min-width: 1024px) 1024px, 100vw"
              src={open.url}
              width={open.width ?? 1600}
            />
          </div>

          {open.caption ? <p className="text-label text-white">{open.caption}</p> : null}

          <div className="flex gap-3">
            {tiles.length > 1 ? (
              <>
                <button
                  aria-label={t("previous")}
                  className="rounded-full bg-white/15 px-4 py-2 text-white"
                  onClick={(event) => {
                    event.stopPropagation();
                    step(-1);
                  }}
                  type="button"
                >
                  ‹
                </button>
                <button
                  aria-label={t("next")}
                  className="rounded-full bg-white/15 px-4 py-2 text-white"
                  onClick={(event) => {
                    event.stopPropagation();
                    step(1);
                  }}
                  type="button"
                >
                  ›
                </button>
              </>
            ) : null}
            <button
              aria-label={t("close")}
              className="rounded-full bg-white/15 px-4 py-2 text-white"
              onClick={close}
              type="button"
            >
              ✕
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
