import eslint from "@eslint/js";
import perfectionist from "eslint-plugin-perfectionist";
import prettier from "eslint-plugin-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

export const generateTsConfig = (options = {}) => {
  const { tsconfigRootDir = process.cwd() } = options;

  return tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,

    {
      languageOptions: {
        globals: {
          ...globals.node,
          ...globals.jest,
        },
        parserOptions: {
          project: ["./tsconfig.eslint.json"],
          tsconfigRootDir,
        },
      },
    },

    {
      rules: {
        "@typescript-eslint/no-extraneous-class": "off",
      },
    },

    {
      plugins: {
        prettier,
      },
      rules: {
        "prettier/prettier": "warn",
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

    {
      ignores: ["dist"],
    },

    {
      files: ["**/*.js", "**/*.mjs"],
      ...tseslint.configs.disableTypeChecked,
    },
  );
};
