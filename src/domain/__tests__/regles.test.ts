/**
 * Un test au moins par règle R01 → R16, avec le cas accepté ET le cas refusé.
 * Les refus vérifient le code de règle renvoyé, pas seulement l'échec.
 */
import { beforeEach, describe, expect, it } from 'vitest'
import { dispatch } from '../engine'
import type { Action } from '../actions'
import { chargerSeed } from '../seed'
import * as sel from '../selecteurs'
import type { EtatMDS } from '../types'

let etat: EtatMDS
beforeEach(() => {
  etat = chargerSeed()
})

/** Enchaîne des actions en exigeant que chacune passe ; renvoie l'état final. */
function jouer(depart: EtatMDS, ...actions: Action[]): EtatMDS {
  let courant = depart
  for (const action of actions) {
    const r = dispatch(courant, action)
    expect(r.ok, `${action.type} a été refusée : ${r.msg}`).toBe(true)
    courant = r.etat
  }
  return courant
}

const emprunter = (par: string, materiel: string, pourClasse?: string): Action => ({
  type: 'EMPRUNTER',
  par,
  materiel,
  forfaitAccepte: true,
  ...(pourClasse === undefined ? {} : { pourClasse }),
})

const textesPour = (e: EtatMDS, qui: string) =>
  e.notifications.filter((n) => n.pour.includes(qui)).map((n) => n.texte)

// ─── R01 · bureau ────────────────────────────────────────────────────────────

describe('R01 · on emprunte seulement quand le bureau est ouvert', () => {
  it('accepte un emprunt à 10:15 et le refuse après la fermeture', () => {
    expect(dispatch(etat, emprunter('ines', 'souris-apple-01')).ok).toBe(true)

    const soir = jouer(etat, { type: 'FIN_DE_JOURNEE' })
    const r = dispatch(soir, emprunter('tom', 'souris-apple-01'))
    expect(r.ok).toBe(false)
    expect(r.regle).toBe('R01')
    expect(r.msg).toBe('Le bureau est fermé. Tom pourra emprunter demain à 8h.')
  })
})

// ─── R02 · disponibilité ─────────────────────────────────────────────────────

describe('R02 · pas de réservation, premier arrivé premier servi', () => {
  it('refuse d’emprunter une unité déjà sortie', () => {
    const r = dispatch(etat, emprunter('ines', 'casque-02'))
    expect(r.ok).toBe(false)
    expect(r.regle).toBe('R02')
    expect(r.msg).toContain('est indisponible')
  })
})

// ─── R03 · forfait et charte ─────────────────────────────────────────────────

describe('R03 · forfait accepté et charte signée', () => {
  it('refuse un emprunt sans acceptation du forfait', () => {
    const r = dispatch(etat, {
      type: 'EMPRUNTER',
      par: 'ines',
      materiel: 'souris-apple-01',
      forfaitAccepte: false,
    })
    expect(r.ok).toBe(false)
    expect(r.regle).toBe('R03')
    expect(r.msg).toBe('Accepte le forfait pour emprunter.')
  })

  it('refuse un emprunt tant que la charte n’est pas acceptée', () => {
    expect(sel.personne(etat, 'noah').charteAcceptee).toBeNull()
    const r = dispatch(etat, emprunter('noah', 'souris-apple-01'))
    expect(r.ok).toBe(false)
    expect(r.regle).toBe('R03')
    expect(r.msg).toBe('Accepte la charte avant ton premier emprunt.')
  })

  it('laisse emprunter une fois la charte acceptée', () => {
    const apres = jouer(etat, { type: 'ACCEPTER_CHARTE', par: 'noah' }, emprunter('noah', 'souris-apple-01'))
    expect(sel.personne(apres, 'noah').charteAcceptee).toBe('2026-09-17T10:15')
    expect(sel.pretsEnCoursDe(apres, 'noah')).toHaveLength(1)
  })
})

// ─── R04 · niveau 1 validé sur place ─────────────────────────────────────────

