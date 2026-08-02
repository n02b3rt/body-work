import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * `eslint-plugin-react` 7.37 arrives through `eslint-config-next` and predates
 * ESLint 10's rule context API. Every one of its rules throws
 * `contextOrFilename.getFilename is not a function` **at load time**, which fails
 * the entire run before a single file is read: that is why `pnpm lint` was broken
 * on `main`.
 *
 * Disabling them one by one is a losing game, so they are stripped as a group.
 * Everything else survives, which is the part that earns its keep here:
 * `@next/next/*` (image and script correctness) and `react-hooks/*`.
 *
 * **This is a workaround, not the fix.** The fix is upgrading the plugin, which
 * means a lockfile change. Delete this filter the moment that happens.
 */
function withoutBrokenReactRules(configs) {
  return configs.map((config) => {
    if (!config?.rules) return config;
    const rules = Object.fromEntries(
      Object.entries(config.rules).filter(([rule]) => !rule.startsWith("react/")),
    );
    return { ...config, rules };
  });
}

const eslintConfig = defineConfig([
  ...withoutBrokenReactRules(nextVitals),
  ...withoutBrokenReactRules(nextTs),
  {
    /**
     * Fires in exactly three places, and all three are the same deliberate
     * pattern: a `mounted` flag settled once on mount, or a capability fallback
     * (`FullBleedVideo` loading the video when `IntersectionObserver` is absent).
     * `GalleryView` already carries a comment explaining that its effect was
     * split this way *for* this rule.
     *
     * Kept as a warning rather than silenced: the signal is worth seeing, and
     * these three deserve a proper look with the app running. Rewriting working
     * hydration guards to satisfy a rule, blind, is how a working app breaks.
     */
    rules: {
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "scripts/scrape/scraped/**",
    // Nothing here is worth linting: it is the config itself.
    "eslint.config.mjs",
  ]),
]);

export default eslintConfig;
