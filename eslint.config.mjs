// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config({
  ignores: [
    "dist/**",
    "node_modules/**",
    "coverage/**",
    "storybook-static/**",
    "playground/**",
    "website/**",
    "site-dist/**",
  ],
}, js.configs.recommended, ...tseslint.configs.recommended, {
  files: ["**/*.{ts,tsx}"],
  languageOptions: {
    ecmaVersion: 2020,
    globals: {
      ...globals.browser,
      ...globals.node,
    },
  },
  plugins: {
    "react-hooks": reactHooks,
  },
  rules: {
    ...reactHooks.configs.recommended.rules,
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
  },
}, storybook.configs["flat/recommended"]);
