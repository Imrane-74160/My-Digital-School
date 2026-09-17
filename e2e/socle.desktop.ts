import { expect, test } from '@playwright/test'

// Projet « desktop » : viewport 1440 × 839, la taille exacte de la maquette Figma du back-office.

test('sur ordinateur, l’app s’affiche dans un cadre de téléphone 390 × 844', async ({ page }) => {
  await page.goto('/app')
  const cadre = page.getByTestId('cadre-telephone')
  const boite = await cadre.boundingBox()
  expect(boite?.width).toBe(390)
  expect(boite?.height).toBe(844)

  // Rayon repris du token --mds-rayon-carte (36px), pas une valeur en dur.
  const rayon = await cadre.evaluate((noeud) => getComputedStyle(noeud).borderRadius)
  expect(rayon).toBe('36px')
})

test('la coque du back-office répond sur les onze écrans B2 → B12', async ({ page }) => {
  const chemins = [
    '/admin',
    '/admin/validations',
    '/admin/controle-photo',
    '/admin/materiel',
    '/admin/prets',
    '/admin/emprunteurs',
    '/admin/incidents',
    '/admin/consommables',
    '/admin/salles',
    '/admin/imports',
    '/admin/reglages',
  ]
  for (const chemin of chemins) {
    await page.goto(chemin)
    await expect(page.getByTestId('menu-principal'), chemin).toBeVisible()
    await expect(page.getByTestId('en-tete-back-office'), chemin).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 }), chemin).toBeVisible()
  }
})

test('B1 · Se connecter vit hors de la coque : ni menu, ni en-tête de page', async ({ page }) => {
  await page.goto('/admin/connexion')
  // Titre du Figma (`14:950`), la carte étant seule sur le fond dégradé.
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bon retour parmi nous')
  await expect(page.getByTestId('menu-principal')).toHaveCount(0)
  await expect(page.getByTestId('en-tete-back-office')).toHaveCount(0)
})

test('aucun défilement horizontal à 1440 px', async ({ page }) => {
  await page.goto('/admin')
  const debordement = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  )
  expect(debordement).toBe(false)
})

test('Côte à côte · les deux surfaces partagent le même état', async ({ page }) => {
  await page.goto('/cote-a-cote')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Côte à côte')

  const app = page.frameLocator('iframe[title="App mobile"]')
  const bo = page.frameLocator('iframe[title="Back-office"]')
  await expect(app.getByRole('heading', { level: 1 })).toContainText('Bonjour')
  await expect(bo.getByRole('heading', { level: 1 })).toHaveText('Tableau de bord')

  // Le panneau de démo reste celui de la page parente : il n'apparaît pas dans les cadres.
  await expect(page.getByTestId('bouton-demo')).toBeVisible()
  await expect(app.getByTestId('bouton-demo')).toHaveCount(0)
  await expect(bo.getByTestId('bouton-demo')).toHaveCount(0)
})

test('Accueil de la démo · le QR mène à /app', async ({ page }) => {
  await page.goto('/')
  const qr = page.getByRole('img', { name: /QR code/ })
  await expect(qr).toBeVisible()
  await expect(qr).toHaveAttribute('aria-label', /\/app$/)
})