describe('R04 · niveau 1, remise et retour validés sur place', () => {
  it('met un emprunt N1 en attente de remise, puis l’active à la validation', () => {
    const demande = jouer(etat, emprunter('ines', 'trepied-01'))
    const pret = sel.pretOuvertDe(demande, 'trepied-01')!
    expect(pret.statut).toBe('remise_a_valider')
    expect(sel.materiel(demande, 'trepied-01').statut).toBe('remise_a_valider')
    expect(textesPour(demande, 'ines')).toContain(
      'Demande envoyée : présente-toi à l’armoire du studio pour Trépied LeoFoto.',
    )

    const validee = jouer(demande, { type: 'VALIDER_REMISE', par: 'lydia', materiel: 'trepied-01' })
    expect(sel.pretOuvertDe(validee, 'trepied-01')!.statut).toBe('actif')
    expect(textesPour(validee, 'ines')).toContain(
      'Remise validée : Trépied LeoFoto est à rendre ce soir avant 18h.',
    )
  })

  it('refuse de rendre un N1 dont la remise n’est pas encore validée', () => {
    const r = dispatch(etat, { type: 'RENDRE', par: 'ines', materiel: 'kit-r10-01', photo: true })
    expect(r.ok).toBe(false)
    expect(r.regle).toBe('R04')
    expect(r.msg).toContain('n’est pas encore validée')
  })

  it('refuse de contrôler sur photo un matériel de niveau 1', () => {
    const r = dispatch(etat, { type: 'CONTROLER_PHOTO', par: 'lydia', materiel: 'micro-hf-01' })
    expect(r.ok).toBe(false)
    expect(r.regle).toBe('R04')
    expect(r.msg).toContain('contrôle sur place, jamais sur photo')
  })
})

// ─── R05 · niveau 2 avec photo ───────────────────────────────────────────────

describe('R05 · niveau 2, retour avec photo et contrôle plus tard', () => {
  it('exige la photo pour valider le retour', () => {
    const r = dispatch(etat, { type: 'RENDRE', par: 'ines', materiel: 'casque-03', photo: false })
    expect(r.ok).toBe(false)
    expect(r.regle).toBe('R05')
    expect(r.msg).toContain('Prends la photo')
  })

  it('rend le matériel disponible tout de suite et met la photo en attente', () => {
    const apres = jouer(etat, { type: 'RENDRE', par: 'ines', materiel: 'casque-03', photo: true })
    expect(sel.materiel(apres, 'casque-03').statut).toBe('disponible')
    const photo = sel.photoEnAttenteDe(apres, 'casque-03')!
    expect(photo.statut).toBe('a_controler')
    expect(photo.responsable).toBe('ines')

    const controlee = jouer(apres, { type: 'CONTROLER_PHOTO', par: 'lydia', materiel: 'casque-03' })
    expect(sel.photoEnAttenteDe(controlee, 'casque-03')).toBeUndefined()
    expect(textesPour(controlee, 'ines')).toContain(
      'Photo de retour conforme : Casque d’anglais #03. Merci !',
    )
  })
})

// ─── R06 · réemprunt avant contrôle ──────────────────────────────────────────

describe('R06 · le matériel peut repartir avant le contrôle, la photo fait foi', () => {
  it('met l’incident au nom du dernier responsable, pas du nouvel emprunteur', () => {
    // Situation du seed : Léa a rendu le casque #02, Tom l'a repris, la photo attend.
    const photo = etat.photosDeRetour.find((p) => p.materiel === 'casque-02')!
    expect(photo.responsable).toBe('lea')
    expect(photo.reempruntePar).toBe('tom')
    expect(sel.pretOuvertDe(etat, 'casque-02')!.responsable).toBe('tom')

    const apres = jouer(etat, {
      type: 'CONTROLER_PHOTO',
      par: 'lydia',
      materiel: 'casque-02',
      manquant: 'abime',
    })
    const incident = apres.incidents[0]!
    expect(incident.responsable).toBe('lea')
    expect(incident.montant).toBe(25)
    // Tom garde son prêt : il n'est pas mis en cause.
    expect(sel.pretOuvertDe(apres, 'casque-02')!.responsable).toBe('tom')
    expect(sel.pretOuvertDe(apres, 'casque-02')!.statut).toBe('actif')
  })
})

