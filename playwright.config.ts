import { existsSync } from 'node:fs'
import { defineConfig, devices } from '@playwright/test'

// Certains environnements fournissent déjà un Chromium (dont celui de Claude Code sur le web,
// via PLAYWRIGHT_BROWSERS_PATH). Quand c'est le cas on l'utilise tel quel, même si sa version
// ne correspond pas exactement à celle attendue par @playwright/test : cela évite un
// `playwright install` inutile. Sinon, Playwright retombe sur son navigateur habituel.
const CHROMIUM_FOURNI = '/opt/pw-browsers/chromium'
const lancement = existsSync(CHROMIUM_FOURNI) ? { executablePath: CHROMIUM_FOURNI } : {}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      // Taille exacte de la maquette Figma « App mobile ».
      name: 'mobile',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        launchOptions: lancement,
      },
      testMatch: /.*\.mobile\.ts/,
    },
    {
      // Taille exacte de la maquette Figma « Back-office ».
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 839 },
        launchOptions: lancement,
      },
      testMatch: /.*\.desktop\.ts/,
    },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
