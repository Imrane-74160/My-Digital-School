import { expect, test, type Page } from '@playwright/test'

/**
 * Les neuf parcours d'acceptation de `docs/06-parcours-de-test.md`, joués de bout en
 * bout sur le prototype construit. Chaque test part d'un contexte neuf : le seed est
 * donc rechargé, comme après « Réinitialiser la démo ».
 *
 * Un parcours traverse les deux surfaces : on bascule le viewport avec `enMobile` /
 * `enBureau` plutôt que de couper le parcours en deux fichiers.
 */

const MOBILE = { width: 390, height: 844 }
const BUREAU = { width: 1440, height: 839 }

const enMobile = (page: Page) => page.setViewportSize(MOBILE)
const enBureau = (page: Page) => page.setViewportSize(BUREAU)

/** Change la persona de l'app (ou l'utilisateur du back-office) depuis le panneau de démo. */
async function choisir(page: Page, nom: string) {
  await page.getByTestId('bouton-demo').click()
  await page.getByRole('button', { name: nom, exact: true }).click()
  await page.getByRole('button', { name: 'Fermer le panneau de démo' }).click()
}

/** Joue un bouton de l'horloge simulée. */
async function horloge(page: Page, libelle: string | RegExp) {
  await page.getByTestId('bouton-demo').click()
  await page.getByRole('button', { name: libelle }).click()
  await page.getByRole('button', { name: 'Fermer le panneau de démo' }).click()
}

const toast = (page: Page) => page.getByTestId('toast')

async function attendreAccepte(page: Page) {
  await expect(toast(page)).toHaveAttribute('data-resultat', 'accepte')
}

async function attendreRefus(page: Page, regle: string) {
  await expect(toast(page)).toHaveAttribute('data-resultat', 'refuse')
  await expect(toast(page)).toContainText(regle)
}

// ─── P1 · Emprunt et retour en libre-service (R02 R03 R05) ───────────────────

test('P1 · emprunt puis retour en libre-service, contrôlé au back-office', async ({ page }) => {
  await enMobile(page)
  await page.goto('/app/materiel')

  await page
    .getByRole('link', { name: /Souris Apple/ })
    .first()
    .click()
  await page.getByRole('button', { name: /^Emprunter/ }).click()
  const feuille = page.getByTestId('feuille-emprunter')
  await expect(feuille).toBeVisible()

  // R03 : le bouton reste inerte tant que la case du forfait n'est pas cochée.
  const valider = feuille.getByRole('button', { name: 'Emprunter' })
  await expect(valider).toBeDisabled()
  await feuille.getByRole('checkbox').check({ force: true })
  await expect(valider).toBeEnabled()
  await valider.click()

  await attendreAccepte(page)
  await expect(page).toHaveURL(/\/app$/)
  const cartePret = page.locator('section, article').filter({ hasText: 'Souris Apple #01' }).last()
  await expect(cartePret).toContainText('En cours · depuis')

  // Retour : cases cochées d'office, photo obligatoire (R05).
  await page.getByRole('link', { name: 'Rendre' }).first().click()
  const rendre = page.getByRole('button', { name: 'Valider le retour' })
  await expect(rendre).toBeDisabled()
  await page.getByTestId('prendre-la-photo').click()
  await expect(rendre).toBeEnabled()
  await rendre.click()
  await attendreAccepte(page)
  await expect(page.locator('section').filter({ hasText: 'Mes prêts' })).not.toContainText('Souris Apple #01')

  // Back-office : la photo attend son contrôle, puis part dans « Contrôlées récemment ».
  await enBureau(page)
  await page.goto('/admin/controle-photo')
  const carte = page.locator('article').filter({ hasText: 'Souris Apple #01' }).first()
  await expect(carte).toBeVisible()
  await carte.getByRole('button', { name: 'Photo conforme' }).click()
  await attendreAccepte(page)
  await expect(page.getByRole('table', { name: 'Photos contrôlées' })).toContainText('Souris Apple #01')
})

