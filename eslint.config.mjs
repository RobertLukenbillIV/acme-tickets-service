import typescriptEslint from '@typescript-eslint/eslint-plugin';
import prettier from 'eslint-plugin-prettier';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';

export default [{
  ignores: ['**/node_modules/**', '**/dist/**', '**/coverage/**'],
}, {
  files: ['**/*.ts'],

  plugins: {
    '@typescript-eslint': typescriptEslint,
    prettier,
  },

  languageOptions: {
    globals: {
      ...globals.node,
      ...globals.jest,
    },

    parser: tsParser,
    ecmaVersion: 2020,
    sourceType: 'module',
  },

  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'no-console': 'warn',
  },
}];
