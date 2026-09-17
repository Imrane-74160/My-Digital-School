/**
 * Les deux chaînes complètes de `docs/02-regles-metier.md`, jouées de bout en bout,
 * plus les compteurs après chaque étape.
 */
import { describe, expect, it } from 'vitest'
import type { Action } from '../actions'
import { dispatch } from '../engine'
import { chargerSeed } from '../seed'
import * as sel from '../selecteurs'
import type { EtatMDS } from '../types'

function jouer(depart: EtatMDS, ...actions: Action[]): EtatMDS {
  let courant = depart
  for (const action of actions) {
    const r = dispatch(courant, action)
    expect(r.ok, `${action.type} refusée : ${r.msg}`).toBe(true)
    courant = r.etat
  }
  return courant
}

describe('cycle de vie niveau 2', () => {
  it('EMPRUNTER → actif → RENDRE → rendu + photo → CONTROLER_PHOTO → conforme', () => {
    const emprunte = jouer(chargerSeed(), {
      type: 'EMPRUNTER',
      par: 'ines',
      materiel: 'souris-apple-01',
      forfaitAccepte: true,
    })
    expect(sel.pretOuvertDe(emprunte, 'souris-apple-01')!.statut).toBe('actif')
    expect(sel.materiel(emprunte, 'souris-apple-01').statut).toBe('emprunte')
    expect(sel.compteurs(emprunte).sortis).toBe(13)

    const rendu = jouer(emprunte, { type: 'RENDRE', par: 'ines', materiel: 'souris-apple-01', photo: true })
    expect(sel.materiel(rendu, 'souris-apple-01').statut).toBe('disponible')
    expect(sel.compteurs(rendu).sortis).toBe(12)
    expect(sel.compteurs(rendu).photos).toBe(4)

    const controle = jouer(rendu, { type: 'CONTROLER_PHOTO', par: 'lydia', materiel: 'souris-apple-01' })
    expect(sel.compteurs(controle).photos).toBe(3)
    expect(
      controle.photosDeRetour.find((p) => p.materiel === 'souris-apple-01' && p.statut === 'conforme'),
    ).toBeDefined()
  })
})

describe('cycle de vie niveau 1', () => {
  it('EMPRUNTER → remise_a_valider → VALIDER_REMISE → actif → RENDRE → retour_a_valider → VALIDER_RETOUR', () => {
    const depart = chargerSeed()
    expect(sel.compteurs(depart).aValider).toBe(4)

    const valide = jouer(depart, { type: 'VALIDER_REMISE', par: 'lydia', materiel: 'kit-r10-01' })
    expect(sel.pretOuvertDe(valide, 'kit-r10-01')!.statut).toBe('actif')
    expect(sel.compteurs(valide).aValider).toBe(3)

    const rapporte = jouer(valide, { type: 'RENDRE', par: 'ines', materiel: 'kit-r10-01', photo: true })
    expect(sel.pretOuvertDe(rapporte, 'kit-r10-01')!.statut).toBe('retour_a_valider')
    expect(sel.materiel(rapporte, 'kit-r10-01').statut).toBe('retour_a_valider')
    expect(sel.compteurs(rapporte).aValider).toBe(4)
    // Un N1 ne produit jamais de photo à contrôler : le contrôle est sur place.
    expect(sel.compteurs(rapporte).photos).toBe(3)

    const controle = jouer(rapporte, { type: 'VALIDER_RETOUR', par: 'lydia', materiel: 'kit-r10-01' })
    expect(sel.materiel(controle, 'kit-r10-01').statut).toBe('disponible')
    expect(sel.compteurs(controle).aValider).toBe(3)
    // Le kit est rentré, mais la remise validée en début de test avait fait sortir une
    // unité de plus : on revient donc au compte de départ.
    expect(sel.compteurs(controle).sortis).toBe(12)
  })
})

describe('soir et lendemain', () => {
  it('enchaîne 16h30, fin de journée et lendemain en gardant l’état cohérent', () => {
    const depart = chargerSeed()
    const suite = jouer(depart, { type: 'ALLER_A_16H30' }, { type: 'FIN_DE_JOURNEE' }, { type: 'LENDEMAIN' })

    expect(suite.horloge.maintenant).toBe('2026-09-18T08:00')
    // Les trois remises non validées ont été annulées, leur matériel est revenu en stock.
    expect(sel.remisesAValider(suite)).toHaveLength(0)
    for (const id of ['kit-r10-01', 'ronin-01', 'zoom-h5-01']) {
      expect(sel.materiel(suite, id).statut, id).toBe('disponible')
    }
    // Le retour N1 de Tom attend toujours l'équipe : la fin de journée ne l'annule pas.
    expect(sel.retoursAValider(suite)).toHaveLength(1)
    // Tous les emprunteurs qui n'ont rien rendu sont bloqués.
    expect(
      sel
        .personnesBloquees(suite)
        .map((p) => p.id)
        .sort(),
    ).toEqual(['diallo', 'ines', 'lea', 'roche', 'sarah', 'tom', 'yanis'])
  })

  it('refuse de terminer une journée déjà terminée', () => {
    const soir = jouer(chargerSeed(), { type: 'FIN_DE_JOURNEE' })
    const r = dispatch(soir, { type: 'FIN_DE_JOURNEE' })
    expect(r.ok).toBe(false)
    expect(r.msg).toBe('La journée est déjà terminée.')
    expect(r.etat).toBe(soir)
  })
})
