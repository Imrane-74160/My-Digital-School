import { expect, seConnecter, test } from './aides'

// Projet « mobile » : viewport 390 × 844, la taille exacte de la maquette Figma.

test.describe('Entrée dans l’app · /', () => {
  test('mène à la connexion tant que personne n’est connecté', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle('Prêts MDS')
    await expect(page).toHaveURL(/\/app\/connexion$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Emprunte le matériel')
    await expect(page.getByLabel('Identifiant MDS')).toBeVisible()
  })

  test('refuse un identifiant inconnu et un compte de l’équipe', async ({ page }) => {
    await page.goto('/app/connexion')
    await page.getByLabel('Identifiant MDS').fill('personne.inconnue')
    await page.getByRole('button', { name: 'Se connecter' }).click()
    await expect(page.getByText('Aucun compte ne correspond')).toBeVisible()

    // R13 : l'équipe a son propre espace.
    await page.getByLabel('Identifiant MDS').fill('lydia')
    await page.getByRole('button', { name: 'Se connecter' }).click()
    await expect(page.getByText(/réservé aux élèves et aux intervenants/)).toBeVisible()
  })

  test('applique les couleurs de la charte depuis les tokens Figma', async ({ page }) => {
    await page.goto('/app/connexion')
    // Turquoise de marque : #2DB8C5, porté par le bouton principal une fois actif.
    // Si le câblage Tailwind ↔ tokens casse, ce test tombe.
    await page.getByLabel('Identifiant MDS').fill('ines.martin')
    // Le bouton passe de désactivé à actif en 120 ms : on attend la fin de la transition.
    await expect
      .poll(() =>
        page
          .getByRole('button', { name: 'Se connecter' })
          .evaluate((noeud) => getComputedStyle(noeud).backgroundColor),
      )
      .toBe('rgb(45, 184, 197)')

    const fond = await page.evaluate(() => getComputedStyle(document.body).backgroundImage)
    expect(fond).toContain('linear-gradient')
  })

  test('charge réellement les trois polices de la charte', async ({ page }) => {
    // La galerie porte les trois familles côte à côte : c'est là qu'on les vérifie.
    await page.goto('/design-system')
    await page.evaluate(() => document.fonts.ready.then(() => true))

    // On vérifie le statut des FontFace, pas `document.fonts.check()` : celui-ci renvoie false
    // dès qu'une face du même nom reste non chargée (les sous-ensembles latin / latin-ext).
    const chargees = await page.evaluate(() =>
      [...document.fonts].filter((face) => face.status === 'loaded').map((face) => face.family),
    )
    for (const famille of ['Bricolage Grotesque', 'Inter', 'JetBrains Mono']) {
      expect(chargees, `police non chargée : ${famille}`).toContain(famille)
    }

    // Et surtout : chaque famille est réellement appliquée là où le Figma l'attend.
    const police = (selecteur: string) =>
      page
        .locator(selecteur)
        .first()
        .evaluate((noeud) => getComputedStyle(noeud).fontFamily)

    expect(await police('h1')).toContain('Bricolage Grotesque')
    expect(await police('.mds-texte-corps')).toContain('Inter')
    expect(await police('.mds-mono-micro')).toContain('JetBrains Mono')
  })
})

test.describe('App mobile · /app', () => {
  test('occupe tout l’écran sous 500 px et ne défile jamais horizontalement', async ({ page }) => {
    await seConnecter(page, 'ines')
    const cadre = page.getByTestId('cadre-telephone')
    await expect(cadre).toBeVisible()

    const largeur = (await cadre.boundingBox())?.width
    expect(largeur).toBe(390)

    const debordement = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    expect(debordement, 'défilement horizontal à 390 px').toBe(false)
  })

  test('répond sur les dix écrans A1 → A10', async ({ page }) => {
    await seConnecter(page, 'ines')
    const chemins = [
      '/app',
      '/app/connexion',
      '/app/charte',
      '/app/materiel',
      '/app/materiel/casque-03',
      '/app/rendre/casque-03',
      '/app/scanner',
      '/app/signaler',
      '/app/alertes',
      '/app/profil',
    ]
    for (const chemin of chemins) {
      await page.goto(chemin)
      // Connecté, l'écran de connexion renvoie à l'accueil : son titre est celui de A3.
      await expect(page.getByRole('heading', { level: 1 }), chemin).toBeVisible()
      await expect(page.getByTestId('cadre-telephone'), chemin).toBeVisible()
    }
  })

  test('masque la barre de navigation sur les écrans plein écran du Figma', async ({ page }) => {
    await seConnecter(page, 'ines')
    for (const chemin of ['/app', '/app/materiel', '/app/alertes', '/app/profil']) {
      await page.goto(chemin)
      await expect(page.getByTestId('zone-navigation'), chemin).toBeVisible()
    }
    for (const chemin of ['/app/charte', '/app/rendre/casque-03', '/app/scanner', '/app/signaler']) {
      await page.goto(chemin)
      await expect(page.getByTestId('zone-navigation'), chemin).toHaveCount(0)
    }
  })
})

test.describe('Routes restantes', () => {
  test('la galerie du design system répond', async ({ page }) => {
    await page.goto('/design-system')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Design system')
  })

  test('une adresse inconnue affiche la page introuvable', async ({ page }) => {
    await page.goto('/cette-adresse-nexiste-pas')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page introuvable')
  })
})
