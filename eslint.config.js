import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      'dist',
      'node_modules',
      'playwright-report',
      'test-results',
      'coverage',
      // Artefacts de référence fournis avec le pack : à lire, jamais à linter ni à modifier.
      'reference/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    // Le domaine est pur : il ne doit jamais importer React, le DOM ni le store.
    files: ['src/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                'react',
                'react-dom',
                'react-router',
                'zustand',
                '@/store/*',
                '@/app-mobile/*',
                '@/back-office/*',
                '@/design-system/*',
              ],
              message: 'src/domain/ doit rester pur : ni React, ni DOM, ni store.',
            },
          ],
        },
      ],
      'no-restricted-globals': [
        'error',
        { name: 'window', message: 'src/domain/ doit rester pur.' },
        { name: 'document', message: 'src/domain/ doit rester pur.' },
        { name: 'localStorage', message: 'src/domain/ doit rester pur.' },
      ],
    },
  },
  {
    files: ['*.config.ts', 'eslint.config.js', 'e2e/**/*.ts', 'src/**/*.test.ts'],
    languageOptions: { globals: globals.node },
  },
)