// ─── R07 · forfait du composant ──────────────────────────────────────────────

describe('R07 · composant manquant, on doit le forfait du composant', () => {
  it('facture 45 € pour une batterie, pas 1 130 € pour le kit', () => {
    const apres = jouer(
      etat,
      { type: 'VALIDER_REMISE', par: 'lydia', materiel: 'kit-r10-01' },
      { type: 'RENDRE', par: 'ines', materiel: 'kit-r10-01', manquant: 'batterie2', photo: true },
      { type: 'VALIDER_RETOUR', par: 'lydia', materiel: 'kit-r10-01', manquant: 'batterie2' },
    )
    const incident = apres.incidents[0]!
    expect(incident.montant).toBe(45)
    expect(incident.montant).not.toBe(1130)
    expect(incident.responsable).toBe('ines')
    expect(incident.type).toBe('composant')
    expect(incident.composant).toBe('batterie2')
    expect(sel.materiel(apres, 'kit-r10-01').statut).toBe('anomalie')
  })

  it('facture le forfait complet quand rien n’identifie un composant', () => {
    const apres = jouer(etat, {
      type: 'VALIDER_RETOUR',
      par: 'lydia',
      materiel: 'micro-hf-01',
      manquant: 'abime',
    })
    expect(apres.incidents[0]!.montant).toBe(150) // 80 + 70
  })
})

// ─── R08 · seul le responsable rend ──────────────────────────────────────────

describe('R08 · seul le responsable du prêt fait le retour', () => {
  it('refuse le retour par une autre personne', () => {
    const r = dispatch(etat, { type: 'RENDRE', par: 'tom', materiel: 'casque-03', photo: true })
    expect(r.ok).toBe(false)
    expect(r.regle).toBe('R08')
    expect(r.msg).toBe('Seul(e) Inès peut rendre Casque d’anglais #03.')
  })

  it('nomme la classe quand le prêt est un prêt de classe', () => {
    const r = dispatch(etat, { type: 'RENDRE', par: 'ines', materiel: 'souris-01', photo: true })
    expect(r.ok).toBe(false)
    expect(r.regle).toBe('R08')
    expect(r.msg).toBe('Prêt pour la M1 : seul Mme Roche peut rendre Souris filaire #01.')
  })
})

// ─── R09 · pour ma classe et boîtes intervenant ──────────────────────────────

describe('R09 · « Pour ma classe » et boîtes réservés aux intervenants', () => {
  it('refuse « pour ma classe » à une élève', () => {
    const r = dispatch(etat, emprunter('ines', 'souris-apple-01', 'B3'))
    expect(r.ok).toBe(false)
    expect(r.regle).toBe('R09')
    expect(r.msg).toContain('réservé aux intervenants')
  })

  it('refuse une boîte intervenant à une élève et l’accorde à un intervenant', () => {
    const refuse = dispatch(etat, emprunter('ines', 'boite-01'))
    expect(refuse.ok).toBe(false)
    expect(refuse.regle).toBe('R09')

    const apres = jouer(etat, emprunter('diallo', 'boite-01', 'B3'))
    const pret = sel.pretOuvertDe(apres, 'boite-01')!
    expect(pret.responsable).toBe('diallo')
    expect(pret.pourClasse).toBe('B3')
  })
})

// ─── R10 · blocage le soir ───────────────────────────────────────────────────

