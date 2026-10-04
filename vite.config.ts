import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

/**
 * Prototype 100 % statique : aucun backend.
 *
 * `VITE_BASE` sert au déploiement dans un sous-dossier (GitHub Pages sert le site
 * sous `/<dépôt>/`). En local, la base reste `/` : rien ne change pour `npm run dev`.
 */
const base = process.env['VITE_BASE'] ?? '/'

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    // `npm run dev -- --host` pour tester sur un téléphone du même Wi-Fi.
    port: 5173,
  },
  build: {
    outDir: 'dist',
    // Déploiement statique (Vercel / Netlify) : pas de découpage exotique.
    target: 'es2022',
  },
})
