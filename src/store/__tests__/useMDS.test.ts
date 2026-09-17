// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { chargerSeed, selecteurs as sel } from '@/domain'
import { CLE_PERSISTANCE, useMDS } from '../useMDS'

const emprunt = {
  type: 'EMPRUNTER',
  par: 'ines',
  materiel: 'souris-apple-01',
  forfaitAccepte: true,
} as const

beforeEach(() => {
  localStorage.clear()
  useMDS.getState().reinitialiser()
})

describe('clé de persistance', () => {
  it('inclut la version du seed : un seed modifié réinitialise la démo', () => {
    expect(CLE_PERSISTANCE).toBe(`prets-mds/v${chargerSeed().version}`)
    expect(CLE_PERSISTANCE).toMatch(/^prets-mds\/v\d+$/)
  })
})

describe('exécution des actions', () => {
  it('joue une action et met à jour le toast', () => {
    const resultat = useMDS.getState().executer(emprunt)
    expect(resultat.ok).toBe(true)
    expect(useMDS.getState().dernierResultat?.ok).toBe(true)
    expect(useMDS.getState().dernierResultat?.msg).toContain('emprunte Souris Apple #01')
    expect(sel.pretsEnCoursDe(useMDS.getState().etat, 'ines')).toHaveLength(3)
  })

  it('garde l’état intact sur un refus, et n’ajoute rien à l’historique', () => {
    const avant = useMDS.getState().etat
    const resultat = useMDS.getState().executer({ ...emprunt, forfaitAccepte: false })
    expect(resultat.ok).toBe(false)
    expect(useMDS.getState().etat).toBe(avant)
    expect(useMDS.getState().peutAnnuler()).toBe(false)
    expect(useMDS.getState().dernierResultat?.regle).toBe('R03')
  })
})

describe('annulation', () => {
  it('restaure l’état exact d’avant la dernière action', () => {
    const avant = useMDS.getState().etat
    useMDS.getState().executer(emprunt)
    expect(useMDS.getState().etat).not.toBe(avant)

    expect(useMDS.getState().annuler()).toBe(true)
    expect(useMDS.getState().etat).toBe(avant)
    expect(useMDS.getState().peutAnnuler()).toBe(false)
  })

  it('annule aussi un changement d’horloge', () => {
    const avant = useMDS.getState().etat
    useMDS.getState().executer({ type: 'FIN_DE_JOURNEE' })
    expect(useMDS.getState().etat.horloge.maintenant).toBe('2026-09-17T18:00')

    useMDS.getState().annuler()
    expect(useMDS.getState().etat.horloge.maintenant).toBe('2026-09-17T10:15')
    expect(useMDS.getState().etat).toBe(avant)
  })

  it('remonte plusieurs actions d’affilée', () => {
    const depart = useMDS.getState().etat
    useMDS.getState().executer(emprunt)
    useMDS.getState().executer({ type: 'ALLER_A_16H30' })
    useMDS.getState().executer({ type: 'FIN_DE_JOURNEE' })

    expect(useMDS.getState().annuler()).toBe(true)
    expect(useMDS.getState().annuler()).toBe(true)
    expect(useMDS.getState().annuler()).toBe(true)
    expect(useMDS.getState().etat).toBe(depart)
    expect(useMDS.getState().annuler()).toBe(false)
  })
})

describe('réinitialisation et personas', () => {
  it('recharge le seed et vide l’historique', () => {
    useMDS.getState().executer(emprunt)
    useMDS.getState().choisirPersonaApp('yanis')

    useMDS.getState().reinitialiser()
    expect(useMDS.getState().personaApp).toBe('ines')
    expect(useMDS.getState().utilisateurBO).toBe('lydia')
    expect(useMDS.getState().peutAnnuler()).toBe(false)
    expect(sel.compteurs(useMDS.getState().etat).sortis).toBe(12)
  })

  it('change de persona sans toucher au domaine', () => {
    const avant = useMDS.getState().etat
    useMDS.getState().choisirPersonaApp('diallo')
    useMDS.getState().choisirUtilisateurBO('sandrine')
    expect(useMDS.getState().personaApp).toBe('diallo')
    expect(useMDS.getState().utilisateurBO).toBe('sandrine')
    expect(useMDS.getState().etat).toBe(avant)
  })
})

describe('persistance', () => {
  it('écrit dans localStorage sous la clé versionnée, sans l’historique ni le toast', () => {
    useMDS.getState().executer(emprunt)

    const brut = localStorage.getItem(CLE_PERSISTANCE)
    expect(brut).not.toBeNull()
    const enregistre = JSON.parse(brut!) as { state: Record<string, unknown> }
    expect(Object.keys(enregistre.state).sort()).toEqual(['etat', 'personaApp', 'utilisateurBO'])
  })

  it('retrouve l’état après une réhydratation, comme le ferait un autre onglet', async () => {
    useMDS.getState().executer(emprunt)
    const attendu = sel.compteurs(useMDS.getState().etat)

    await useMDS.persist.rehydrate()
    expect(sel.compteurs(useMDS.getState().etat)).toEqual(attendu)
  })
})
