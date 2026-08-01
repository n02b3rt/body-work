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
    // eslint-plugin-react 7.37 (pulled in by eslint-config-next) crashes on ESLint
    // 10 while linting this file, which took the whole run down with it. There is
    // nothing here worth linting: it is the config itself.
    "eslint.config.mjs",
  ]),
]);

export default eslintConfig;
