import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// Prototype 100 % statique : aucun backend, aucune variable d'environnement.
export default defineConfig({
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