describe('R10 · non rendu à 18h, emprunts bloqués', () => {
  it('bloque Inès à la fin de la journée et refuse son emprunt le lendemain', () => {
    expect(sel.raisonDeBlocage(etat, 'ines')).toBeNull()

    const soir = jouer(etat, { type: 'FIN_DE_JOURNEE' })
    expect(sel.raisonDeBlocage(soir, 'ines')).toBe('Casque d’anglais #03 non rendu')
    expect(textesPour(soir, 'ines')).toContain(
      'Tes emprunts sont bloqués : Casque d’anglais #03 non rendu. Rapporte-le au bureau.',
    )

    const lendemain = jouer(soir, { type: 'LENDEMAIN' })
    const r = dispatch(lendemain, emprunter('ines', 'souris-apple-01'))
    expect(r.ok).toBe(false)
    expect(r.regle).toBe('R10')
    expect(r.msg).toContain('ne peut pas emprunter')
  })

  it('annule les remises non validées à la fin de la journée', () => {
    const soir = jouer(etat, { type: 'FIN_DE_JOURNEE' })
    expect(soir.prets.find((p) => p.id === 'P102')!.statut).toBe('annule')
    expect(sel.materiel(soir, 'kit-r10-01').statut).toBe('disponible')
    expect(sel.remisesAValider(soir)).toHaveLength(0)
  })
})

// ─── R11 · perte à J+2 ───────────────────────────────────────────────────────

describe('R11 · toujours absent à J+2 à 18h, déclaré perdu', () => {
  it('déclare le PC de Yanis perdu le vendredi à 18h, avec un forfait de 450 €', () => {
    const vendrediMatin = jouer(etat, { type: 'FIN_DE_JOURNEE' }, { type: 'LENDEMAIN' })
    expect(vendrediMatin.horloge.maintenant).toBe('2026-09-18T08:00')
    // Pas encore perdu : l'échéance est à la fermeture du bureau.
    expect(vendrediMatin.prets.find((p) => p.id === 'P101')!.statut).toBe('actif')

    const vendrediSoir = jouer(vendrediMatin, { type: 'FIN_DE_JOURNEE' })
    const pret = vendrediSoir.prets.find((p) => p.id === 'P101')!
    expect(pret.statut).toBe('perdu')
    expect(sel.materiel(vendrediSoir, 'pc-02').statut).toBe('perdu')

    const perte = vendrediSoir.incidents.find((i) => i.type === 'perte')!
    expect(perte.responsable).toBe('yanis')
    expect(perte.montant).toBe(450)
    // Yanis reste bloqué tant que la perte n'est pas remboursée.
    expect(sel.raisonDeBlocage(vendrediSoir, 'yanis')).toContain('perte non remboursée')
  })
})

// ─── R12 · argent réservé à Sandrine ────────────────────────────────────────

describe('R12 · forfaits, ajustements et paiements réservés à Sandrine', () => {
  it('refuse un paiement enregistré par l’équipe', () => {
    const r = dispatch(etat, { type: 'REMBOURSEMENT', par: 'lydia', incident: 'I1' })
    expect(r.ok).toBe(false)
    expect(r.regle).toBe('R12')
    expect(r.msg).toBe('Lydia ne peut pas faire ça : réservé à Sandrine (direction).')
  })

  it('refuse une hausse de montant et accepte une baisse', () => {
    const hausse = dispatch(etat, { type: 'AJUSTER_MONTANT', par: 'sandrine', incident: 'I1', valeur: 90 })
    expect(hausse.ok).toBe(false)
    expect(hausse.regle).toBe('R12')
    expect(hausse.msg).toBe('On peut seulement baisser un montant, jamais l’augmenter.')

    const baisse = jouer(etat, { type: 'AJUSTER_MONTANT', par: 'sandrine', incident: 'I1', valeur: 60 })
    const incident = baisse.incidents.find((i) => i.id === 'I1')!
    expect(incident.montant).toBe(60)
    expect(incident.montantInitial).toBe(79) // le montant d'origine est conservé
    expect(incident.ajustePar).toBe('sandrine')
  })

  it('applique un changement de forfait à tout le type', () => {
    const apres = jouer(etat, {
      type: 'MODIFIER_FORFAIT',
      par: 'sandrine',
      typeMateriel: 'casque-anglais',
      valeur: 40,
    })
    const casques = sel.unitesDuType(apres, 'casque-anglais')
    expect(casques).toHaveLength(6)
    for (const casque of casques) expect(casque.forfait).toBe(40)
  })

  it('enregistre un paiement et lève le blocage d’une perte remboursée', () => {
    const vendrediSoir = jouer(etat, { type: 'FIN_DE_JOURNEE' }, { type: 'LENDEMAIN' }, { type: 'FIN_DE_JOURNEE' })
    const perte = vendrediSoir.incidents.find((i) => i.type === 'perte')!
    expect(sel.raisonDeBlocage(vendrediSoir, 'yanis')).not.toBeNull()

    const paye = jouer(vendrediSoir, { type: 'REMBOURSEMENT', par: 'sandrine', incident: perte.id })
    expect(paye.incidents.find((i) => i.id === perte.id)!.statut).toBe('rembourse')
    expect(sel.raisonDeBlocage(paye, 'yanis')).toBeNull()
    expect(textesPour(paye, 'yanis')).toContain('Tu peux de nouveau emprunter.')
  })
})

