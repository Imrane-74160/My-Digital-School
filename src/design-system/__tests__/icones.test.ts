import { describe, expect, it } from 'vitest'
import { chargerSeed } from '@/domain'
import { ICONES, NOMS_ICONES, iconePeutEtre } from '../icones'

const etat = chargerSeed()

/** Icônes que le moteur émet lui-même dans ses notifications. */
const ICONES_DU_MOTEUR = [
  'Cloche',
  'Coche',
  'Utilisateur validé',
  'Liste cochée',
  'Échange',
  'Image',
  'Portefeuille',
  'Cadenas',
  'Cadenas ouvert',
  'Drapeau',
  'Alerte',
  'Horloge',
  'Enveloppe',
]

describe('table des icônes', () => {
  it('couvre les 63 icônes du design system', () => {
    expect(NOMS_ICONES).toHaveLength(63)
  })

  it('fournit « Trépied », absent de lucide, reprise du Figma', () => {
    expect(iconePeutEtre('Trépied')).toBeDefined()
  })

  it('résout toutes les icônes citées par le jeu de démo', () => {
    const citees = new Set<string>([
      ...etat.materiels.map((m) => m.icone),
      ...etat.consommables.map((c) => c.icone),
      ...etat.notifications.map((n) => n.icone),
      ...etat.importExemple.inventaire.lignes.map((l) => l.icone),
    ])
    const inconnues = [...citees].filter((nom) => iconePeutEtre(nom) === undefined)
    expect(inconnues, 'icônes du seed absentes du design system').toEqual([])
    expect(citees.size).toBeGreaterThan(10)
  })

  it('résout toutes les icônes émises par le moteur', () => {
    const inconnues = ICONES_DU_MOTEUR.filter((nom) => iconePeutEtre(nom) === undefined)
    expect(inconnues).toEqual([])
  })

  it('n’expose aucune entrée vide', () => {
    for (const [nom, composant] of Object.entries(ICONES)) {
      expect(composant, `icône vide : ${nom}`).toBeTruthy()
    }
  })
})
