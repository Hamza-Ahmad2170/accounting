//  @ts-check

import tsParser from "@typescript-eslint/parser";
import drizzle from "./eslint-rules/drizzle-where.js";

/**
 * `drizzle` is a local rule set in `eslint-rules/drizzle-where.js`, not the
 * `eslint-plugin-drizzle` package. It keeps the same rule names, but decides
 * "is this call followed by `.where()`?" by reading parent pointers instead of
 * a module-level variable shared across every linted file — see
 * drizzle-team/drizzle-orm#5612.
 *
 * Both rules are syntactic and never request type information, so
 * `parserOptions.project` is deliberately omitted to keep linting fast.
 *
 * @type {import('eslint').Linter.Config[]}
 */
export default [
  {
    ignores: ["dist/**"],
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
    },
    plugins: { drizzle },
    rules: {
      "drizzle/enforce-delete-with-where": [
        "error",
        { drizzleObjectName: ["db"] },
      ],
      "drizzle/enforce-update-with-where": [
        "error",
        { drizzleObjectName: ["db"] },
      ],
    },
  },
];
