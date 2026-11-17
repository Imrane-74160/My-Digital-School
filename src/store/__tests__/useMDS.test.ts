// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { chargerSeed, horloge, selecteurs as sel } from '@/domain'
import { CLE_PERSISTANCE, useMDS } from '../useMDS'

/**
 * Le store lit l'heure de la machine : les tests la figent pour rester déterministes.
 * 10:15 est l'heure d'ancrage du seed — le recalage doit donc tomber pile dessus.
 */
const MAINTENANT = new Date(2027, 2, 9, 10, 15, 0)
const AUJOURDHUI = '2027-03-09'

const emprunt = {
  type: 'EMPRUNTER',
  par: 'ines',
  materiel: 'souris-apple-01',
  forfaitAccepte: true,
} as const

/** Avance l'horloge de la machine, puis laisse le store rattraper les échéances. */
function allerA(heures: number, minutes: number, joursPlusTard = 0) {
  const quand = new Date(MAINTENANT)
  quand.setDate(quand.getDate() + joursPlusTard)
  quand.setHours(heures, minutes, 0, 0)
  vi.setSystemTime(quand)
  useMDS.getState().synchroniser()
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(MAINTENANT)
  localStorage.clear()
  useMDS.getState().reinitialiser()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('clé de persistance', () => {
  it('inclut la version du seed : un seed modifié repart d’un état propre', () => {
    expect(CLE_PERSISTANCE).toBe(`prets-mds/v${chargerSeed().version}`)
    expect(CLE_PERSISTANCE).toMatch(/^prets-mds\/v\d+$/)
  })
})

describe('recalage sur la date du jour', () => {
  it('ramène la situation du seed à aujourd’hui, écarts compris', () => {
    const etat = useMDS.getState().etat
    expect(etat.horloge.maintenant).toBe(`${AUJOURDHUI}T10:15`)
    // Les compteurs du seed sont inchangés : seul le calendrier a bougé.
    expect(sel.compteurs(etat).sortis).toBe(12)
    expect(sel.compteurs(etat).enRetard).toBe(1)
    // Le prêt en retard reste sorti la veille.
    const retard = sel.pretsEnRetard(etat)[0]!
    expect(horloge.jourDe(retard.sortiLe!)).toBe('2027-03-08')
  })
})

describe('exécution des actions', () => {
  it('joue une action et expose son message', () => {
    const resultat = useMDS.getState().executer(emprunt)
    expect(resultat.ok).toBe(true)
    expect(useMDS.getState().dernierResultat?.msg).toContain('emprunte Souris Apple #01')
    expect(sel.pretsEnCoursDe(useMDS.getState().etat, 'ines')).toHaveLength(3)
  })

  it('garde l’état intact sur un refus, avec le code de la règle', () => {
    const avant = useMDS.getState().etat
    const resultat = useMDS.getState().executer({ ...emprunt, forfaitAccepte: false })
    expect(resultat.ok).toBe(false)
    expect(useMDS.getState().etat).toBe(avant)
    expect(useMDS.getState().dernierResultat?.regle).toBe('R03')
  })
})

describe('connexion', () => {
  it('accepte l’identifiant seul comme l’adresse complète', () => {
    expect(useMDS.getState().connecter('app', 'ines.martin').ok).toBe(true)
    expect(useMDS.getState().sessionApp).toBe('ines')

    useMDS.getState().deconnecter('app')
    expect(useMDS.getState().connecter('app', 'Ines.Martin@my-digital-school.org').ok).toBe(true)
    expect(useMDS.getState().sessionApp).toBe('ines')
  })

  it('refuse un identifiant inconnu', () => {
    const resultat = useMDS.getState().connecter('app', 'personne.inconnue')
    expect(resultat.ok).toBe(false)
    expect(resultat.msg).toContain('Aucun compte')
    expect(useMDS.getState().sessionApp).toBeNull()
  })

  it('tient les deux espaces séparés : chaque rôle a le sien (R13)', () => {
    expect(useMDS.getState().connecter('app', 'lydia').ok).toBe(false)
    expect(useMDS.getState().connecter('admin', 'ines.martin').ok).toBe(false)

    expect(useMDS.getState().connecter('admin', 'lydia').ok).toBe(true)
    expect(useMDS.getState().connecter('app', 'ines.martin').ok).toBe(true)
    // Les deux sessions coexistent dans le même navigateur.
    expect(useMDS.getState().sessionApp).toBe('ines')
    expect(useMDS.getState().sessionAdmin).toBe('lydia')
  })

  it('déconnecte une surface sans toucher à l’autre', () => {
    useMDS.getState().connecter('app', 'ines.martin')
    useMDS.getState().connecter('admin', 'lydia')

    useMDS.getState().deconnecter('app')
    expect(useMDS.getState().sessionApp).toBeNull()
    expect(useMDS.getState().sessionAdmin).toBe('lydia')
  })
})

describe('échéances automatiques', () => {
  it('envoie le rappel quand 16h30 est franchi (R15)', () => {
    allerA(16, 45)
    const etat = useMDS.getState().etat
    expect(etat.horloge.maintenant).toBe(`${AUJOURDHUI}T16:45`)
    expect(etat.notifications.some((n) => n.texte.includes('Pense à rendre'))).toBe(true)
  })

  it('applique le blocage de 18h sans intervention (R10)', () => {
    expect(sel.raisonDeBlocage(useMDS.getState().etat, 'ines')).toBeNull()
    allerA(18, 30)
    expect(sel.raisonDeBlocage(useMDS.getState().etat, 'ines')).not.toBeNull()
  })

  it('rattrape toutes les échéances d’un coup au retour le lendemain', () => {
    allerA(9, 0, 1)
    const etat = useMDS.getState().etat
    expect(etat.horloge.maintenant).toBe('2027-03-10T09:00')
    // La journée de la veille a été close, et le récap du matin est daté d’aujourd’hui.
    expect(etat.recap?.le).toBe('2027-03-10T08:00')
    expect(etat.notifications.some((n) => n.texte.includes('Pense à rendre'))).toBe(true)
  })

  it('ne rejoue rien quand rien n’a été franchi', () => {
    const avant = useMDS.getState().etat
    allerA(11, 0)
    expect(useMDS.getState().etat.horloge.maintenant).toBe(`${AUJOURDHUI}T11:00`)
    expect(useMDS.getState().etat.notifications).toHaveLength(avant.notifications.length)
  })
})

describe('disposition du tableau de bord', () => {
  it('garde une disposition par compte, normalisée à l’enregistrement', () => {
    useMDS.getState().definirDisposition('lydia', { principale: ['recap'], cote: [], masquees: [] } as never)

    const lydia = useMDS.getState().dispositions['lydia']!
    expect(lydia.principale[0]).toBe('recap')
    // Les cartes absentes de l'enregistrement reviennent, jamais perdues.
    expect([...lydia.principale, ...lydia.cote, ...lydia.masquees]).toHaveLength(6)
    // Le rangement de Lydia ne touche pas celui de Sandrine.
    expect(useMDS.getState().dispositions['sandrine']).toBeUndefined()
  })

  it('ignore un compte inconnu', () => {
    useMDS.getState().definirDisposition('fantome', { principale: [], cote: [], masquees: [] } as never)
    expect(useMDS.getState().dispositions['fantome']).toBeUndefined()
  })
})

describe('persistance', () => {
  it('écrit l’état, les deux sessions et les dispositions, rien d’autre', () => {
    useMDS.getState().connecter('app', 'ines.martin')
    useMDS.getState().executer(emprunt)

    const brut = localStorage.getItem(CLE_PERSISTANCE)
    expect(brut).not.toBeNull()
    const enregistre = JSON.parse(brut!) as { state: Record<string, unknown> }
    expect(Object.keys(enregistre.state).sort()).toEqual([
      'dispositions',
      'etat',
      'sessionAdmin',
      'sessionApp',
    ])
  })

  it('retrouve l’état après une réhydratation, comme le ferait un autre onglet', async () => {
    useMDS.getState().executer(emprunt)
    const attendu = sel.compteurs(useMDS.getState().etat)

    await useMDS.persist.rehydrate()
    expect(sel.compteurs(useMDS.getState().etat)).toEqual(attendu)
  })
})
