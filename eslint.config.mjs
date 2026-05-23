import nextVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-plugin-prettier";
import unusedImports from "eslint-plugin-unused-imports";

const nextConfig = nextVitals.map((config) => {
  if (!config.plugins?.["@typescript-eslint"]) {
    return config;
  }

  return {
    ...config,
    rules: {
      ...config.rules,
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  };
});

const eslintConfig = [
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "public/mockServiceWorker.js", "next-env.d.ts"],
  },
  ...nextConfig,
  {
    plugins: {
      "unused-imports": unusedImports,
      prettier,
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/jsx-sort-props": [
        "warn",
        {
          callbacksLast: true,
          shorthandFirst: true,
          noSortAlphabetically: false,
          reservedFirst: true,
        },
      ],
      "jsx-a11y/alt-text": "warn",
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/no-static-element-interactions": "warn",
      "unused-imports/no-unused-imports": "warn",
      "prettier/prettier": ["warn", { usePrettierrc: false }],
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
        },
      },
      react: {
        version: "19.2.0",
      },
    },
  },
];

export default eslintConfig;
