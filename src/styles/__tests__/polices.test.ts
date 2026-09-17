import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const racine = (chemin: string) => fileURLToPath(new URL(`../../../${chemin}`, import.meta.url))

const tokensCss = readFileSync(racine('design/tokens.css'), 'utf8')
const polices = readFileSync(racine('src/styles/polices.ts'), 'utf8')
const packageJson = JSON.parse(readFileSync(racine('package.json'), 'utf8')) as {
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
}

/** Uniquement les spécificateurs importés : les commentaires n'ont pas à être analysés. */
const importes = [...polices.matchAll(/^\s*import\s+'([^']+)'/gm)].map(([, chemin]) => chemin!)

/** Familles demandées par les tokens Figma, dans l'ordre `--mds-police-*`. */
function famillesDemandees(): string[] {
  const noms = new Set<string>()
  for (const [, liste] of tokensCss.matchAll(/--mds-police-[a-z]+:\s*([^;]+);/g)) {
    const premiere = liste!.split(',')[0]!.trim().replace(/^"|"$/g, '')
    noms.add(premiere)
  }
  return [...noms]
}

describe('polices', () => {
  it('les tokens Figma demandent bien les trois familles de la charte', () => {
    expect(famillesDemandees().sort()).toEqual(['Bricolage Grotesque', 'Inter', 'JetBrains Mono'])
  })

  it('charge un paquet @fontsource par famille demandée', () => {
    const paquets: Record<string, string> = {
      'Bricolage Grotesque': '@fontsource/bricolage-grotesque/',
      Inter: '@fontsource/inter/',
      'JetBrains Mono': '@fontsource/jetbrains-mono/',
    }
    for (const famille of famillesDemandees()) {
      const prefixe = paquets[famille]!
      expect(
        importes.filter((chemin) => chemin.startsWith(prefixe)),
        `police non chargée : ${famille}`,
      ).not.toHaveLength(0)
    }
  })

  it('n’utilise pas @fontsource-variable, qui nomme les familles « … Variable »', () => {
    // Piège réel : « Inter Variable » ne correspond pas au token « Inter »,
    // la police ne s'appliquerait jamais et tout retomberait sur system-ui.
    expect(importes.filter((chemin) => chemin.startsWith('@fontsource-variable'))).toEqual([])
    const toutesLesDeps = { ...packageJson.dependencies, ...packageJson.devDependencies }
    expect(Object.keys(toutesLesDeps).filter((nom) => nom.startsWith('@fontsource-variable/'))).toEqual([])
  })

  it('charge les graisses réellement utilisées par les styles de texte du Figma', () => {
    const graisses = new Set([...tokensCss.matchAll(/font:\s*(\d{3})/g)].map(([, g]) => g!))
    expect([...graisses].sort()).toEqual(['400', '500'])
    for (const graisse of graisses) {
      expect(
        importes.filter((chemin) => chemin.endsWith(`-${graisse}.css`)),
        `graisse ${graisse} non chargée`,
      ).not.toHaveLength(0)
    }
  })
})
