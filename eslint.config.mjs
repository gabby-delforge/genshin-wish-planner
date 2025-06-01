import { FlatCompat } from "@eslint/eslintrc";
import pluginMobx from "eslint-plugin-mobx";
import unusedImports from "eslint-plugin-unused-imports";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: ["scripts/**/*"],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    plugins: {
      "unused-imports": unusedImports,
      mobx: pluginMobx,
    },
    rules: {
      "mobx/exhaustive-make-observable": "warn",
      "mobx/unconditional-make-observable": "error",
      "mobx/missing-make-observable": "error",
      "mobx/missing-observer": "warn",
      "@typescript-eslint/no-unused-vars": "off",
      "no-unused-vars": "off",
      "unused-imports/no-unused-imports": "warn",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      "react-hooks/exhaustive-deps": "off",
    },
  },
];

export default eslintConfig;
