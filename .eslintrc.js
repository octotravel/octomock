module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: { project: ["./tsconfig.json"] },
  settings: {
    "import/resolver": {
      node: {
        extensions: [".ts"],
      },
    },
  },
  plugins: ["@typescript-eslint", "unused-imports"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "airbnb-base",
    "airbnb-typescript/base",
    "prettier",
  ],
  rules: {
    camelcase: "error",
    "no-console": "off",
    "spaced-comment": "error",
    quotes: ["error", "double"],
    "import/no-extraneous-dependencies": "off",
    "no-param-reassign": "off",
    "no-plusplus": "off",
    "max-classes-per-file": "off",
    "no-duplicate-imports": "error",
    "import/extensions": "off",
    "import/prefer-default-export": "off",
    "class-methods-use-this": "off",
    "object-shorthand": "off",
    "prefer-destructuring": "off",
    "no-await-in-loop": "off",
    "no-empty-function": ["error", { allow: ["constructors"] }],
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/naming-convention": "off",
  },
  overrides: [
    {
      files: ["*.ts"],
      rules: {
        "@typescript-eslint/dot-notation": "error",
        "no-shadow": "off",
      },
    },
  ],
  env: {
    jest: true,
  },
};
