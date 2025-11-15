// functions/.eslintrc.js
module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["./tsconfig.json", "./tsconfig.dev.json"],
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
  ignorePatterns: [
    "lib/**/*",        // Ignore built files.
    "generated/**/*",  // Ignore generated files.
    "node_modules/**/*",
  ],
  plugins: [
    "@typescript-eslint",
    "import",
  ],
  rules: {
    // keep a couple of basic rules
    quotes: ["error", "double"],
    indent: ["error", 2],
    "import/no-unresolved": 0,

    // turn off noisy Google/unix style rules so Windows + your style passes
    "linebreak-style": 0,
    "object-curly-spacing": 0,
    "require-jsdoc": 0,
    "new-cap": 0,
    "operator-linebreak": 0,
    "quote-props": 0,
    "no-multi-spaces": 0,
    "eol-last": 0,
  },
};