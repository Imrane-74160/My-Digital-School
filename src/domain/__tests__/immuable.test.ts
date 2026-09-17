/**
 * `dispatch` est immuable : sur un refus, l'objet état renvoyé est *exactement* celui
 * reçu (identité préservée, vérifiée avec `toBe`). Sur un succès, l'original n'a pas bougé.
 *
 * Ce fichier couvre aussi un refus de droits par action protégée : ajouter une action
 * à `ACTIONS_PROTEGEES` sans l'échantillonner ici fait échouer le test de couverture.
 */
import { describe, expect, it } from 'vitest'
import type { Action, TypeAction } from '../actions'
import { ACTIONS_PROTEGEES } from '../actions'
import { dispatch } from '../engine'
import { chargerSeed } from '../seed'

const etat = chargerSeed()

/** Une action de forme valide par type protégé, jouée par quelqu'un qui n'y a pas droit. */
const SANS_DROIT: Record<string, Action> = {
  // Réservé à l'équipe (R13) : tenté par une élève.
  VALIDER_REMISE: { type: 'VALIDER_REMISE', par: 'ines', materiel: 'kit-r10-01' },
  VALIDER_RETOUR: { type: 'VALIDER_RETOUR', par: 'ines', materiel: 'micro-hf-01' },
  CONTROLER_PHOTO: { type: 'CONTROLER_PHOTO', par: 'ines', materiel: 'codenames-01' },
  TRAITER_SIGNALEMENT: { type: 'TRAITER_SIGNALEMENT', par: 'ines', signalement: 'S1' },
  RETIRER: { type: 'RETIRER', par: 'ines', materiel: 'trepied-01' },
  REMETTRE: { type: 'REMETTRE', par: 'ines', materiel: 'casque-01' },
  AJOUTER_MATERIEL: {
    type: 'AJOUTER_MATERIEL',
    par: 'ines',
    donnees: {
      nom: 'Souris filaire #04',
      categorie: 'cours',
      niveau: 2,
      lieu: 'Bureau de la pédagogie',
      forfait: 12,
    },
  },
  DEBLOQUER: { type: 'DEBLOQUER', par: 'ines', personne: 'yanis' },
  COMPTAGE: { type: 'COMPTAGE', par: 'ines', quantites: { stylos: 25 } },
  VERIFIER_SALLE: { type: 'VERIFIER_SALLE', par: 'ines', salle: '103', presents: 2 },
  IMPORT_INVENTAIRE: { type: 'IMPORT_INVENTAIRE', par: 'ines', lignes: [] },
  IMPORT_CLASSES: { type: 'IMPORT_CLASSES', par: 'ines', classes: ['B1', 'B2'] },
  REGLAGE: { type: 'REGLAGE', par: 'ines', cle: 'rappel1630', valeur: false },
  // Réservé à la direction (R12) : tenté par l'équipe.
  MODIFIER_FORFAIT: { type: 'MODIFIER_FORFAIT', par: 'lydia', typeMateriel: 'casque-anglais', valeur: 40 },
  AJUSTER_MONTANT: { type: 'AJUSTER_MONTANT', par: 'lydia', incident: 'I1', valeur: 10 },
  REMBOURSEMENT: { type: 'REMBOURSEMENT', par: 'lydia', incident: 'I1' },
  MODIFIER_CHARTE: {
    type: 'MODIFIER_CHARTE',
    par: 'lydia',
    articles: [{ id: 'usage', titre: 'Usage', texte: 'Texte réécrit.' }],
  },
}

describe('droits (R12, R13)', () => {
  it('échantillonne toutes les actions protégées, sans en oublier', () => {
    const protegees: TypeAction[] = [...ACTIONS_PROTEGEES.equipe, ...ACTIONS_PROTEGEES.direction]
    expect(protegees).toHaveLength(17)
    for (const type of protegees) {
      expect(SANS_DROIT[type], `aucun échantillon pour ${type}`).toBeDefined()
    }
  })

  it.each(ACTIONS_PROTEGEES.equipe)('refuse %s à une élève avec le code R13', (type) => {
    const r = dispatch(etat, SANS_DROIT[type]!)
    expect(r.ok).toBe(false)
    expect(r.regle).toBe('R13')
    expect(r.msg).toContain('réservée à l’équipe')
  })

  it.each(ACTIONS_PROTEGEES.direction)('refuse %s à l’équipe avec le code R12', (type) => {
    const r = dispatch(etat, SANS_DROIT[type]!)
    expect(r.ok).toBe(false)
    expect(r.regle).toBe('R12')
    expect(r.msg).toContain('réservé à Sandrine')
  })
})

