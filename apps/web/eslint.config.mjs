import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Faz o import/no-unresolved entender TS paths (@/*)
  {
    settings: {
      "import/resolver": {
        typescript: {
          project: ["./tsconfig.json"],
        },
        node: true,
      },
    },
  },

  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
