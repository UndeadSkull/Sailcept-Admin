const js = require('@eslint/js');
const globals = require('globals');
const reactHooks = require('eslint-plugin-react-hooks');
const tseslint = require('typescript-eslint');
const { defineConfig, globalIgnores } = require('eslint/config');

module.exports = defineConfig([
  globalIgnores(['dist', '.expo']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
  },
]);
