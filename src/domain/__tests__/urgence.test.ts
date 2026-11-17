/**
 * L'ordre de la carte « À faire maintenant » est calculé, pas écrit.
 *
 * Le barème est documenté dans `selecteurs.ts` : un euro en jeu vaut un point, et les
 * autres facteurs (blocage, attente au bureau, contrôle différé, signalement) se
 * comparent à de l'argent. Ces tests vérifient que l'ordre bouge quand l'état bouge.
 */
import { describe, expect, it } from 'vitest'
import { chargerSeed } from '../seed'
import * as sel from '../selecteurs'
import type { EtatMDS } from '../types'

const etat = chargerSeed()

const cles = (lignes: sel.LigneAFaire[]) => lignes.map((ligne) => ligne.cle)
const ligne = (etatCourant: EtatMDS, cle: sel.CleLigneAFaire, pour?: 'equipe' | 'direction') =>
  sel.lignesAFaire(etatCourant, pour).find((candidate) => candidate.cle === cle)

describe('urgence des lignes « À faire maintenant »', () => {
  it('classe par urgence décroissante, jamais dans un ordre figé', () => {
    const lignes = sel.lignesAFaire(etat)
    const urgences = lignes.map((l) => l.urgence)
    expect(lignes.length).toBeGreaterThan(2)
    expect([...urgences].sort((a, b) => b - a)).toEqual(urgences)
  })

  it('met l’argent qui bascule en perte avant une file de routine', () => {
    const lignes = cles(sel.lignesAFaire(etat))
    expect(lignes[0]).toBe('bloques')
    expect(lignes.indexOf('bloques')).toBeLessThan(lignes.indexOf('photos'))
  })

  it('chaque ligne explique pourquoi elle est là', () => {
    for (const l of sel.lignesAFaire(etat)) {
      expect(l.pourquoi.length).toBeGreaterThan(0)
      expect(l.urgence).toBeGreaterThan(0)
    }
  })

  it('l’attente au bureau alourdit la file minute par minute', () => {
    const tot = ligne(etat, 'validations')!
    const tard = ligne(
      { ...etat, horloge: { ...etat.horloge, maintenant: '2026-09-17T12:15' } },
      'validations',
    )!
    expect(tard.urgence).toBeGreaterThan(tot.urgence)
    expect(tard.pourquoi).toContain('2 h')
  })

  it('l’attente plafonne à 4 h : au-delà, la personne est repartie', () => {
    const a = ligne({ ...etat, horloge: { ...etat.horloge, maintenant: '2026-09-17T14:30' } }, 'validations')!
    const b = ligne({ ...etat, horloge: { ...etat.horloge, maintenant: '2026-09-17T17:30' } }, 'validations')!
    expect(b.urgence).toBe(a.urgence)
  })

  it('un gros forfait dû dépasse une file de validations', () => {
    const gonfle: EtatMDS = {
      ...etat,
      incidents: etat.incidents.map((incident) =>
        incident.statut === 'a_rembourser' ? { ...incident, montant: 450 } : incident,
      ),
    }
    const lignes = cles(sel.lignesAFaire(gonfle, 'direction'))
    expect(lignes.indexOf('paiements')).toBeLessThan(lignes.indexOf('validations'))
  })

  it('une ligne verrouillée par R12 passe en dernier pour l’équipe, pas pour la direction', () => {
    const gonfle: EtatMDS = {
      ...etat,
      incidents: etat.incidents.map((incident) =>
        incident.statut === 'a_rembourser' ? { ...incident, montant: 450 } : incident,
      ),
    }
    expect(cles(sel.lignesAFaire(gonfle, 'direction'))[0]).toBe('paiements')
    const vueEquipe = cles(sel.lignesAFaire(gonfle, 'equipe'))
    expect(vueEquipe[vueEquipe.length - 1]).toBe('paiements')
  })

  it('sans rôle, l’urgence seule décide : le verrou ne déplace rien', () => {
    const lignes = sel.lignesAFaire(etat)
    const urgences = lignes.map((l) => l.urgence)
    expect([...urgences].sort((a, b) => b - a)).toEqual(urgences)
  })

  it('un contrôle photo qui traîne depuis la veille pèse plus qu’un contrôle de l’instant', () => {
    const matin = ligne(etat, 'photos')!
    const frais: EtatMDS = {
      ...etat,
      photosDeRetour: etat.photosDeRetour.map((photo) =>
        photo.statut === 'a_controler' ? { ...photo, prisLe: etat.horloge.maintenant } : photo,
      ),
    }
    expect(ligne(frais, 'photos')!.urgence).toBeLessThan(matin.urgence)
  })
})