// ─── P2 · Kit N1 incomplet (R04 R07) ────────────────────────────────────────

test('P2 · un composant manquant vaut son forfait, pas celui du kit', async ({ page }) => {
  await enBureau(page)
  await page.goto('/admin/validations')

  const remise = page.locator('article').filter({ hasText: 'Kit Canon R10 #01' }).first()
  await remise.getByRole('button', { name: 'Valider la remise' }).click()
  await attendreAccepte(page)

  // App Inès : le kit est chez elle, elle le rend en décochant une batterie.
  await enMobile(page)
  await page.goto('/app')
  await expect(page.getByText('Kit Canon R10 #01')).toBeVisible()
  await page.getByRole('link', { name: 'Rendre' }).first().click()
  await page.getByRole('checkbox', { name: 'Batterie LP-E17 (2/2)' }).uncheck({ force: true })
  await page.getByTestId('prendre-la-photo').click()
  await page.getByRole('button', { name: 'Valider le retour' }).click()
  await attendreAccepte(page)
  await expect(page.getByText('Retour en vérification')).toBeVisible()

  // Back-office : la puce passe en « Manquant » et l'incident vaut 45 €, jamais 1 130 €.
  await enBureau(page)
  await page.goto('/admin/validations')
  const retour = page.locator('article').filter({ hasText: 'Kit Canon R10 #01' }).first()
  await retour.getByRole('button', { name: 'Batterie LP-E17 (2/2)' }).click()
  await expect(retour.getByRole('button', { name: /Créer l’incident · 45 €/ })).toBeEnabled()
  await retour.getByRole('button', { name: /Créer l’incident · 45 €/ }).click()
  await attendreAccepte(page)
  await expect(toast(page)).toContainText('45 €')
  await expect(toast(page)).toContainText('R07')

  await page.goto('/admin/incidents')
  const incident = page.locator('article').filter({ hasText: 'Kit Canon R10 #01' }).first()
  await expect(incident).toContainText('45 €')
  await expect(incident).not.toContainText('1 130 €')
})

// ─── P3 · Réemprunt avant contrôle (R06) ────────────────────────────────────

test('P3 · l’incident va au dernier responsable, pas au nouvel emprunteur', async ({ page }) => {
  await enBureau(page)
  await page.goto('/admin/controle-photo')

  const carte = page.locator('article').filter({ hasText: 'Casque d’anglais #02' }).first()
  await expect(carte).toContainText('Réemprunté par Tom')
  await carte.getByRole('button', { name: 'Incomplet ou abîmé' }).click()
  await carte.getByRole('button', { name: /Créer l’incident/ }).click()

  await attendreAccepte(page)
  // R06 : c'est Léa qui doit, Tom garde son prêt.
  await expect(toast(page)).toContainText('Léa')
  await expect(toast(page)).toContainText('R06')

  await page.goto('/admin/prets')
  await expect(page.getByRole('table', { name: 'Prêts' })).toContainText('Tom Leroy')
})

// ─── P4 · Prêt pour la classe (R08 R09) ─────────────────────────────────────