describe('immuabilité de dispatch', () => {
  it.each(Object.keys(SANS_DROIT))('un refus de %s renvoie exactement l’objet état reçu', (type) => {
    const r = dispatch(etat, SANS_DROIT[type]!)
    expect(r.ok).toBe(false)
    // Identité, pas seulement égalité : l'état n'a même pas été recopié.
    expect(r.etat).toBe(etat)
    expect(r.notifications).toEqual([])
  })

  it('un refus de règle métier renvoie aussi l’objet reçu', () => {
    const refus: Action[] = [
      { type: 'EMPRUNTER', par: 'ines', materiel: 'souris-apple-01', forfaitAccepte: false }, // R03
      { type: 'EMPRUNTER', par: 'noah', materiel: 'souris-apple-01', forfaitAccepte: true }, // R03
      { type: 'EMPRUNTER', par: 'ines', materiel: 'casque-02', forfaitAccepte: true }, // R02
      { type: 'EMPRUNTER', par: 'ines', materiel: 'boite-01', forfaitAccepte: true }, // R09
      { type: 'RENDRE', par: 'tom', materiel: 'casque-03', photo: true }, // R08
      { type: 'RENDRE', par: 'ines', materiel: 'casque-03', photo: false }, // R05
      { type: 'CONTROLER_PHOTO', par: 'lydia', materiel: 'micro-hf-01' }, // R04
      { type: 'PREVENEZ_MOI', par: 'lea', typeMateriel: 'souris-apple' }, // R14
      { type: 'DEBLOQUER', par: 'lydia', personne: 'tom' }, // R16
      { type: 'AJUSTER_MONTANT', par: 'sandrine', incident: 'I1', valeur: 200 }, // R12
    ]
    for (const action of refus) {
      const r = dispatch(etat, action)
      expect(r.ok, `${action.type} aurait dû être refusée`).toBe(false)
      expect(r.regle, `${action.type} sans code de règle`).not.toBeNull()
      expect(r.etat, `${action.type} a recopié l’état`).toBe(etat)
    }
  })

  it('une action inconnue ou impossible ne casse pas l’état', () => {
    const r = dispatch(etat, { type: 'VALIDER_REMISE', par: 'lydia', materiel: 'materiel-fantome' })
    expect(r.ok).toBe(false)
    expect(r.etat).toBe(etat)
  })

  it('un succès renvoie un nouvel objet et laisse l’original intact', () => {
    const avant = structuredClone(etat)
    const r = dispatch(etat, { type: 'VALIDER_REMISE', par: 'lydia', materiel: 'kit-r10-01' })
    expect(r.ok).toBe(true)
    expect(r.etat).not.toBe(etat)
    expect(etat).toEqual(avant)
  })

  it('ne partage aucune sous-structure entre l’état d’avant et celui d’après', () => {
    const r = dispatch(etat, { type: 'VALIDER_REMISE', par: 'lydia', materiel: 'kit-r10-01' })
    expect(r.etat.prets).not.toBe(etat.prets)
    expect(r.etat.materiels).not.toBe(etat.materiels)
    expect(r.etat.notifications).not.toBe(etat.notifications)
    expect(r.etat.reglages).not.toBe(etat.reglages)
    expect(r.etat.reglages.charte.articles).not.toBe(etat.reglages.charte.articles)
  })

  it('reste déterministe : deux fois la même action donne le même état', () => {
    const a = dispatch(etat, { type: 'VALIDER_REMISE', par: 'lydia', materiel: 'kit-r10-01' })
    const b = dispatch(etat, { type: 'VALIDER_REMISE', par: 'lydia', materiel: 'kit-r10-01' })
    expect(a.etat).toEqual(b.etat)
    expect(a.msg).toBe(b.msg)
  })
})
