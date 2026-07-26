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