test('P4 · « Pour ma classe » est réservé aux intervenants, qui restent responsables', async ({ page }) => {
  await enMobile(page)
  await page.goto('/app')
  await choisir(page, 'Mme Roche')

  await page.goto('/app/materiel')
  await page
    .getByRole('link', { name: /Jeu Dixit/ })
    .first()
    .click()
  await page.getByRole('button', { name: /^Emprunter/ }).click()
  const feuille = page.getByTestId('feuille-emprunter')
  await feuille.getByRole('button', { name: 'Pour la M1' }).click()
  await feuille.getByRole('checkbox').check({ force: true })
  await feuille.getByRole('button', { name: 'Emprunter' }).click()
  await attendreAccepte(page)
  await expect(toast(page)).toContainText('pour la M1')

  // Le back-office montre l'intervenante comme responsable du prêt de sa classe.
  await enBureau(page)
  await page.goto('/admin/prets')
  const ligne = page.getByRole('row').filter({ hasText: 'Jeu Dixit' }).first()
  await expect(ligne).toContainText('Mme Roche')
  await expect(ligne).toContainText('pour la M1')

  // Une élève ne voit ni la catégorie réservée, ni le contrôle « Pour ma classe ».
  await enMobile(page)
  await choisir(page, 'Inès')
  await page.goto('/app/materiel')
  await expect(page.getByText('Boîtes intervenant')).toHaveCount(0)
  await page
    .getByRole('link', { name: /Souris Apple/ })
    .first()
    .click()
  await page.getByRole('button', { name: /^Emprunter/ }).click()
  await expect(page.getByTestId('feuille-emprunter').getByRole('button', { name: 'Pour moi' })).toHaveCount(0)

  // R08 : seul le responsable rend le prêt — la fiche n'offre pas « Rendre » à Inès.
  await page.goto('/app/materiel/boite-01')
  await expect(page.getByRole('button', { name: 'Rendre ce matériel' })).toHaveCount(0)
})

// ─── P5 · Oubli, blocage, perte (R10 R11 R15 R16) ───────────────────────────

test('P5 · rappel de 16h30, blocage à 18h, déblocage du jour et perte à J+2', async ({ page }) => {
  await enMobile(page)
  await page.goto('/app')

  await horloge(page, 'Aller à 16h30')
  await page.goto('/app/alertes')
  await expect(page.getByText(/Pense à rendre/).first()).toBeVisible()

  // 18h : le casque #03 d'Inès n'est pas rendu, elle est bloquée (R10).
  await horloge(page, /Fin de journée/)
  await page.goto('/app')
  await expect(page.getByText('Emprunts bloqués')).toBeVisible()

  await page.goto('/app/materiel')
  await page
    .getByRole('link', { name: /Souris Apple/ })
    .first()
    .click()
  // Le bureau est fermé le soir : c'est R01 qui parle d'abord, le blocage reste visible sur l'accueil.
  await expect(page.getByRole('button', { name: /Bureau fermé/ })).toBeDisabled()

  // Déblocage par l'équipe : pour la journée seulement (R16).
  await enBureau(page)
  await page.goto('/admin/emprunteurs')
  await page.getByRole('row').filter({ hasText: 'Inès Martin' }).click()
  await page.getByRole('button', { name: 'Débloquer pour la journée' }).click()
  await attendreAccepte(page)
  await expect(toast(page)).toContainText('R16')

  // Lendemain puis fin de journée : le PC de prêt de Yanis, sorti mercredi, est perdu (R11).
  await horloge(page, /Lendemain/)
  await horloge(page, /Fin de journée/)
  await page.goto('/admin/incidents')
  const perte = page.locator('article').filter({ hasText: 'PC de prêt #02' }).first()
  await expect(perte).toContainText('450 €')
  await expect(page.getByRole('table', { name: 'Prêts' })).toHaveCount(0)
})

// ─── P6 · Me prévenir (R14) ─────────────────────────────────────────────────

test('P6 · tous les inscrits d’un type sont prévenus au retour', async ({ page }) => {
  await enMobile(page)
  await page.goto('/app')

  for (const prenom of ['Léa', 'Sarah']) {
    await choisir(page, prenom)
    await page.goto('/app/materiel')
    await page.getByRole('button', { name: /Me prévenir pour Casque d’anglais/ }).click()
    await attendreAccepte(page)
    await expect(toast(page)).toContainText('R14')
  }

  // Tom rend le casque #02 : les deux inscrites reçoivent la notification.
  await choisir(page, 'Tom')
  await page.goto('/app')
  await page.getByRole('link', { name: 'Rendre' }).first().click()
  await page.getByTestId('prendre-la-photo').click()
  await page.getByRole('button', { name: 'Valider le retour' }).click()
  await attendreAccepte(page)

  for (const prenom of ['Léa', 'Sarah']) {
    await choisir(page, prenom)
    await page.goto('/app/alertes')
    await expect(page.getByText(/Le premier qui scanne le prend/).first()).toBeVisible()
  }

  // Sarah emprunte la première : Léa n'est plus inscrite et revoit « Indisponible ».
  await choisir(page, 'Sarah')
  await page.goto('/app/materiel')
  await page
    .getByRole('link', { name: /Casque d’anglais/ })
    .first()
    .click()
  await page.getByRole('button', { name: /^Emprunter/ }).click()
  const feuille = page.getByTestId('feuille-emprunter')
  await feuille.getByRole('checkbox').check({ force: true })
  await feuille.getByRole('button', { name: 'Emprunter' }).click()
  await attendreAccepte(page)

  await choisir(page, 'Léa')
  await page.goto('/app/materiel')
  await expect(page.getByRole('button', { name: /Me prévenir pour Casque d’anglais/ })).toBeVisible()
})

