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
