import { describe, expect, it } from 'vitest'
import { chargerSeed, horloge, recalerSur, selecteurs as sel } from '@/domain'

/** Le seed est ancré au jeudi 17 septembre 2026, à 10:15. */
const ANCRAGE = '2026-09-17T10:15'

describe('recalage du jeu de données', () => {
  it('ne touche à rien quand la cible est le jour d’ancrage', () => {
    const etat = chargerSeed()
    const recale = recalerSur(etat, ANCRAGE)
    expect(recale.horloge.maintenant).toBe(ANCRAGE)
    expect(recale.prets).toEqual(etat.prets)
  })

  it('décale tous les instants du même nombre de jours, en gardant l’heure', () => {
    const etat = chargerSeed()
    const recale = recalerSur(etat, '2027-03-09T10:15')

    const avant = etat.prets.find((p) => p.id === 'P101')!
    const apres = recale.prets.find((p) => p.id === 'P101')!
    const jours = horloge.joursEcoules(avant.sortiLe!, apres.sortiLe!)

    expect(jours).toBe(horloge.joursEcoules(ANCRAGE, '2027-03-09T10:15'))
    // L'heure de la journée ne bouge pas : un prêt sorti à 9:20 le reste.
    expect(horloge.heure(apres.sortiLe!)).toBe(horloge.heure(avant.sortiLe!))
  })

  it('conserve toutes les situations du seed : compteurs et retards identiques', () => {
    const recale = recalerSur(chargerSeed(), '2027-03-09T10:15')
    const compteurs = sel.compteurs(recale)

    expect(compteurs.sortis).toBe(12)
    expect(compteurs.enRetard).toBe(1)
    expect(compteurs.aValider).toBe(4)
    expect(compteurs.photos).toBe(3)
    expect(compteurs.aRembourser).toEqual({ nombre: 2, montant: 94 })
    expect(compteurs.stockBas).toBe(1)
    expect(sel.personnesBloquees(recale)).toHaveLength(1)
  })

  it('recalcule le récap de 8h au lieu de décaler ses dates déjà mises en forme', () => {
    const recale = recalerSur(chargerSeed(), '2027-03-09T10:15')
    expect(recale.recap?.le).toBe('2027-03-09T08:00')
    expect(recale.recap?.lignes[0]).toBe('Mardi 9 mars · 8:00')
  })

  it('décale aussi les jours seuls, comme les exemptions de déblocage', () => {
    const etat = chargerSeed()
    const avecExemption = { ...etat, exemptions: { yanis: horloge.jourDe(ANCRAGE) } }
    const recale = recalerSur(avecExemption, '2027-03-09T10:15')
    expect(recale.exemptions['yanis']).toBe('2027-03-09')
  })
})
