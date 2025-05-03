import pluginJs from "@eslint/js";
import pluginChaiFriendly from "eslint-plugin-chai-friendly";
import pluginJest from "eslint-plugin-jest";
import mochaPlugin from "eslint-plugin-mocha";
import perfectionist from "eslint-plugin-perfectionist";
import prettier from "eslint-plugin-prettier";
import globals from "globals";

/** @type {import('eslint').Linter.Config[]} */
export const jsConfig = [
  { languageOptions: { globals: globals.node } },

  pluginJs.configs.recommended,
  mochaPlugin.configs.flat.recommended,

  {
    ignores: ["dist/**/*"],
  },

  {
    plugins: { prettier },
    rules: {
      "prettier/prettier": "warn",
      //   "no-multiple-empty-lines": ["warn", { max: 1, maxBOF: 0, maxEOF: 1 }],
    },
  },

  {
    plugins: { perfectionist },
    rules: {
      "perfectionist/sort-array-includes": ["warn"],
      "perfectionist/sort-exports": ["warn"],
      "perfectionist/sort-imports": ["warn"],
      "perfectionist/sort-named-exports": ["warn"],
      "perfectionist/sort-named-imports": ["warn"],
      "perfectionist/sort-objects": ["warn"],
    },
  },

  // Jest test files
  {
    files: ["**/*.spec.js", "**/*.test.js"],
    languageOptions: {
      globals: pluginJest.environments.globals.globals,
    },
    plugins: { jest: pluginJest },
    rules: {
      "jest/no-disabled-tests": "warn",
      "jest/no-focused-tests": "error",
      "jest/no-identical-title": "error",
      "jest/prefer-to-have-length": "warn",
      "jest/valid-expect": "error",
    },
  },

  {
    files: ["test/**/*.js"],
    languageOptions: { globals: globals.mocha },
    plugins: { "chai-friendly": pluginChaiFriendly, mocha: mochaPlugin },
    rules: {
      "mocha/no-async-describe": "off",
      "mocha/no-mocha-arrows": "off",
    },
  },
];
