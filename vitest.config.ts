import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// `src/domain/` est pur : environnement Node par défaut, plus rapide et sans DOM.
// Les tests de composants ajouteront `// @vitest-environment jsdom` en tête de fichier.
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    globals: false,
    restoreMocks: true,
  },
})
