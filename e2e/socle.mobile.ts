import { expect, test } from '@playwright/test'

// Projet « mobile » : viewport 390 × 844, la taille exacte de la maquette Figma.

test.describe('Accueil de la démo · /', () => {
  test('affiche le produit et ses trois surfaces', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle('Prêts MDS')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Prêts MDS')
    await expect(page.getByRole('link', { name: /App mobile/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /Back-office/ })).toBeVisible()
    await expect(page.getByText('Côte à côte')).toBeVisible()
  })

  test('applique les couleurs de la charte depuis les tokens Figma', async ({ page }) => {
    await page.goto('/')
    // Turquoise de marque : #2DB8C5. Si le câblage Tailwind ↔ tokens casse, ce test tombe.
    const turquoise = await page
      .locator('svg.text-marque-turquoise')
      .first()
      .evaluate((noeud) => getComputedStyle(noeud).color)
    expect(turquoise).toBe('rgb(45, 184, 197)')

    const fond = await page.evaluate(() => getComputedStyle(document.body).backgroundImage)
    expect(fond).toContain('linear-gradient')
  })

  test('charge réellement les trois polices de la charte', async ({ page }) => {
    await page.goto('/')
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
    await page.goto('/app')
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
      await expect(page.getByRole('heading', { level: 1 }), chemin).toBeVisible()
      await expect(page.getByTestId('cadre-telephone'), chemin).toBeVisible()
    }
  })

  test('masque la barre de navigation sur les cinq écrans plein écran du Figma', async ({ page }) => {
    for (const chemin of ['/app', '/app/materiel', '/app/alertes', '/app/profil']) {
      await page.goto(chemin)
      await expect(page.getByTestId('zone-navigation'), chemin).toBeVisible()
    }
    for (const chemin of [
      '/app/connexion',
      '/app/charte',
      '/app/rendre/casque-03',
      '/app/scanner',
      '/app/signaler',
    ]) {
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
