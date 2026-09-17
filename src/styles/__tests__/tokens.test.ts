import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const racine = (chemin: string) => fileURLToPath(new URL(`../../../${chemin}`, import.meta.url))

const tokensCss = readFileSync(racine('design/tokens.css'), 'utf8')
const tokensJson = JSON.parse(readFileSync(racine('design/tokens.json'), 'utf8')) as Record<
  string,
  Record<string, string>
>
const feuilleApp = readFileSync(racine('src/styles/index.css'), 'utf8')

/** Nom → valeur, en gardant la première déclaration (celle de `:root`, pas celle de reduced-motion). */
function variablesDe(css: string): Map<string, string> {
  const trouvees = new Map<string, string>()
  for (const [, nom, valeur] of css.matchAll(/(--mds-[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    const propre = valeur!.replace(/\/\*.*?\*\//g, '').trim()
    if (!trouvees.has(nom!)) trouvees.set(nom!, propre)
  }
  return trouvees
}

const variablesFigma = variablesDe(tokensCss)

describe('design/tokens.css', () => {
  it('déclare les tokens exportés du Figma', () => {
    expect(variablesFigma.size).toBeGreaterThan(60)
  })

  it('reste synchronisé avec design/tokens.json, valeur par valeur', () => {
    const attendues = new Map<string, string>()
    for (const groupe of Object.values(tokensJson)) {
      for (const [cle, valeur] of Object.entries(groupe)) {
        attendues.set(`--mds-${cle}`, valeur)
      }
    }

    expect(attendues.size).toBe(variablesFigma.size)

    const ecarts = [...attendues].filter(([nom, valeur]) => variablesFigma.get(nom) !== valeur)
    expect(ecarts).toEqual([])
  })
})

describe('src/styles/index.css', () => {
  it('ne référence que des tokens qui existent réellement', () => {
    const referencees = [...feuilleApp.matchAll(/var\((--mds-[a-z0-9-]+)\)/g)].map(([, nom]) => nom!)
    expect(referencees.length).toBeGreaterThan(50)

    const inconnues = [...new Set(referencees)].filter((nom) => !variablesFigma.has(nom))
    expect(inconnues).toEqual([])
  })

  it('n’introduit aucune couleur en dur dans le thème Tailwind', () => {
    const bloc = feuilleApp.match(/@theme inline \{([\s\S]*?)\n\}/)
    expect(bloc).not.toBeNull()

    const hexEnDur = [...bloc![1]!.matchAll(/#[0-9a-fA-F]{3,8}/g)].map(([hex]) => hex)
    expect(hexEnDur).toEqual([])
  })

  it('expose chaque famille de tokens à Tailwind', () => {
    for (const prefixe of [
      '--color-marque-',
      '--color-texte-',
      '--color-surface-',
      '--color-trait-',
      '--color-etat-',
      '--spacing-',
      '--radius-',
      '--shadow-',
      '--ease-',
      '--duration-',
      '--font-',
    ]) {
      expect(feuilleApp, `famille manquante : ${prefixe}`).toContain(prefixe)
    }
  })
})
