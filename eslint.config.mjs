import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Variable and import rules
      "no-var": "off",                           // Allow var declarations
      "no-unused-vars": "off",                   // Allow unused variables
      "@typescript-eslint/no-unused-vars": "off", // Allow unused vars in TS
      "prefer-const": "off",                     // Don't enforce const over let
      "no-undef": "off",                         // Allow undefined variables

      // Console and debugging
      "no-console": "off",                       // Allow console.log, etc.
      "no-debugger": "off",                      // Allow debugger statements

      // TypeScript specific
      "@typescript-eslint/no-explicit-any": "off",     // Allow any type
      "@typescript-eslint/no-non-null-assertion": "off", // Allow ! operator
      "@typescript-eslint/ban-ts-comment": "off",       // Allow @ts-ignore, etc.
      "@typescript-eslint/prefer-as-const": "off",      // Don't enforce as const
      "@typescript-eslint/no-empty-function": "off",    // Allow empty functions
      "@typescript-eslint/no-inferrable-types": "off",  // Allow explicit types
      "@typescript-eslint/no-unused-expressions": "off", // Allow unused expressions
      "@typescript-eslint/no-empty-object-type": "off",  // Allow empty interfaces

      // React/Next.js specific
      "react/no-unescaped-entities": "off",     // Allow unescaped quotes, etc.
      "react/react-in-jsx-scope": "off",        // Don't require React import
      "react/prop-types": "off",                // Don't require prop-types
      "react/display-name": "off",              // Don't require display names
      "react-hooks/exhaustive-deps": "off",     // Don't enforce useEffect deps

      // General code style
      "no-empty": "off",                         // Allow empty blocks
      "no-constant-condition": "off",            // Allow while(true), etc.
      "no-unreachable": "off",                   // Allow unreachable code
      "no-fallthrough": "off",                   // Allow switch fallthrough
      "no-case-declarations": "off",             // Allow declarations in cases

      // Import/export
      "import/no-anonymous-default-export": "off", // Allow anonymous exports
      "import/no-unresolved": "off",               // Don't check import paths

      // Next.js specific
      "@next/next/no-img-element": "off",        // Allow <img> instead of Image
      "@next/next/no-html-link-for-pages": "off", // Allow <a> instead of Link
    },
  }
];

export default eslintConfig;
