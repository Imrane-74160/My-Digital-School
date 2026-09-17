import { describe, expect, it } from 'vitest'
import seedBrut from '../../../data/seed.json'
import { analyserSeed, chargerSeed, VERSION_SEED } from '../seed'
import * as sel from '../selecteurs'

const etat = chargerSeed()

/** Copie modifiable du JSON brut : les tests de validation partent du seed, pas de l'état analysé. */
const seedModifiable = () => structuredClone(seedBrut) as unknown as Record<string, unknown>

describe('chargement de data/seed.json', () => {
  it('se charge, se valide et expose sa version', () => {
    expect(etat.version).toBe(VERSION_SEED)
    expect(etat.version).toBeGreaterThanOrEqual(2)
    expect(etat.horloge.maintenant).toBe('2026-09-17T10:15')
  })

  it('contient le jeu de démo attendu', () => {
    expect(etat.personnes).toHaveLength(11)
    expect(etat.materiels).toHaveLength(38)
    expect(etat.prets).toHaveLength(28) // 27 d'origine + P110 rétabli
    expect(etat.prets.map((p) => p.id)).toContain('P110')
    expect(etat.salles).toHaveLength(5)
    expect(etat.consommables).toHaveLength(3)
  })

  it('porte la charte structurée en 7 articles titrés', () => {
    const { charte } = etat.reglages
    expect(charte.titre).toContain('Charte')
    expect(charte.articles.map((a) => a.titre)).toEqual([
      'Usage',
      'Retour',
      'Niveau 1',
      'Forfaits',
      'Blocage',
      'Classes',
      'Photos',
    ])
    for (const article of charte.articles) {
      expect(article.texte.length, article.titre).toBeGreaterThan(40)
    }
  })

  it('n’a plus aucun champ « emprunteur » sur les prêts', () => {
    for (const pret of etat.prets) {
      expect(Object.keys(pret)).not.toContain('emprunteur')
    }
  })

  it('indexe les inscriptions « Me prévenir » par type et non par unité', () => {
    for (const type of Object.keys(etat.prevenus)) {
      expect(etat.materiels.some((m) => m.type === type), `type inconnu : ${type}`).toBe(true)
    }
  })

  it('génère l’instantané du récap de 8h, au format du Figma', () => {
    expect(etat.recap).not.toBeNull()
    expect(etat.recap!.lignes).toEqual([
      'Jeudi 17 sept. · 8:00',
      '1 prêt en retard',
      '1 emprunteur bloqué',
      '3 photos à contrôler',
      '2 paiements · 94 €',
      '4 signalements ouverts',
      'Stock bas : stylos',
    ])
  })
})

describe('validation', () => {
  it('refuse un seed dont un prêt pointe sur un matériel inconnu', () => {
    const casse = seedModifiable()
    const prets = casse['prets'] as { materiel: string }[]
    prets[0]!.materiel = 'materiel-fantome'
    expect(() => analyserSeed(casse)).toThrow(/matériel inconnu/)
  })

  it('refuse un matériel qui porte à la fois « forfait » et « composants »', () => {
    const casse = seedModifiable()
    const materiels = casse['materiels'] as Record<string, unknown>[]
    const kit = materiels.find((m) => m['id'] === 'kit-r10-01')!
    kit['forfait'] = 1130
    expect(() => analyserSeed(casse)).toThrow(/soit « forfait », soit « composants »/)
  })

  it('refuse un prêt qui réintroduit le champ « emprunteur »', () => {
    const casse = seedModifiable()
    const prets = casse['prets'] as Record<string, unknown>[]
    prets[0]!['emprunteur'] = 'ines'
    expect(() => analyserSeed(casse)).toThrow(/« emprunteur » a été supprimé/)
  })

  it('refuse deux prêts ouverts sur le même matériel', () => {
    const casse = seedModifiable()
    const prets = casse['prets'] as Record<string, unknown>[]
    prets.push({ ...prets.find((p) => p['id'] === 'P107')!, id: 'P999' })
    expect(() => analyserSeed(casse)).toThrow(/prêts ouverts/)
  })

  it('refuse un statut de matériel hors des valeurs admises', () => {
    const casse = seedModifiable()
    const materiels = casse['materiels'] as Record<string, unknown>[]
    materiels[0]!['statut'] = 'en_vacances'
    expect(() => analyserSeed(casse)).toThrow(/hors des valeurs admises/)
  })
})

