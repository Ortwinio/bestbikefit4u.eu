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
    ".tmp/**",
    "next-env.d.ts",
    "convex/_generated/**",
  ]),
  {
    rules: {
      // Allow intentionally-unused parameters and variables prefixed with _
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          vars: "all",
          args: "all",
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
]);

export default eslintConfig;
