import { expect, test as base, type Page } from '@playwright/test'

/**
 * Aides partagées par les tests de bout en bout.
 *
 * L'application n'a plus de panneau de démo : on s'y connecte comme un utilisateur, et
 * le temps s'avance par la poignée de service exposée à la console (`window.__mds`),
 * qui remplace les boutons d'horloge d'avant.
 */

/**
 * L'application lit l'heure de la machine : les règles de 16h30, 18h et du lendemain
 * se déclenchent seules. Un test lancé le soir ne verrait donc pas la même situation
 * qu'un test lancé le matin. On fige l'horloge du navigateur sur 10:15, l'heure
 * d'ancrage du jeu de données, pour que chaque parcours parte du même état.
 */
export const test = base.extend({
  page: async ({ page }, utiliser) => {
    const ancrage = new Date()
    ancrage.setHours(10, 15, 0, 0)
    await page.clock.setFixedTime(ancrage)
    await utiliser(page)
  },
})

export { expect } from '@playwright/test'

export const MOBILE = { width: 390, height: 844 }
export const BUREAU = { width: 1440, height: 839 }

export const enMobile = (page: Page) => page.setViewportSize(MOBILE)
export const enBureau = (page: Page) => page.setViewportSize(BUREAU)

/** Les identifiants du jeu de données, tels qu'on les saisit à la connexion. */
export const IDENTIFIANTS = {
  ines: 'ines.martin',
  tom: 'tom.leroy',
  lea: 'lea.dubois',
  yanis: 'yanis.benali',
  sarah: 'sarah.nguyen',
  noah: 'noah.petit',
  diallo: 'a.diallo',
  roche: 'c.roche',
  lydia: 'lydia',
  cyrianne: 'cyrianne',
  sandrine: 'sandrine',
} as const

export type Compte = keyof typeof IDENTIFIANTS

/** Ouvre une session sur l'app mobile. La charte, si elle n'est pas acceptée, s'intercale. */
export async function seConnecter(page: Page, compte: Compte) {
  await page.goto('/app/connexion')
  await page.getByLabel('Identifiant MDS').fill(IDENTIFIANTS[compte])
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await expect(page.getByLabel('Identifiant MDS')).toHaveCount(0)
}

/** Ouvre une session sur le back-office. */
export async function seConnecterAdmin(page: Page, compte: Compte) {
  await page.goto('/admin/connexion')
  await page.getByLabel('Identifiant MDS').fill(IDENTIFIANTS[compte])
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await expect(page.getByTestId('menu-principal')).toBeVisible()
}

/** Change de compte sur une surface déjà connectée. */
export async function changerDeCompte(page: Page, compte: Compte) {
  await page.evaluate(() => window.__mds.getState().deconnecter('app'))
  await seConnecter(page, compte)
}

/** Les trois échéances que l'application applique seule quand l'heure tourne. */
type Echeance = 'ALLER_A_16H30' | 'FIN_DE_JOURNEE' | 'LENDEMAIN'

/**
 * Avance le temps comme le ferait une échéance réelle. L'application s'en charge seule
 * quand l'heure tourne ; un test, lui, ne peut pas attendre 18h.
 */
export async function echeance(page: Page, type: Echeance) {
  await page.evaluate((action) => {
    window.__mds.getState().executer({ type: action })
  }, type)
}

export const bandeau = (page: Page) => page.getByTestId('toast')

export async function attendreAccepte(page: Page) {
  await expect(bandeau(page)).toHaveAttribute('data-resultat', 'accepte')
}

export async function attendreRefus(page: Page, regle: string) {
  await expect(bandeau(page)).toHaveAttribute('data-resultat', 'refuse')
  await expect(bandeau(page)).toHaveAttribute('data-regle', regle)
}
