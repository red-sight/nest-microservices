import eslint from "@eslint/js";
import pluginJest from "eslint-plugin-jest";
import perfectionist from "eslint-plugin-perfectionist";
import prettier from "eslint-plugin-prettier";
import tseslint from "typescript-eslint";

export const generateTsConfig = (options = {}) => {
  const { tsconfigRootDir = process.cwd() } = options;

  return tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,

    {
      languageOptions: {
        parserOptions: {
          project: ["./tsconfig.eslint.json"],
          tsconfigRootDir,
        },
      },
    },

    {
      plugins: {
        prettier,
      },
      rules: {
        "prettier/prettier": "warn",
        //   indent: [
        //     "warn",
        //     2,
        //     {
        //       FunctionDeclaration: { body: 1, parameters: 2 },
        //       FunctionExpression: { body: 1, parameters: 2 },
        //       ObjectExpression: 1,
        //     },
        //   ],
        //   "no-multiple-empty-lines": ["warn", { max: 1, maxBOF: 0, maxEOF: 1 }],
      },
    },

    {
      plugins: { perfectionist },
      rules: {
        "perfectionist/sort-array-includes": ["warn"],
        "perfectionist/sort-exports": ["warn"],
        "perfectionist/sort-heritage-clauses": ["warn"],
        "perfectionist/sort-imports": ["warn"],
        "perfectionist/sort-interfaces": ["warn"],
        "perfectionist/sort-intersection-types": ["warn"],
        "perfectionist/sort-maps": ["warn"],
        "perfectionist/sort-modules": ["warn"],
        "perfectionist/sort-named-exports": ["warn"],
        "perfectionist/sort-named-imports": ["warn"],
        "perfectionist/sort-object-types": ["warn"],
        "perfectionist/sort-objects": ["warn"],
        "perfectionist/sort-sets": ["warn"],
        "perfectionist/sort-variable-declarations": ["warn"],
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
      ignores: ["dist"],
    },

    {
      files: ["**/*.js", "**/*.mjs"],
      ...tseslint.configs.disableTypeChecked,
    },
  );
};
