/**
 * UX mobile : parcours d'emprunt raccourci, accueil lisible, retours bien placés.
 *
 * Ces parcours mesurent ce qui a changé côté confort — le nombre de gestes pour
 * emprunter, le groupement de « Mes prêts », et la place du bandeau par rapport à la
 * barre de navigation flottante.
 */
import type { Page } from '@playwright/test'
import { attendreAccepte, bandeau, expect, seConnecter, test } from './aides'

const feuille = (page: Page) => page.getByTestId('feuille-emprunter')

test('depuis le catalogue, emprunter tient en trois gestes', async ({ page }) => {
  await seConnecter(page, 'ines')
  await page.goto('/app/materiel')

  // 1 · le bouton d'emprunt direct de la ligne ouvre la feuille du forfait…
  const emprunter = page.getByRole('link', { name: /^Emprunter / }).first()
  await expect(emprunter).toBeVisible()
  const boite = await emprunter.boundingBox()
  // Cible tactile : au moins 44 px de côté (WCAG 2.1 AA).
  expect(boite?.width).toBeGreaterThanOrEqual(44)
  expect(boite?.height).toBeGreaterThanOrEqual(44)
  await emprunter.click()

  // … sans passer par la fiche : la feuille est déjà là.
  await expect(feuille(page)).toBeVisible()
  // 2 · la case du forfait reste obligatoire (R03).
  const valider = feuille(page).getByRole('button', { name: /Emprunter|Demander la remise/ })
  await expect(valider).toBeDisabled()
  await feuille(page).getByRole('checkbox').check({ force: true })
  // 3 · et c'est emprunté.
  await valider.click()
  await attendreAccepte(page)
  await expect(page).toHaveURL(/\/app$/)
})

test('la fiche reste accessible depuis le texte de la ligne', async ({ page }) => {
  await seConnecter(page, 'ines')
  await page.goto('/app/materiel')
  await page
    .getByRole('link', { name: /^Fiche de / })
    .first()
    .click()
  await expect(feuille(page)).toHaveCount(0)
  await expect(page.getByRole('button', { name: /Emprunter|Demander la remise/ })).toBeVisible()
})

test('un QR scanné ouvre directement la feuille du forfait', async ({ page }) => {
  await seConnecter(page, 'sarah')
  await page.goto('/app/scanner')

  const detecte = page.getByRole('link').filter({ hasText: 'Disponible' }).first()
  await expect(detecte).toBeVisible()
  await detecte.click()
  await expect(feuille(page)).toBeVisible()
  await expect(feuille(page)).toContainText('Forfait en cas de perte')
})

test('arriver sur la fiche sans « ?emprunter » n’ouvre rien', async ({ page }) => {
  await seConnecter(page, 'sarah')
  await page.goto('/app/materiel/souris-apple-01')
  await expect(feuille(page)).toHaveCount(0)
})

test('« ?emprunter » reste sans effet sur un matériel qui n’est pas libre', async ({ page }) => {
  await seConnecter(page, 'sarah')
  // Le kit est chez Inès : la feuille ne doit pas s'ouvrir, même avec le paramètre.
  await page.goto('/app/materiel/kit-canon-r10-01?emprunter')
  await expect(feuille(page)).toHaveCount(0)
})

test('« Mes prêts » se lit par groupes, le retard en tête', async ({ page }) => {
  await seConnecter(page, 'ines')
  await page.goto('/app')

  await expect(page.getByRole('heading', { name: 'Mes prêts' })).toBeVisible()
  // Un sous-titre par groupe : ce qui part ce soir, ce qui attend l'équipe.
  await expect(page.getByRole('heading', { name: 'À rendre avant 18h' })).toBeVisible()

  // Tom a une remise en attente : son accueil montre l'autre groupe.
  await page.evaluate(() => window.__mds.getState().deconnecter('app'))
  await seConnecter(page, 'tom')
  await page.goto('/app')
  await expect(page.getByRole('heading', { name: 'En attente de l’équipe' })).toBeVisible()
})

test('le raccourci de l’accueil est contextuel, et ne double plus la navigation', async ({ page }) => {
  await seConnecter(page, 'ines')
  await page.goto('/app')
  // Inès a un prêt à rendre : le raccourci mène au retour, pas au catalogue.
  await expect(page.getByRole('link', { name: /Rendre maintenant/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /Voir le matériel/ })).toHaveCount(0)

  await page.evaluate(() => window.__mds.getState().deconnecter('app'))
  await seConnecter(page, 'noah')
  // Noah se connecte pour la première fois : la charte passe avant (R03).
  await page.getByRole('checkbox').check({ force: true })
  await page.getByRole('button', { name: /Continuer/ }).click()
  await expect(page.getByText('Aucun prêt en cours')).toBeVisible()
  // Il n'a rien à rendre : le raccourci propose d'emprunter.
  await expect(page.getByRole('link', { name: /Emprunter/ }).first()).toBeVisible()
})

test('le bandeau de résultat ne recouvre pas la barre de navigation', async ({ page }) => {
  await seConnecter(page, 'ines')
  await page.goto('/app/materiel')

  // Une inscription « Me prévenir » suffit à faire apparaître le bandeau.
  const prevenir = page.getByRole('button', { name: /^Me prévenir pour / }).first()
  await prevenir.click()
  await expect(bandeau(page)).toBeVisible()

  // Le bandeau monte depuis le bas : on attend sa place définitive.
  await expect(async () => {
    const message = await bandeau(page).boundingBox()
    const navigation = await page.getByTestId('zone-navigation').boundingBox()
    expect(message).not.toBeNull()
    expect(navigation).not.toBeNull()
    expect(message!.y + message!.height).toBeLessThanOrEqual(navigation!.y + 1)
  }).toPass()
})
