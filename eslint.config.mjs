import next from "eslint-config-next";
import typescriptEslint from "@typescript-eslint/eslint-plugin";

const eslintConfig = [
  ...next,
  {
    plugins: {
      "@typescript-eslint": typescriptEslint,
    },
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "scratch/**",
      "scripts/**",
      "fix-ts.js",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          args: "after-used",
          ignoreRestSiblings: true,
        },
      ],
      "react-hooks/exhaustive-deps": "off",
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-require-imports": "off",
      "react-hooks/set-state-in-effect": "off",
      "@next/next/no-img-element": "off",
      "@next/next/no-html-link-for-pages": "off",
    },
  },
];

export default eslintConfig;