describe('indicateurs « En ce moment » sur le seed initial', () => {
  it('donne exactement les valeurs attendues', () => {
    expect(sel.compteurs(etat)).toEqual({
      sortis: 12,
      enRetard: 1,
      aValider: 4,
      photos: 3,
      aRembourser: { nombre: 2, montant: 94 },
      stockBas: 1,
    })
  })

  it('bloque Yanis, et lui seul', () => {
    expect(sel.personnesBloquees(etat).map((p) => p.id)).toEqual(['yanis'])
    expect(sel.raisonDeBlocage(etat, 'yanis')).toBe('PC de prêt #02 non rendu')
    expect(sel.raisonDeBlocage(etat, 'ines')).toBeNull()
    // Sarah et Léa doivent de l'argent, mais pour une casse, pas une perte : pas de blocage.
    expect(sel.raisonDeBlocage(etat, 'sarah')).toBeNull()
    expect(sel.raisonDeBlocage(etat, 'lea')).toBeNull()
  })

  it('retrouve les situations de docs/05', () => {
    expect(sel.signalementsOuverts(etat)).toHaveLength(4)
    expect(sel.sallesARegler(etat).map((s) => s.id)).toEqual(['103', '104', '201'])
    expect(sel.consommablesBas(etat).map((c) => c.nom)).toEqual(['Stylos'])
    expect(sel.remisesAValider(etat)).toHaveLength(3)
    expect(sel.retoursAValider(etat)).toHaveLength(1)
    // Import d'exemple : 4 lignes dont 1 en erreur.
    const lignes = etat.importExemple.inventaire.lignes
    expect(lignes).toHaveLength(4)
    expect(lignes.filter((l) => l.erreur)).toHaveLength(1)
    // Noah n'a jamais accepté la charte : sert à tester Connexion → Charte.
    expect(sel.personne(etat, 'noah').charteAcceptee).toBeNull()
  })

  it('compose la carte « À faire maintenant » comme arbitré', () => {
    const lignes = sel.lignesAFaire(etat)
    expect(lignes.map((l) => l.cle)).toEqual([
      'validations',
      'photos',
      'bloques',
      'paiements',
      'signalements',
    ])
    expect(lignes[0]!.titre).toBe('3 remises et 1 retour à valider au bureau')
    // 3 personnes en attente : on énumère les prénoms plutôt que les matériels.
    expect(lignes[0]!.detail).toBe('Inès, M. Diallo et Léa attendent au bureau')
    expect(lignes[3]!.titre).toBe('2 paiements à enregistrer · 94 €')
    expect(lignes[3]!.reserveASandrine).toBe(true)
  })

  it('donne un forfait unique par type de matériel', () => {
    const parType = sel.forfaitsParType(etat)
    expect(parType.find((f) => f.type === 'pc')?.forfait).toBe(450)
    expect(parType.find((f) => f.type === 'kit-canon-r10')?.forfait).toBe(1130)
    expect(parType.find((f) => f.type === 'casque-anglais')?.forfait).toBe(25)
    expect(sel.nomDuType(etat, 'casque-anglais')).toBe('Casque d’anglais')
    expect(sel.nomDuType(etat, 'kit-canon-r10')).toBe('Kit Canon R10')
  })

  it('calcule l’échéance de perte du PC de Yanis au vendredi 18h', () => {
    const pret = etat.prets.find((p) => p.id === 'P101')!
    expect(sel.echeanceDePerte(etat, pret)).toBe('2026-09-18T18:00')
  })
})