// ─── R13 · actions réservées à l’équipe ─────────────────────────────────────

describe('R13 · valider, contrôler et gérer réservés à l’équipe', () => {
  it('refuse une validation de remise faite par une élève', () => {
    const r = dispatch(etat, { type: 'VALIDER_REMISE', par: 'ines', materiel: 'kit-r10-01' })
    expect(r.ok).toBe(false)
    expect(r.regle).toBe('R13')
    expect(r.msg).toBe('Inès n’a pas accès à cette action : réservée à l’équipe.')
  })

  it('accepte la même action faite par l’équipe', () => {
    expect(dispatch(etat, { type: 'VALIDER_REMISE', par: 'cyrianne', materiel: 'kit-r10-01' }).ok).toBe(true)
  })
})

// ─── R14 · me prévenir, par type ────────────────────────────────────────────

describe('R14 · « Me prévenir » s’inscrit sur un type', () => {
  it('prévient tous les inscrits du type au retour d’une unité, puis vide la liste', () => {
    expect(sel.unitesDisponiblesDuType(etat, 'casque-anglais')).toHaveLength(0)

    const inscrits = jouer(
      etat,
      { type: 'PREVENEZ_MOI', par: 'lea', typeMateriel: 'casque-anglais' },
      { type: 'PREVENEZ_MOI', par: 'sarah', typeMateriel: 'casque-anglais' },
    )
    expect(sel.inscritsAuType(inscrits, 'casque-anglais')).toEqual(['lea', 'sarah'])

    const rendu = jouer(inscrits, { type: 'RENDRE', par: 'tom', materiel: 'casque-02', photo: true })
    const attendu = 'Casque d’anglais #02 est de retour. Le premier qui scanne le prend.'
    expect(textesPour(rendu, 'lea')).toContain(attendu)
    expect(textesPour(rendu, 'sarah')).toContain(attendu)
    expect(sel.inscritsAuType(rendu, 'casque-anglais')).toEqual([])
  })

  it('refuse l’inscription quand une unité du type est disponible', () => {
    const r = dispatch(etat, { type: 'PREVENEZ_MOI', par: 'lea', typeMateriel: 'souris-apple' })
    expect(r.ok).toBe(false)
    expect(r.regle).toBe('R14')
    expect(r.msg).toBe('Souris Apple est déjà disponible.')
  })

  it('refuse une seconde inscription de la même personne', () => {
    const inscrite = jouer(etat, { type: 'PREVENEZ_MOI', par: 'lea', typeMateriel: 'casque-anglais' })
    const r = dispatch(inscrite, { type: 'PREVENEZ_MOI', par: 'lea', typeMateriel: 'casque-anglais' })
    expect(r.ok).toBe(false)
    expect(r.regle).toBe('R14')
    expect(r.msg).toBe('Léa est déjà inscrit(e).')
  })

  it('retire de la liste celui qui emprunte une unité du type', () => {
    const inscrite = jouer(
      etat,
      { type: 'PREVENEZ_MOI', par: 'lea', typeMateriel: 'casque-anglais' },
      { type: 'PREVENEZ_MOI', par: 'sarah', typeMateriel: 'casque-anglais' },
      { type: 'RENDRE', par: 'tom', materiel: 'casque-02', photo: true },
      emprunter('sarah', 'casque-02'),
    )
    expect(sel.inscritsAuType(inscrite, 'casque-anglais')).toEqual([])
    expect(sel.pretOuvertDe(inscrite, 'casque-02')!.responsable).toBe('sarah')
  })
})

