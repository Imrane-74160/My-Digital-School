/**
 * Fidélité du design system : chaque valeur attendue est celle relevée sur la page
 * « Composants » du Figma (`get_design_context` sur le nœud cité). Ces tests figent
 * la géométrie et les couleurs pour que personne ne les fasse dériver sans le voir.
 */
import { expect, test, type Page } from '@playwright/test'

type Mesures = {
  w: number
  h: number
  rayon: string
  pad: string
  gap: string
  police: string
  fond: string
  couleur: string
}

const section = (noeud: string) => `section[aria-labelledby="section-${noeud}"]`

async function mesurer(page: Page, selecteur: string, index = 0): Promise<Mesures> {
  const mesures = await page.evaluate(
    ({ selecteur, index }) => {
      const noeud = document.querySelectorAll(selecteur)[index]
      if (!noeud) return null
      const boite = noeud.getBoundingClientRect()
      const style = getComputedStyle(noeud)
      return {
        w: Math.round(boite.width * 100) / 100,
        h: Math.round(boite.height * 100) / 100,
        rayon: style.borderRadius,
        pad: `${style.paddingTop}/${style.paddingRight}/${style.paddingBottom}/${style.paddingLeft}`,
        gap: style.columnGap,
        police: `${style.fontWeight} ${style.fontSize}/${style.lineHeight}`,
        fond: style.backgroundColor,
        couleur: style.color,
      }
    },
    { selecteur, index },
  )
  expect(mesures, `élément introuvable : ${selecteur} [${index}]`).not.toBeNull()
  return mesures!
}

async function mesurerParTexte(page: Page, selecteur: string, texte: string): Promise<Mesures> {
  const mesures = await page.evaluate(
    ({ selecteur, texte }) => {
      const noeud = [...document.querySelectorAll(selecteur)].find((x) => x.textContent?.trim() === texte)
      if (!noeud) return null
      const style = getComputedStyle(noeud)
      const boite = noeud.getBoundingClientRect()
      return {
        w: Math.round(boite.width * 100) / 100,
        h: Math.round(boite.height * 100) / 100,
        rayon: style.borderRadius,
        pad: `${style.paddingTop}/${style.paddingRight}/${style.paddingBottom}/${style.paddingLeft}`,
        gap: style.columnGap,
        police: `${style.fontWeight} ${style.fontSize}/${style.lineHeight}`,
        fond: style.backgroundColor,
        couleur: style.color,
      }
    },
    { selecteur, texte },
  )
  expect(mesures, `texte introuvable : « ${texte} »`).not.toBeNull()
  return mesures!
}

test.beforeEach(async ({ page }) => {
  await page.goto('/design-system')
  await page.evaluate(() => document.fonts.ready.then(() => true))
})

