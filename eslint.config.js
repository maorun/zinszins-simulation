import js from "@eslint/js";

export default [
  {
    ignores: ["build/**", "public/build/**", "node_modules/**"],
  },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      // Basic JavaScript rules only for now
      // TypeScript/TSX files require additional parser setup
    },
  },
];