// ─── P7 · Argent réservé à Sandrine (R12 R13) ───────────────────────────────

test('P7 · forfaits, ajustements et paiements sont réservés à la direction', async ({ page }) => {
  await enBureau(page)
  await page.goto('/admin/incidents')

  // Lydia (équipe) : le moteur refuse, le toast nomme R12.
  await page
    .getByRole('button', { name: /Enregistrer le paiement/ })
    .first()
    .click()
  await attendreRefus(page, 'R12')

  await choisir(page, 'Sandrine')
  const carte = page.locator('article').filter({ hasText: 'Sarah Nguyen' }).first()

  // Une hausse est refusée, une baisse acceptée.
  await carte.getByRole('button', { name: 'Ajuster' }).click()
  await page.getByLabel(/Nouveau montant/).fill('90')
  await page.getByRole('button', { name: 'Enregistrer l’ajustement' }).click()
  await attendreRefus(page, 'R12')

  await page.getByLabel(/Nouveau montant/).fill('60')
  await page.getByRole('button', { name: 'Enregistrer l’ajustement' }).click()
  await attendreAccepte(page)
  await expect(page.locator('article').filter({ hasText: 'Sarah Nguyen' }).first()).toContainText(
    '79 € ajusté par Sandrine',
  )

  await page
    .locator('article')
    .filter({ hasText: 'Sarah Nguyen' })
    .first()
    .getByRole('button', { name: /Enregistrer le paiement/ })
    .click()
  await attendreAccepte(page)

  // Forfait d'un type sans composants : édition sur place, appliquée à tout le type.
  await page.goto('/admin/incidents')
  await page.getByRole('button', { name: /Modifier le forfait de Souris Apple/ }).click()
  await page.getByLabel('Forfait de Souris Apple').fill('99')
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click()
  await attendreAccepte(page)
  await page.goto('/admin/materiel?id=souris-apple-02')
  await expect(page.getByRole('table', { name: 'Inventaire' })).toContainText('99 €')

  // Le crayon d'un kit n'édite rien sur place : il ouvre la fiche du premier exemplaire.
  await page.goto('/admin/incidents')
  await page.getByRole('button', { name: /Modifier les forfaits des composants de PC de prêt/ }).click()
  await expect(page).toHaveURL(/ancre=forfait/)
  await expect(page.getByText('Kit complet')).toBeVisible()

  // Charte : Sandrine modifie, l'app affiche le nouveau texte.
  await page.goto('/admin/reglages')
  const premier = page.getByRole('textbox').first()
  await premier.fill('Le matériel se demande au bureau de la pédagogie, sur les heures d’ouverture.')
  await page.getByRole('button', { name: 'Enregistrer la charte' }).click()
  await attendreAccepte(page)

  await enMobile(page)
  await page.goto('/app/charte')
  await expect(page.getByText(/sur les heures d’ouverture/)).toBeVisible()
})

// ─── P8 · Première connexion et signalement ─────────────────────────────────

