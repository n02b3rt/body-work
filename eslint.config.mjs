import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
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
  {
    // eslint-plugin-react 7.37 arrives through eslint-config-next and predates
    // ESLint 10's rule context API, so rules that reach for the old signature
    // throw "contextOrFilename.getFilename is not a function" and take the whole
    // run down. Turning the offenders off keeps every other rule working.
    // The real fix is upgrading the plugin; that needs a lockfile change.
    rules: {
      "react/display-name": "off",
    },
  },
]);

export default eslintConfig;
