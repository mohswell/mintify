/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: [
    "@repo/eslint-config/next.js",
    // "next/core-web-vitals", // DO not comment out-- conflicts with the monorepo existing eslint in packages 
    "next/typescript"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off"
  },
};