test('P8 · première connexion, charte obligatoire, puis signalement d’une salle', async ({ page }) => {
  await enMobile(page)
  await page.goto('/app')
  await choisir(page, 'Noah')

  await page.goto('/app/charte')
  const continuer = page.getByRole('button', { name: /Continuer/ })
  await expect(continuer).toBeDisabled()
  await page.getByRole('checkbox').check({ force: true })
  await expect(continuer).toBeEnabled()
  await continuer.click()
  await attendreAccepte(page)
  await expect(page.getByText('Aucun prêt en cours')).toBeVisible()

  await page.goto('/app/signaler')
  await page.getByRole('button', { name: 'Cible du signalement' }).click()
  await page.getByRole('option', { name: 'Salle 103' }).click()
  await page.getByRole('button', { name: 'Manquant' }).click()
  await page.getByRole('button', { name: /Envoyer le signalement/ }).click()
  await attendreAccepte(page)

  await enBureau(page)
  await page.goto('/admin')
  const table = page.getByRole('table', { name: 'Signalements' })
  await expect(table).toContainText('Salle 103')
  await expect(page.getByText(/5 signalements ouverts/)).toBeVisible()

  const ligne = table.getByRole('row').filter({ hasText: 'Noah' }).first()
  await ligne.getByRole('button', { name: /Traiter le signalement/ }).click()
  await attendreAccepte(page)

  await enMobile(page)
  await choisir(page, 'Noah')
  await page.goto('/app/alertes')
  await expect(page.getByText(/signalement/).first()).toBeVisible()
})

// ─── P9 · Gestion (équipe) ──────────────────────────────────────────────────

test('P9 · comptage, salles, imports, inventaire et réglages', async ({ page }) => {
  await enBureau(page)

  // Consommables : un seul bouton global, la carte repasse « OK ».
  await page.goto('/admin/consommables')
  await page.getByLabel('Comptage de ce lundi').first().fill('25')
  await page.getByRole('button', { name: 'Enregistrer le comptage' }).click()
  await attendreAccepte(page)
  const stylos = page.locator('article').filter({ hasText: 'Stylos' }).first()
  await expect(stylos).toContainText('OK')
  await expect(page.getByRole('table', { name: 'Historique des comptages' })).toContainText('par Lydia')

  // Salles : le compteur est local, « Valider » enregistre.
  await page.goto('/admin/salles')
  const salle = page.getByRole('row').filter({ hasText: 'Salle 103' }).first()
  await salle.getByRole('button', { name: /en plus en salle 103/ }).click()
  await salle.getByRole('button', { name: 'Valider' }).click()
  await attendreAccepte(page)
  await expect(page.getByRole('row').filter({ hasText: 'Salle 103' }).first()).toContainText('Complet')

  // Imports : la ligne en erreur est ignorée, les trois valides entrent dans l'inventaire.
  await page.goto('/admin/imports')
  await page.getByRole('button', { name: 'Fichier exemple' }).click()
  await expect(page.getByText('Niveau manquant (colonne C)')).toBeVisible()
  await page.getByRole('button', { name: /Importer les 3 lignes valides/ }).click()
  await attendreAccepte(page)
  await page.goto('/admin/materiel')
  await page.getByLabel('Rechercher un matériel').fill('Dobble')
  await expect(page.getByRole('table', { name: 'Inventaire' })).toContainText('Jeu Dobble')

  // Inventaire : ajouter, retirer du prêt, remettre en service.
  await page.getByLabel('Rechercher un matériel').fill('')
  await page.getByRole('button', { name: 'Ajouter un matériel' }).click()
  await page.getByLabel('Nom').fill('Souris Apple #04')
  await page.getByLabel('Forfait en euros').fill('79')
  await page.getByRole('button', { name: 'Ajouter', exact: true }).click()
  await attendreAccepte(page)

  await page.goto('/admin/materiel?id=souris-apple-01')
  await page.getByRole('button', { name: 'Retirer du prêt' }).click()
  await attendreAccepte(page)
  await page.getByRole('button', { name: 'Remettre en service' }).click()
  await attendreAccepte(page)

  // Réglages : couper le rappel de 16h30, l'horloge ne notifie plus.
  await page.goto('/admin/reglages')
  await page.getByRole('switch', { name: 'Rappel de 16h30' }).click()
  await attendreAccepte(page)
  await expect(page.getByRole('switch', { name: 'Rappel de 16h30' })).toHaveAttribute('aria-checked', 'false')
})