test('Bouton 43:101 · géométrie et couleurs des 24 variantes', async ({ page }) => {
  const boutons = page.locator(`${section('43:101')} button`)

  // Figma : M 103 × 40, rayon « bouton » 20, padding 16/16, gap 8, Inter 500 14/18.
  const m = await mesurer(page, `${section('43:101')} button`, 0)
  expect(m.h).toBe(40)
  // La largeur découle des métriques de la police : on tolère 2 px autour du Figma.
  // La hauteur, les rayons, les paddings et la typo, eux, sont exacts.
  expect(Math.abs(m.w - 103)).toBeLessThanOrEqual(2)
  expect(m.rayon).toBe('20px')
  expect(m.pad).toBe('0px/16px/0px/16px')
  expect(m.gap).toBe('8px')
  expect(m.police).toBe('500 14px/18px')
  expect(m.fond).toBe('rgb(45, 184, 197)')
  expect(m.couleur).toBe('rgb(29, 29, 27)') // libellé sombre sur turquoise

  // Figma : L 117 × 52, rayon « champ » 24, padding 16 à gauche / 20 à droite, Inter 500 16/18.
  const l = await mesurer(page, `${section('43:101')} button`, 3)
  expect(l.h).toBe(52)
  expect(Math.abs(l.w - 117)).toBeLessThanOrEqual(2)
  expect(l.rayon).toBe('24px')
  expect(l.pad).toBe('0px/20px/0px/16px')
  expect(l.police).toBe('500 16px/18px')

  // Désactivé : surface et texte désactivés.
  const desactive = await mesurer(page, `${section('43:101')} button`, 1)
  expect(desactive.fond).toBe('rgb(228, 231, 235)')
  expect(desactive.couleur).toBe('rgb(174, 180, 188)')

  // Survol : teinte pressée-survol et halo turquoise pour Principal, aucun halo pour Secondaire.
  await boutons.nth(0).scrollIntoViewIfNeeded()
  await boutons.nth(0).hover()
  await expect
    .poll(() => boutons.nth(0).evaluate((n) => getComputedStyle(n).backgroundColor))
    .toBe('rgb(37, 167, 179)')
  await expect
    .poll(() => boutons.nth(0).evaluate((n) => getComputedStyle(n).boxShadow))
    .toContain('rgba(45, 184, 197, 0.35)')

  await boutons.nth(6).scrollIntoViewIfNeeded()
  await boutons.nth(6).hover()
  expect(await boutons.nth(6).evaluate((n) => getComputedStyle(n).boxShadow)).toBe('none')
})

test('Bouton icône 44:89 · boîte ronde et halo du style Plein', async ({ page }) => {
  const doux = await mesurer(page, `${section('44:89')} button`, 1)
  expect([doux.w, doux.h]).toEqual([40, 40])
  expect(doux.rayon).toBe('999px')
  expect(doux.couleur).toBe('rgb(29, 29, 27)') // icône sombre dans les quatre styles

  const plein = page.locator(`${section('44:89')} button`).nth(15)
  await expect(plein).toHaveAccessibleName(/Plein/)
  expect(await plein.evaluate((n) => getComputedStyle(n).backgroundColor)).toBe('rgb(45, 184, 197)')

  // La section est sous la ligne de flottaison : il faut l'amener à l'écran avant de survoler.
  await plein.scrollIntoViewIfNeeded()
  await plein.hover()
  await expect
    .poll(() => plein.evaluate((n) => getComputedStyle(n).boxShadow))
    .toContain('rgba(45, 184, 197, 0.35)')
})

test('Badge de statut 45:89 · cinq familles de couleur', async ({ page }) => {
  const badge = await mesurer(page, `${section('45:89')} span`, 0)
  expect(badge.rayon).toBe('8px')
  expect(badge.pad).toBe('3px/9px/3px/8px')
  expect(badge.gap).toBe('6px')
  expect(badge.police).toBe('500 12px/16px')

  const familles: [string, string, string][] = [
    ['Disponible', 'rgb(226, 245, 247)', 'rgb(17, 112, 122)'],
    ['En cours', 'rgb(227, 238, 248)', 'rgb(43, 94, 140)'],
    ['À valider', 'rgb(253, 239, 217)', 'rgb(166, 95, 0)'],
    ['En retard', 'rgb(252, 228, 239)', 'rgb(176, 38, 107)'],
    ['Retiré', 'rgb(233, 237, 241)', 'rgb(90, 96, 107)'],
  ]
  for (const [statut, fond, couleur] of familles) {
    const mesure = await mesurerParTexte(page, `${section('45:89')} span`, statut)
    expect(mesure.fond, statut).toBe(fond)
    expect(mesure.couleur, statut).toBe(couleur)
  }
})

test('Pastille 45:96 · chasse fixe, variante Classe en anthracite', async ({ page }) => {
  const niveau = await mesurer(page, `${section('45:96')} span`, 0)
  expect(niveau.rayon).toBe('8px')
  expect(niveau.pad).toBe('2px/7px/2px/7px')
  expect(niveau.police).toBe('400 11px/16px')
  expect(niveau.fond).toBe('rgb(233, 237, 241)')

  const classe = await mesurerParTexte(page, `${section('45:96')} span`, 'B3')
  expect(classe.fond).toBe('rgb(60, 60, 59)')
  expect(classe.couleur).toBe('rgb(255, 255, 255)')
})

