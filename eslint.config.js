// @ts-check
/* eslint-disable @typescript-eslint/no-require-imports */
const { FlatCompat } = require("@eslint/eslintrc");
/* eslint-enable @typescript-eslint/no-require-imports */

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "public/**",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  {
    // Scope the project's custom rule tweaks to actual source files only —
    // this keeps config files like this one from being linted under
    // TypeScript-aware rules meant for app code.
    files: ["**/*.{ts,tsx}"],
    rules: {
      // Enforce absolute imports via the "@/" alias instead of deep
      // relative paths once the project grows past a couple of folders.
      "no-restricted-imports": [
        "warn",
        {
          patterns: ["../../*"],
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "react/no-unescaped-entities": "off",
    },
  },
];

module.exports = eslintConfig;
