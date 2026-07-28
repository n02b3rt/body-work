import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "path";
import { fileURLToPath } from "url";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const nextConfig: NextConfig = {
  serverExternalPackages: ["@ffmpeg-installer/ffmpeg", "fluent-ffmpeg", "sharp"],
  images: {
    // Setting `localPatterns` at all switches next/image from "any local path" to an
    // allowlist — anything unmatched fails with `next-image-unconfigured-localpatterns`.
    // So the site's own photos in `public/images` have to be listed alongside Payload's
    // uploads, or every page's imagery 400s.
    localPatterns: [{ pathname: "/api/media/file/**" }, { pathname: "/images/**" }],
    // AVIF first, WebP as the fallback. Without this Next only ever answers WebP —
    // measured: every `/_next/image` response came back `image/webp` even when the browser
    // advertised AVIF. AVIF is typically 20-30% smaller on photographs, which is what
    // almost every image on this site is. The cost is a slower first encode per
    // width/quality pair; results are cached, so it is paid once.
    formats: ["image/avif", "image/webp"],
    // The default width ladder has no rung matching the sizes this site actually renders, so
    // browsers were rounding **up** to the next one and paying for pixels nobody sees.
    //
    // Measured on an in-article image in a 720px slot: a 2x screen needs 1440 wide, the nearest
    // candidate was 1920, and it downloaded 202.7KB. The 1200 rung is 96.8KB, so the jump to
    // 1920 was costing roughly 90KB per image, on the most common slot on the blog. (It was
    // never fetching the stored 2560px original, which is the thing that looks alarming and
    // isn't happening: `sizes` already prevents that.)
    //
    // These are the exact 1x and 2x widths of the ladder in `src/lib/image-display.ts`:
    // 480 and 1376 for 1x, 960 and 1440 for 2x. 1024's double, 2048, is already a default.
    // 1376's double, 2752, is deliberately left out: uploads are capped at 2560, so the
    // optimizer would clamp a 2752 request back down and deliver identical bytes.
    //
    // 720 and 1024 at 1x are also missing, and stay missing: 750 and 1080 already cover them
    // to within 5%, which is not worth another candidate in every `srcset` on the site.
    //
    // They belong in `imageSizes` rather than `deviceSizes` because Next uses
    // `deviceSizes[0]` as the floor when filtering candidates for `vw`-based images, and
    // dropping that floor from 640 to 480 would pull tiny widths into every card grid.
    // Both lists are merged for fixed-px `sizes` like ours, so nothing is lost.
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 480, 960, 1376, 1440],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      ".cjs": [".cts", ".cjs"],
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    };

    return webpackConfig;
  },
  turbopack: {
    root: path.resolve(dirname),
  },
};

export default withPayload(withNextIntl(nextConfig), { devBundleServerPackages: false });
