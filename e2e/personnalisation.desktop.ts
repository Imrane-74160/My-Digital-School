/**
 * Tableau de bord : urgence calculée et disposition personnalisable (B2).
 *
 * Ce que ces parcours vérifient : l'ordre des actions se calcule, chaque compte range
 * ses cartes comme il veut, et son rangement lui survit — sans toucher à celui des autres.
 */
import type { Page } from '@playwright/test'
import { enBureau, expect, seConnecterAdmin, test } from './aides'

const grille = '[data-testid="grille-tableau-de-bord"]'

/** Les noms des cartes affichées, colonne par colonne, dans l'ordre de l'écran. */
const cartes = (page: Page) =>
  page.locator(`${grille} > div > * h2, ${grille} > div > * [class*="titre-carte"]`)

test('l’ordre de « À faire maintenant » est calculé, et la ligne de tête est signée', async ({ page }) => {
  await enBureau(page)
  await seConnecterAdmin(page, 'lydia')
  await page.goto('/admin')

  const carte = page.locator('section, div').filter({ hasText: 'À faire maintenant' }).last()
  await expect(carte).toContainText('par urgence')
  // La ligne de tête porte son motif : « À traiter en premier · … ».
  await expect(page.getByText('À traiter en premier')).toHaveCount(1)
  // Sur le jeu de démo, c'est l'argent qui bascule en perte qui passe devant.
  await expect(page.getByText(/À traiter en premier .*basculent en perte/)).toBeVisible()
})

/** Les clés des lignes de « À faire maintenant », dans l'ordre affiché. */
const ordreDesLignes = (page: Page) =>
  page.locator('[data-ligne]').evaluateAll((noeuds) => noeuds.map((n) => n.getAttribute('data-ligne')))

test('un paiement verrouillé par R12 descend chez Lydia, remonte chez Sandrine', async ({ page }) => {
  await enBureau(page)
  await seConnecterAdmin(page, 'lydia')
  await page.goto('/admin')
  const chezLydia = await ordreDesLignes(page)
  expect(chezLydia[chezLydia.length - 1]).toBe('paiements')
  await expect(page.getByText('Réservé à Sandrine')).toBeVisible()

  await seConnecterAdmin(page, 'sandrine')
  await page.goto('/admin')
  const chezSandrine = await ordreDesLignes(page)
  // Même urgence, mais Sandrine peut agir : la ligne reprend sa place au classement.
  expect(chezSandrine.indexOf('paiements')).toBeLessThan(chezSandrine.indexOf('signalements'))
  await expect(page.getByText('Réservé à Sandrine')).toHaveCount(0)
})

test('le défaut dépend du rôle : l’équipe ouvre sur les gestes, la direction sur l’état', async ({
  page,
}) => {
  await enBureau(page)
  await seConnecterAdmin(page, 'cyrianne')
  await page.goto('/admin')
  await expect(cartes(page).first()).toHaveText('À faire maintenant')
  await expect(page.getByText('Disposition par défaut · équipe pédagogique')).toBeVisible()

  await seConnecterAdmin(page, 'sandrine')
  await page.goto('/admin')
  await expect(cartes(page).first()).toHaveText('En ce moment')
  await expect(page.getByText('Disposition par défaut · direction')).toBeVisible()
})

test('chaque compte range ses cartes, et son rangement lui survit', async ({ page }) => {
  await enBureau(page)
  await seConnecterAdmin(page, 'lydia')
  await page.goto('/admin')
  await expect(cartes(page).first()).toHaveText('À faire maintenant')

  await page.getByRole('button', { name: 'Personnaliser' }).click()
  await page.getByRole('button', { name: 'Descendre À faire maintenant' }).click()
  await page.getByRole('button', { name: 'Terminer' }).click()

  await expect(cartes(page).first()).toHaveText('En ce moment')

  // Un rechargement ne perd rien : la disposition vit dans le stockage local.
  await page.reload()
  await expect(cartes(page).first()).toHaveText('En ce moment')
  await expect(page.getByText('Disposition personnalisée')).toBeVisible()

  // Et le rangement de Lydia ne déborde pas sur celui de Cyrianne.
  await seConnecterAdmin(page, 'cyrianne')
  await page.goto('/admin')
  await expect(cartes(page).first()).toHaveText('À faire maintenant')
})

test('masquer une carte la retire de l’écran, la réafficher la remet à sa place', async ({ page }) => {
  await enBureau(page)
  await seConnecterAdmin(page, 'lydia')
  await page.goto('/admin')
  await expect(page.getByText('Récap de 8h')).toBeVisible()

  await page.getByRole('button', { name: 'Personnaliser' }).click()
  await page.getByRole('button', { name: 'Masquer Récap de 8h' }).click()
  await expect(page.getByRole('button', { name: 'Récap de 8h' })).toBeVisible()
  await page.getByRole('button', { name: 'Terminer' }).click()

  await expect(page.getByTestId('recap-8h')).toHaveCount(0)
  await expect(page.getByText('1 carte masquée · Récap de 8h')).toBeVisible()

  await page.getByRole('button', { name: 'Personnaliser' }).click()
  await page.getByRole('button', { name: 'Récap de 8h' }).click()
  await page.getByRole('button', { name: 'Terminer' }).click()
  await expect(page.getByTestId('recap-8h')).toBeVisible()
})

test('« Rétablir le défaut » n’apparaît qu’une fois quelque chose déplacé', async ({ page }) => {
  await enBureau(page)
  await seConnecterAdmin(page, 'lydia')
  await page.goto('/admin')
  await page.getByRole('button', { name: 'Personnaliser' }).click()
  await expect(page.getByRole('button', { name: 'Rétablir le défaut' })).toHaveCount(0)

  await page.getByRole('button', { name: 'Envoyer À faire maintenant dans la colonne latérale' }).click()
  const rétablir = page.getByRole('button', { name: 'Rétablir le défaut' })
  await expect(rétablir).toBeVisible()

  await rétablir.click()
  await expect(rétablir).toHaveCount(0)
  await page.getByRole('button', { name: 'Terminer' }).click()
  await expect(cartes(page).first()).toHaveText('À faire maintenant')
})

test('la personnalisation se pilote entièrement au clavier', async ({ page }) => {
  await enBureau(page)
  await seConnecterAdmin(page, 'lydia')
  await page.goto('/admin')
  await page.getByRole('button', { name: 'Personnaliser' }).click()

  const descendre = page.getByRole('button', { name: 'Descendre À faire maintenant' })
  await descendre.focus()
  await expect(descendre).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(cartes(page).first()).toHaveText('En ce moment')

  // Et la carte remonte avec le bouton voisin, sans jamais toucher la souris.
  const monter = page.getByRole('button', { name: 'Monter À faire maintenant' })
  await monter.focus()
  await page.keyboard.press('Enter')
  await expect(cartes(page).first()).toHaveText('À faire maintenant')
})
