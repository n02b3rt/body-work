import { asRecord, aspect, bool, columnCount, gap, radius } from "@/lib/component-values";
import { mediaFrom } from "@/lib/media";
import { GalleryGrid, type GalleryTile } from "./GalleryGrid";

/** Grid of photographs, optionally enlarged on click. */
export function GalleryBlock({ data }: { data: unknown }) {
  const gallery = asRecord(data);
  const raw = Array.isArray(gallery.images) ? gallery.images : [gallery.images];

  const tiles = raw.reduce<GalleryTile[]>((acc, value) => {
    const image = mediaFrom(value, "content");
    if (!image) return acc;
    const caption = asRecord(value).caption;
    acc.push({
      alt: image.alt,
      blurDataURL: image.blurDataURL,
      caption: typeof caption === "string" ? caption : undefined,
      height: image.height,
      url: image.url,
      width: image.width,
    });
    return acc;
  }, []);

  if (tiles.length === 0) return null;

  return (
    <GalleryGrid
      aspectRatio={aspect(gallery.aspectRatio, "1-1")}
      columns={columnCount(gallery.columns)}
      gap={gap(gallery.gap)}
      lightbox={bool(gallery.lightbox)}
      radius={radius(gallery.radius, "md")}
      showCaptions={bool(gallery.showCaptions)}
      tiles={tiles}
    />
  );
}
