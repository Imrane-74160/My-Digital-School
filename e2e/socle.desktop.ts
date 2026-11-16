import { expect, seConnecter, seConnecterAdmin, test } from './aides'

// Projet « desktop » : viewport 1440 × 839, la taille exacte de la maquette Figma du back-office.

test('sur ordinateur, l’app s’affiche dans un cadre de téléphone 390 × 844', async ({ page }) => {
  await seConnecter(page, 'ines')
  const cadre = page.getByTestId('cadre-telephone')
  const boite = await cadre.boundingBox()
  expect(boite?.width).toBe(390)
  expect(boite?.height).toBe(844)

  // Rayon repris du token --mds-rayon-carte (36px), pas une valeur en dur.
  const rayon = await cadre.evaluate((noeud) => getComputedStyle(noeud).borderRadius)
  expect(rayon).toBe('36px')
})

test('la coque du back-office répond sur les onze écrans B2 → B12', async ({ page }) => {
  await seConnecterAdmin(page, 'lydia')
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

test('le back-office sans session renvoie vers sa connexion (R13)', async ({ page }) => {
  await page.goto('/admin/prets')
  await expect(page).toHaveURL(/\/admin\/connexion$/)
  await expect(page.getByTestId('menu-principal')).toHaveCount(0)

  // Un compte d'élève n'y entre pas.
  await page.getByLabel('Identifiant MDS').fill('ines.martin')
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await expect(page.getByText(/réservé à l’équipe pédagogique/)).toBeVisible()
})

test('B1 · Se connecter vit hors de la coque : ni menu, ni en-tête de page', async ({ page }) => {
  await page.goto('/admin/connexion')
  // Titre du Figma (`14:950`), la carte étant seule sur le fond dégradé.
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bon retour parmi nous')
  await expect(page.getByTestId('menu-principal')).toHaveCount(0)
  await expect(page.getByTestId('en-tete-back-office')).toHaveCount(0)
})

test('aucun défilement horizontal à 1440 px', async ({ page }) => {
  await seConnecterAdmin(page, 'lydia')
  const debordement = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  )
  expect(debordement).toBe(false)
})

test('Côte à côte · les deux surfaces partagent le même état', async ({ page }) => {
  await seConnecter(page, 'ines')
  await seConnecterAdmin(page, 'lydia')
  await page.goto('/cote-a-cote')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Côte à côte')

  const app = page.frameLocator('iframe[title="App mobile"]')
  const bo = page.frameLocator('iframe[title="Back-office"]')
  await expect(app.getByRole('heading', { level: 1 })).toContainText('Bonjour')
  await expect(bo.getByRole('heading', { level: 1 })).toHaveText('Tableau de bord')
})
