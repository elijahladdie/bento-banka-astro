module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/recommended",
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
  plugins: ["import"],
  ignorePatterns: ["dist/**", "node_modules/**", ".astro/**"],
  overrides: [
    {
      files: ["**/*.astro"],
      parser: "astro-eslint-parser",
      env: {
        browser: true,
        node: true,
        "astro/astro": true,
        es2022: true,
      },
      parserOptions: {
        parser: "@typescript-eslint/parser",
        extraFileExtensions: [".astro"],
        sourceType: "module",
      },
      plugins: ["astro"],
      extends: ["plugin:astro/recommended"],
    },
    {
      files: ["**/*.ts"],
      parser: "@typescript-eslint/parser",
      plugins: ["@typescript-eslint"],
      extends: ["plugin:@typescript-eslint/recommended"],
      rules: {
        "@typescript-eslint/no-unused-vars": ["error", { "args": "none", "ignoreRestSiblings": true }],
      },
    },
  ],
  rules: {
    "no-console": ["error", { allow: ["warn", "error"] }],
    "no-unused-vars": ["error", { "args": "none", "ignoreRestSiblings": true }],
    "import/no-unresolved": "off",
  },
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts"],
    },
  },
};