// ─── Transversal ────────────────────────────────────────────────────────────

test('Transversal · annuler, réinitialiser et synchronisation entre onglets', async ({ page }) => {
  await enBureau(page)
  await page.goto('/admin/validations')

  const avant = await page.getByRole('tab', { name: /Tout/ }).textContent()
  await page
    .locator('article')
    .filter({ hasText: 'Kit Canon R10 #01' })
    .first()
    .getByRole('button', { name: 'Valider la remise' })
    .click()
  await attendreAccepte(page)
  await expect(page.getByRole('tab', { name: /Tout/ })).not.toHaveText(avant ?? '')

  // ⌘Z / Ctrl+Z rejoue l'état précédent, changement d'horloge inclus.
  await page.keyboard.press('Control+z')
  await expect(page.getByRole('tab', { name: /Tout/ })).toHaveText(avant ?? '')

  await horloge(page, /Fin de journée/)
  await page.keyboard.press('Control+z')
  await page.goto('/admin')
  await expect(page.getByText(/mis à jour à 10:15/)).toBeVisible()

  // Réinitialiser restaure le seed.
  await page.getByTestId('bouton-demo').click()
  await page.getByRole('button', { name: 'Réinitialiser la démo' }).click()
  await expect(page.getByText(/3 remises et 1 retour à valider au bureau/)).toBeVisible()
})

test('Transversal · deux onglets restent synchronisés sans rechargement', async ({ page, context }) => {
  await enBureau(page)
  await page.goto('/admin/validations')

  const mobile = await context.newPage()
  await mobile.setViewportSize(MOBILE)
  await mobile.goto('/app')
  const carteDuKit = mobile.locator('section, article').filter({ hasText: 'Kit Canon R10 #01' }).last()
  await expect(carteDuKit).toContainText('Demande envoyée')

  await page
    .locator('article')
    .filter({ hasText: 'Kit Canon R10 #01' })
    .first()
    .getByRole('button', { name: 'Valider la remise' })
    .click()
  await attendreAccepte(page)

  // L'onglet mobile se met à jour par l'événement `storage`, sans rechargement.
  await expect(carteDuKit).toContainText('En cours · depuis', { timeout: 5000 })
  await mobile.close()
})

test('Transversal · aucun défilement horizontal à 390 px sur les dix écrans mobile', async ({ page }) => {
  await enMobile(page)
  const routes = [
    '/app',
    '/app/connexion',
    '/app/charte',
    '/app/materiel',
    '/app/materiel/souris-apple-01',
    '/app/rendre/casque-03',
    '/app/scanner',
    '/app/signaler',
    '/app/alertes',
    '/app/profil',
  ]
  for (const route of routes) {
    await page.goto(route)
    const large = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(large, `défilement horizontal sur ${route}`).toBeLessThanOrEqual(390)
  }
})

test('Transversal · le back-office se parcourt au clavier', async ({ page }) => {
  await enBureau(page)
  await page.goto('/admin')

  // L'en-tête vient avant le rail dans le DOM, comme au Figma : on parcourt jusqu'au menu.
  const etiquettes: (string | null)[] = []
  for (let pas = 0; pas < 6; pas += 1) {
    await page.keyboard.press('Tab')
    etiquettes.push(await page.evaluate(() => document.activeElement?.getAttribute('aria-label') ?? null))
  }
  expect(etiquettes).toContain('Rechercher')
  expect(etiquettes).toContain('Tableau de bord')
  expect(etiquettes).toContain('Validations sur place')

  // L'anneau de focus du Figma est bien posé (token Focus/Anneau).
  const ombre = await page.evaluate(() =>
    document.activeElement === null ? '' : getComputedStyle(document.activeElement).boxShadow,
  )
  expect(ombre).not.toBe('none')
})