test('Avatar 45:110 · six tailles, la 84 en Bricolage Grotesque', async ({ page }) => {
  const avatars = page.locator(`${section('45:110')} span[aria-label]`)
  const attendues = [22, 28, 32, 44, 48, 84]
  for (const [index, cote] of attendues.entries()) {
    const mesure = await mesurer(page, `${section('45:110')} span[aria-label]`, index)
    expect([mesure.w, mesure.h], `taille ${cote}`).toEqual([cote, cote])
    expect(mesure.rayon, `taille ${cote}`).toBe('999px')
  }

  // Les petites tailles écrivent en Inter, la 84 en Bricolage Grotesque 28/32.
  const police = (index: number) =>
    avatars
      .nth(index)
      .locator('span')
      .evaluate((n) => {
        const s = getComputedStyle(n)
        return `${s.fontFamily.split(',')[0]} ${s.fontSize}/${s.lineHeight}`
      })
  expect(await police(0)).toContain('Inter')
  expect(await police(5)).toContain('Bricolage Grotesque')
  expect(await police(5)).toContain('28px/32px')
})

test('Pictogramme 59:150 · carré au rayon 14, rond, icône sombre', async ({ page }) => {
  const carre = await mesurer(page, `${section('59:150')} span[style*="width: 44px"]`, 0)
  expect([carre.w, carre.h]).toEqual([44, 44])
  expect(carre.rayon).toBe('14px')
  expect(carre.fond).toBe('rgb(241, 243, 246)')
  expect(carre.couleur).toBe('rgb(29, 29, 27)')

  const rond = await mesurer(page, `${section('59:150')} span[style*="width: 44px"]`, 7)
  expect(rond.rayon).toBe('999px')
})

test('Puce de composant 45:130 · lecture seule et bascule', async ({ page }) => {
  const verifiee = await mesurer(page, `${section('45:130')} span.inline-flex`, 0)
  expect(verifiee.rayon).toBe('14px')
  expect(verifiee.pad).toBe('5px/10px/5px/10px')
  expect(verifiee.gap).toBe('5px')
  expect(verifiee.police).toBe('400 12px/16px')
  expect(verifiee.fond).toBe('rgb(226, 245, 247)')

  // Une puce en lecture seule n'est pas un bouton : elle n'est pas cliquable.
  await expect(page.locator(`${section('45:130')} span.inline-flex`).first()).not.toHaveRole('button')

  // La bascule change bien l'état annoncé aux lecteurs d'écran.
  const bascule = page.locator(`${section('45:130')} button`).first()
  await expect(bascule).toHaveAttribute('aria-pressed', 'false')
  await bascule.click()
  await expect(bascule).toHaveAttribute('aria-pressed', 'true')
})

test('Puce de catégorie 61:132 · active en anthracite', async ({ page }) => {
  const active = await mesurer(page, `${section('61:132')} button`, 0)
  expect(active.rayon).toBe('18px')
  expect(active.pad).toBe('8px/14px/8px/14px')
  expect(active.police).toBe('500 13px/18px')
  expect(active.fond).toBe('rgb(60, 60, 59)')
  expect(active.couleur).toBe('rgb(255, 255, 255)')

  // La sélection suit le clic.
  const studio = page.locator(`${section('61:132')} button`).nth(1)
  await expect(studio).toHaveAttribute('aria-pressed', 'false')
  await studio.click()
  await expect(studio).toHaveAttribute('aria-pressed', 'true')
})

test('les 63 icônes du design system se rendent toutes', async ({ page }) => {
  const icones = page.locator(`${section('40:3')} li svg`)
  await expect(icones).toHaveCount(63)
  // Toutes au trait 1,5 et à la couleur héritée.
  const traits = await icones.evaluateAll((noeuds) => noeuds.map((n) => n.getAttribute('stroke-width')))
  expect(new Set(traits)).toEqual(new Set(['1.5']))
})