// ─── R15 · rappel de 16h30 et récap de 8h ───────────────────────────────────

describe('R15 · rappel de 16h30 aux emprunteurs, récap de 8h à l’équipe', () => {
  it('envoie le rappel de 16h30 aux personnes qui ont encore un prêt actif', () => {
    const rappel = jouer(etat, { type: 'ALLER_A_16H30' })
    expect(rappel.horloge.maintenant).toBe('2026-09-17T16:30')
    expect(textesPour(rappel, 'ines')).toContain(
      '16h30 · Pense à rendre Casque d’anglais #03 avant 18h.',
    )
  })

  it('n’envoie plus rien quand le rappel est coupé dans les réglages', () => {
    const regle = jouer(etat, { type: 'REGLAGE', par: 'lydia', cle: 'rappel1630', valeur: false })
    const r = dispatch(regle, { type: 'ALLER_A_16H30' })
    expect(r.ok).toBe(true)
    // Le seed porte déjà un rappel de 16h30 daté d'hier : on ne regarde que ce que
    // cette action vient de créer.
    expect(r.notifications).toEqual([])
    expect(r.msg).toBe('16h30. Le rappel est désactivé.')
  })

  it('régénère l’instantané du récap au passage au lendemain', () => {
    const lendemain = jouer(etat, { type: 'LENDEMAIN' })
    expect(lendemain.recap!.lignes[0]).toBe('Vendredi 18 sept. · 8:00')
    expect(textesPour(lendemain, 'equipe')).toContain('Récap de 8h')
  })

  it('refuse de revenir à 16h30 quand l’heure est passée', () => {
    const soir = jouer(etat, { type: 'ALLER_A_16H30' })
    const r = dispatch(soir, { type: 'ALLER_A_16H30' })
    expect(r.ok).toBe(false)
    expect(r.regle).toBe('R15')
  })
})

// ─── R16 · déblocage pour la journée ────────────────────────────────────────

describe('R16 · l’équipe débloque pour la journée uniquement', () => {
  it('laisse emprunter le jour du déblocage, plus le lendemain', () => {
    const debloque = jouer(
      etat,
      { type: 'FIN_DE_JOURNEE' },
      { type: 'LENDEMAIN' },
      { type: 'DEBLOQUER', par: 'lydia', personne: 'ines' },
    )
    expect(sel.raisonDeBlocage(debloque, 'ines')).toBeNull()
    expect(sel.estDebloqueeAujourdhui(debloque, 'ines')).toBe(true)
    expect(dispatch(debloque, emprunter('ines', 'souris-apple-01')).ok).toBe(true)

    // L'exemption ne vaut que pour la journée : elle expire au passage au lendemain.
    const surlendemain = jouer(debloque, { type: 'FIN_DE_JOURNEE' }, { type: 'LENDEMAIN' })
    expect(surlendemain.exemptions['ines']).toBeUndefined()
    expect(sel.raisonDeBlocage(surlendemain, 'ines')).not.toBeNull()
  })

  it('refuse de débloquer une personne qui ne l’est pas', () => {
    const r = dispatch(etat, { type: 'DEBLOQUER', par: 'lydia', personne: 'tom' })
    expect(r.ok).toBe(false)
    expect(r.regle).toBe('R16')
    expect(r.msg).toBe('Tom n’est pas bloqué(e).')
  })
})
