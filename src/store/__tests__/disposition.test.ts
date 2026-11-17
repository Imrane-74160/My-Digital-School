/**
 * La disposition du tableau de bord : un défaut par rôle, puis des gestes de rangement
 * qui ne perdent ni ne dupliquent jamais une carte.
 */
import { describe, expect, it } from 'vitest'
import {
  basculerVisibilite,
  changerDeColonne,
  CLES_CARTES,
  deplacer,
  dispositionParDefaut,
  estParDefaut,
  normaliser,
  poser,
  zoneDe,
  type CleCarte,
  type Disposition,
} from '../disposition'

/** Toute disposition valide contient chaque carte une fois et une seule. */
const toutesLesCartes = (disposition: Disposition) =>
  [...disposition.principale, ...disposition.cote, ...disposition.masquees].sort()

const attendu = [...CLES_CARTES].sort()

describe('défaut par rôle', () => {
  it('ouvre sur les gestes du jour pour l’équipe, sur l’état du campus pour la direction', () => {
    expect(dispositionParDefaut('equipe').principale[0]).toBe('afaire')
    expect(dispositionParDefaut('direction').principale[0]).toBe('enCeMoment')
  })

  it('garde le récap et les consommables en colonne latérale dans les deux cas', () => {
    for (const role of ['equipe', 'direction'] as const) {
      expect([...dispositionParDefaut(role).cote].sort()).toEqual(['consommables', 'recap'])
    }
  })

  it('couvre les six cartes, sans trou ni doublon', () => {
    for (const role of ['equipe', 'direction'] as const) {
      expect(toutesLesCartes(dispositionParDefaut(role))).toEqual(attendu)
    }
  })

  it('un rôle hors équipe retombe sur la disposition de l’équipe', () => {
    expect(dispositionParDefaut('eleve')).toEqual(dispositionParDefaut('equipe'))
  })
})

describe('normalisation d’une disposition stockée', () => {
  it('sans rien de stocké, rend le défaut du rôle', () => {
    expect(normaliser(undefined, 'direction')).toEqual(dispositionParDefaut('direction'))
  })

  it('rattrape une carte ajoutée depuis la dernière visite', () => {
    const vieille = { principale: ['afaire'], cote: ['recap'], masquees: [] } as unknown as Disposition
    const remise = normaliser(vieille, 'equipe')
    expect(toutesLesCartes(remise)).toEqual(attendu)
    // Chaque nouveauté reprend la colonne que le rôle lui donne.
    expect(remise.cote).toContain('consommables')
    expect(remise.principale).toContain('enCeMoment')
  })

  it('jette une clé inconnue et déduplique', () => {
    const abimee = {
      principale: ['afaire', 'afaire', 'carte-fantome'],
      cote: ['afaire', 'recap'],
      masquees: [],
    } as unknown as Disposition
    const remise = normaliser(abimee, 'equipe')
    expect(toutesLesCartes(remise)).toEqual(attendu)
    expect(remise.principale.filter((cle) => cle === 'afaire')).toHaveLength(1)
  })
})

describe('gestes de rangement', () => {
  const depart = dispositionParDefaut('equipe')

  it('monter et descendre déplacent d’un cran dans la colonne', () => {
    const descendue = deplacer(depart, 'afaire', 1)
    expect(descendue.principale.indexOf('afaire')).toBe(1)
    expect(deplacer(descendue, 'afaire', -1)).toEqual(depart)
  })

  it('aux extrémités, rien ne bouge', () => {
    expect(deplacer(depart, 'afaire', -1)).toEqual(depart)
    const derniere = depart.principale[depart.principale.length - 1]!
    expect(deplacer(depart, derniere, 1)).toEqual(depart)
  })

  it('changer de colonne pose la carte en bas de l’autre colonne', () => {
    const passee = changerDeColonne(depart, 'afaire')
    expect(zoneDe(passee, 'afaire')).toBe('cote')
    expect(passee.cote[passee.cote.length - 1]).toBe('afaire')
    expect(toutesLesCartes(passee)).toEqual(attendu)
  })

  it('masquer puis réafficher ramène la carte dans sa colonne de rôle', () => {
    const masquee = basculerVisibilite(depart, 'recap', 'equipe')
    expect(zoneDe(masquee, 'recap')).toBe('masquee')
    const revenue = basculerVisibilite(masquee, 'recap', 'equipe')
    expect(zoneDe(revenue, 'recap')).toBe('cote')
    expect(toutesLesCartes(revenue)).toEqual(attendu)
  })

  it('poser accepte un index hors bornes sans perdre la carte', () => {
    const posee = poser(depart, 'recap', 'principale', 99)
    expect(posee.principale[posee.principale.length - 1]).toBe('recap')
    expect(toutesLesCartes(posee)).toEqual(attendu)
    expect(toutesLesCartes(poser(depart, 'recap', 'principale', -5))).toEqual(attendu)
  })

  it('aucun geste ne perd ni ne duplique une carte', () => {
    let courante = depart
    for (const cle of CLES_CARTES) {
      courante = changerDeColonne(courante, cle)
      courante = deplacer(courante, cle, 1)
      courante = basculerVisibilite(courante, cle, 'equipe')
      courante = basculerVisibilite(courante, cle, 'equipe')
      expect(toutesLesCartes(courante)).toEqual(attendu)
    }
  })

  it('reconnaît une disposition restée au défaut', () => {
    expect(estParDefaut(depart, 'equipe')).toBe(true)
    expect(estParDefaut(deplacer(depart, 'afaire', 1), 'equipe')).toBe(false)
    // Le défaut de l'équipe n'est pas celui de la direction.
    expect(estParDefaut(depart, 'direction')).toBe(false)
  })

  it('un geste sur une carte masquée ne la sort pas de l’ombre', () => {
    const masquee = basculerVisibilite(depart, 'recap', 'equipe')
    expect(deplacer(masquee, 'recap', -1)).toEqual(masquee)
    expect(changerDeColonne(masquee, 'recap')).toEqual(masquee)
  })

  it('les clés exportées couvrent exactement les six cartes attendues', () => {
    const cles: CleCarte[] = ['afaire', 'enCeMoment', 'retards', 'signalements', 'consommables', 'recap']
    expect([...CLES_CARTES].sort()).toEqual([...cles].sort())
  })
})
