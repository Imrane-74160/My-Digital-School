import { describe, expect, it } from 'vitest'
import * as h from '../horloge'
import type { Horloge } from '../types'

const MAINTENANT = '2026-09-17T10:15' // jeudi 17 septembre 2026, 10:15 — départ de la démo
const horloge = (maintenant: string): Horloge => ({
  maintenant,
  bureau: { ouverture: '08:00', fermeture: '18:00' },
  rappel: '16:30',
  recap: '08:00',
})

describe('calendrier', () => {
  it('retrouve le jour de la semaine de chaque date du jeu de démo', () => {
    expect(h.nomDuJour('2026-09-17')).toBe('jeudi')
    expect(h.nomDuJour('2026-09-16')).toBe('mercredi')
    expect(h.nomDuJour('2026-09-18')).toBe('vendredi')
    expect(h.nomDuJour('2026-09-14')).toBe('lundi')
    expect(h.nomDuJour('2026-09-15')).toBe('mardi')
    expect(h.nomDuJour('2026-09-11')).toBe('vendredi')
    expect(h.nomDuJour('2026-09-08')).toBe('mardi')
  })

  it('reste stable en allant et venant entre date et numéro de jour', () => {
    for (const jour of ['1970-01-01', '2000-02-29', '2026-09-17', '2026-12-31', '2027-03-01']) {
      expect(h.jourDepuisNumero(h.numeroDeJour(jour))).toBe(jour)
    }
  })

  it('compte les jours écoulés et franchit les mois', () => {
    expect(h.joursEcoules('2026-09-16T09:40', MAINTENANT)).toBe(1)
    expect(h.joursEcoules('2026-09-17T08:00', MAINTENANT)).toBe(0)
    expect(h.joursEcoules(MAINTENANT, '2026-09-19T18:00')).toBe(2)
    expect(h.ajouterJours('2026-09-30T10:15', 1)).toBe('2026-10-01T10:15')
    expect(h.ajouterJours('2026-12-31T23:00', 1)).toBe('2027-01-01T23:00')
  })

  it('compare les instants comme des chaînes, sans perdre l’ordre chronologique', () => {
    expect(h.avant('2026-09-17T09:20', '2026-09-17T10:15')).toBe(true)
    expect(h.avant('2026-09-09T23:59', '2026-09-10T00:00')).toBe(true)
    expect(h.memeJour('2026-09-17T08:00', '2026-09-17T18:00')).toBe(true)
    expect(h.memeJour('2026-09-16T23:59', '2026-09-17T00:00')).toBe(false)
  })
})

describe('bureau (R01)', () => {
  it('est ouvert de 8h à 18h', () => {
    expect(h.estBureauOuvert(horloge('2026-09-17T08:00'))).toBe(true)
    expect(h.estBureauOuvert(horloge(MAINTENANT))).toBe(true)
    expect(h.estBureauOuvert(horloge('2026-09-17T17:59'))).toBe(true)
    expect(h.estBureauOuvert(horloge('2026-09-17T18:00'))).toBe(false)
    expect(h.estBureauOuvert(horloge('2026-09-17T07:59'))).toBe(false)
  })

  it('distingue le soir de l’avant-ouverture', () => {
    expect(h.estLeSoir(horloge('2026-09-17T18:00'))).toBe(true)
    expect(h.estLeSoir(horloge('2026-09-17T07:00'))).toBe(false)
  })

  it('calcule la fermeture du jour et l’ouverture du lendemain', () => {
    expect(h.fermetureDuJour(horloge(MAINTENANT))).toBe('2026-09-17T18:00')
    expect(h.ouvertureDuLendemain(horloge(MAINTENANT))).toBe('2026-09-18T08:00')
  })
})

describe('rendus repris du Figma', () => {
  it('affiche les heures sans zéro devant, comme dans les cartes de prêt', () => {
    expect(h.heure('2026-09-17T09:20')).toBe('9:20')
    expect(h.heure('2026-09-17T10:12')).toBe('10:12')
    expect(h.heureRonde('2026-09-17T18:00')).toBe('18h')
    expect(h.heureRonde('2026-09-17T16:30')).toBe('16h30')
  })

  it('écrit les dates longues comme l’en-tête mobile et le récap', () => {
    expect(h.jourLong('2026-09-17')).toBe('jeudi 17 sept.')
    expect(h.jourLongCapitalise('2026-09-17')).toBe('Jeudi 17 sept.')
    expect(h.jourLong('2026-09-14')).toBe('lundi 14 sept.')
  })

  it('remplit la colonne « Quand » du tableau des signalements', () => {
    // Les quatre signalements ouverts du seed, tels que le Figma les affiche.
    expect(h.quand('2026-09-17T09:40', MAINTENANT)).toBe('9:40') // S2, aujourd'hui
    expect(h.quand('2026-09-16T15:20', MAINTENANT)).toBe('Hier') // S1
    expect(h.quand('2026-09-15T11:00', MAINTENANT)).toBe('Mardi') // S3
    expect(h.quand('2026-09-14T16:10', MAINTENANT)).toBe('Lundi') // S4
    expect(h.quand('2026-09-08T17:40', MAINTENANT)).toBe('mardi 8 sept.') // au-delà d'une semaine
  })

  it('écrit les échéances de la carte « Prêts en retard »', () => {
    expect(h.echeance('2026-09-16T18:00', MAINTENANT)).toBe('Hier 18h')
    expect(h.echeance('2026-09-18T18:00', MAINTENANT)).toBe('Ven. 18h')
    expect(h.echeance('2026-09-17T18:00', MAINTENANT)).toBe('Auj. 18h')
  })

  it('écrit les dates relatives des phrases', () => {
    expect(h.jourRelatif('2026-09-17T09:20', MAINTENANT)).toBe("aujourd'hui")
    expect(h.jourRelatif('2026-09-16T09:40', MAINTENANT)).toBe('hier')
    expect(h.jourRelatif('2026-09-14T16:10', MAINTENANT)).toBe('lundi')
  })
})
