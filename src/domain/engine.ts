/**
 * Moteur de règles : `dispatch(etat, action) -> Resultat`.
 *
 * Porté du moteur validé en ateliers (`reference/engine-prototype.js`), avec les écarts
 * arbitrés : horloge en dates réelles, « Me prévenir » par type, R03 en précondition,
 * perte à J+2 à la fermeture du bureau.
 *
 * Deux invariants tenus par ce module :
 * 1. **Immuable** : un refus renvoie *exactement* l'objet état reçu (même référence).
 *    Un succès renvoie un nouvel objet, l'original n'est jamais touché.
 * 2. **Déterministe** : aucune horloge système, aucun aléa. Les identifiants viennent
 *    du compteur `sequence` porté par l'état.
 */
import type { Action } from './actions'
import { euros, forfaitMateriel, manqueDeclare } from './forfait'
import * as h from './horloge'
import { REFUS } from './regles'
import * as sel from './selecteurs'
import type {
  CodeRegle,
  ComposantId,
  EtatMDS,
  Incident,
  Instant,
  Materiel,
  Notification,
  PersonneId,
  Pret,
  TypeIncident,
  TypeMateriel,
} from './types'

export type Resultat = {
  etat: EtatMDS
  ok: boolean
  msg: string
  regle: CodeRegle | null
  /** Notifications créées par cette action (bannière du téléphone, badge des alertes). */
  notifications: Notification[]
}

type Issue = { ok: boolean; msg: string; regle: CodeRegle | null }

const refus = (msg: string, regle: CodeRegle): Issue => ({ ok: false, msg, regle })
const succes = (msg: string, regle: CodeRegle | null = null): Issue => ({ ok: true, msg, regle })

// ─── Outils sur le brouillon ─────────────────────────────────────────────────

const idSuivant = (b: EtatMDS, prefixe: string): string => `${prefixe}${b.sequence++}`

function notifier(
  b: EtatMDS,
  pour: (PersonneId | 'equipe')[],
  texte: string,
  icone: string,
  regle?: CodeRegle,
): void {
  b.notifications.unshift({
    id: idSuivant(b, 'N'),
    pour,
    le: b.horloge.maintenant,
    icone,
    texte,
    lue: false,
    ...(regle === undefined ? {} : { regle }),
  })
}

/**
 * Élision devant un nom de lieu : « à l'armoire du studio », « au bureau de la pédagogie ».
 * Heuristique suffisante pour les deux lieux du campus ; à revoir si un lieu féminin
 * commençant par une consonne apparaît (« à la … »).
 */
function auLieu(lieu: string): string {
  const minuscule = lieu.charAt(0).toLowerCase() + lieu.slice(1)
  return /^[aeiouéèêh]/i.test(lieu) ? `à l’${minuscule}` : `au ${minuscule}`
}

const pourLaClasse = (pret: Pick<Pret, 'pourClasse'>): string =>
  pret.pourClasse ? ` pour la ${pret.pourClasse}` : ''

function ouvrirIncident(
  b: EtatMDS,
  options: {
    materiel: string
    responsable: PersonneId
    motif: string
    montant: number
    type: TypeIncident
    composant?: ComposantId
  },
): Incident {
  const incident: Incident = {
    id: idSuivant(b, 'I'),
    materiel: options.materiel,
    responsable: options.responsable,
    type: options.type,
    motif: options.motif,
    montant: options.montant,
    ...(options.composant === undefined ? {} : { composant: options.composant }),
    statut: 'a_rembourser',
    creeLe: b.horloge.maintenant,
  }
  b.incidents.unshift(incident)
  const nom = sel.materiel(b, options.materiel).nom
  notifier(
    b,
    [options.responsable],
    `${nom} : ${options.motif}. Forfait de ${euros(options.montant)} à rembourser.`,
    'Portefeuille',
    options.type === 'perte' ? 'R11' : 'R07',
  )
  return incident
}

/** Prévenir les inscrits du TYPE et vider la liste (R14). */
function prevenirLesInscrits(b: EtatMDS, unite: Materiel): void {
  const inscrits = b.prevenus[unite.type] ?? []
  if (inscrits.length === 0) return
  notifier(b, [...inscrits], `${unite.nom} est de retour. Le premier qui scanne le prend.`, 'Échange', 'R14')
  b.prevenus[unite.type] = []
}

// ─── Contrôles de droits ─────────────────────────────────────────────────────

function equipeSeulement(b: EtatMDS, par: PersonneId): Issue | null {
  const qui = sel.personne(b, par)
  if (sel.estEquipe(qui.role)) return null
  return refus(`${sel.prenom(qui)} n’a pas accès à cette action : réservée à l’équipe.`, 'R13')
}

function directionSeulement(b: EtatMDS, par: PersonneId): Issue | null {
  const qui = sel.personne(b, par)
  if (sel.estDirection(qui.role)) return null
  return refus(`${sel.prenom(qui)} ne peut pas faire ça : réservé à Sandrine (direction).`, 'R12')
}

// ─── Horloge (panneau de démo) ───────────────────────────────────────────────

function allerA(b: EtatMDS, instant: Instant): void {
  b.horloge.maintenant = instant
}

/** Rappel de 16h30 aux emprunteurs qui ont encore un prêt actif (R15). */
function envoyerLeRappel(b: EtatMDS): number {
  if (!b.reglages.rappel1630) return 0
  const parResponsable = new Map<PersonneId, string[]>()
  for (const pret of b.prets.filter((p) => p.statut === 'actif')) {
    const deja = parResponsable.get(pret.responsable) ?? []
    parResponsable.set(pret.responsable, [...deja, sel.materiel(b, pret.materiel).nom])
  }
  for (const [qui, noms] of parResponsable) {
    notifier(b, [qui], `16h30 · Pense à rendre ${noms.join(', ')} avant 18h.`, 'Horloge', 'R15')
  }
  return parResponsable.size
}

function finDeJournee(b: EtatMDS): { annulees: number; perdus: number } {
  allerA(b, h.fermetureDuJour(b.horloge))

  // Les remises jamais validées sont annulées : le matériel retourne en stock.
  let annulees = 0
  for (const pret of b.prets) {
    if (pret.statut !== 'remise_a_valider') continue
    pret.statut = 'annule'
    sel.materiel(b, pret.materiel).statut = 'disponible'
    annulees += 1
  }

  // R11 : toujours absent à J+2 à la fermeture → déclaré perdu, forfait complet dû.
  let perdus = 0
  for (const pret of b.prets) {
    if (pret.statut !== 'actif' || !pret.sortiLe) continue
    if (h.joursEcoules(pret.sortiLe, b.horloge.maintenant) < 2) continue
    pret.statut = 'perdu'
    const unite = sel.materiel(b, pret.materiel)
    unite.statut = 'perdu'
    ouvrirIncident(b, {
      materiel: unite.id,
      responsable: pret.responsable,
      motif: 'déclaré perdu à J+2',
      montant: pret.forfait,
      type: 'perte',
    })
    perdus += 1
  }

  return { annulees, perdus }
}

// ─── Application d'une action sur le brouillon ───────────────────────────────

function appliquer(b: EtatMDS, action: Action): Issue {
  switch (action.type) {
    case 'ACCEPTER_CHARTE': {
      const qui = sel.personne(b, action.par)
      qui.charteAcceptee = b.horloge.maintenant
      return succes(`${sel.prenom(qui)} accepte la charte d’utilisation.`, 'R03')
    }

    case 'EMPRUNTER': {
      const qui = sel.personne(b, action.par)
      const p = sel.prenom(qui)
      const unite = sel.materiel(b, action.materiel)

      if (!qui.charteAcceptee) return refus(REFUS.charteNonAcceptee, 'R03')
      if (!action.forfaitAccepte) return refus(REFUS.forfaitNonAccepte, 'R03')
      if (!h.estBureauOuvert(b.horloge)) {
        return refus(`Le bureau est fermé. ${p} pourra emprunter demain à 8h.`, 'R01')
      }
      const raison = sel.raisonDeBlocage(b, action.par)
      if (raison) return refus(`${p} ne peut pas emprunter : ${raison}.`, 'R10')
      if (action.pourClasse && qui.role !== 'intervenant') {
        return refus(`${p} ne peut pas emprunter « pour ma classe » : réservé aux intervenants.`, 'R09')
      }
      if (unite.reserveA && qui.role !== unite.reserveA) {
        return refus(`${unite.nom} est réservé aux intervenants.`, 'R09')
      }
      if (unite.statut !== 'disponible') {
        return refus(`${unite.nom} est indisponible. ${p} peut demander à être prévenu(e).`, 'R02')
      }

      const forfait = forfaitMateriel(unite)
      const pret: Pret = {
        id: idSuivant(b, 'P'),
        materiel: unite.id,
        responsable: action.par,
        pourClasse: action.pourClasse ?? null,
        statut: unite.niveau === 1 ? 'remise_a_valider' : 'actif',
        forfait,
        ...(unite.niveau === 1 ? { demandeLe: b.horloge.maintenant } : { sortiLe: b.horloge.maintenant }),
      }
      b.prets.unshift(pret)

      // Emprunter une unité du type retire la personne des inscrits de ce type (R14).
      const inscrits = b.prevenus[unite.type]
      if (inscrits) b.prevenus[unite.type] = inscrits.filter((id) => id !== action.par)

      const pour = pourLaClasse(pret)

      if (unite.niveau === 1) {
        unite.statut = 'remise_a_valider'
        notifier(
          b,
          [action.par],
          `Demande envoyée : présente-toi ${auLieu(unite.lieu)} pour ${unite.nom}.`,
          'Cloche',
          'R04',
        )
        notifier(b, ['equipe'], `Demande de remise : ${unite.nom} pour ${p}.`, 'Utilisateur validé', 'R04')
        return succes(
          `${p} demande ${unite.nom}${pour} et accepte le forfait de ${euros(forfait)}. L’équipe valide sur place.`,
          'R04',
        )
      }

      const photoEnAttente = sel.photoEnAttenteDe(b, unite.id)
      unite.statut = 'emprunte'
      notifier(
        b,
        [action.par],
        `Emprunt confirmé : ${unite.nom} est à rendre ce soir avant 18h.`,
        'Coche',
        'R05',
      )
      if (photoEnAttente) {
        return succes(
          `${p} emprunte ${unite.nom}${pour}. La photo du retour précédent n’est pas encore contrôlée, ce n’est pas bloquant.`,
          'R06',
        )
      }
      return succes(`${p} emprunte ${unite.nom}${pour} et accepte le forfait de ${euros(forfait)}.`, 'R03')
    }

    case 'VALIDER_REMISE': {
      const interdit = equipeSeulement(b, action.par)
      if (interdit) return interdit
      const unite = sel.materiel(b, action.materiel)
      const pret = sel.pretOuvertDe(b, unite.id)
      if (!pret || pret.statut !== 'remise_a_valider') {
        return refus(`Aucune remise à valider pour ${unite.nom}.`, 'R04')
      }
      pret.statut = 'actif'
      pret.sortiLe = b.horloge.maintenant
      pret.valideePar = action.par
      unite.statut = 'emprunte'
      notifier(
        b,
        [pret.responsable],
        `Remise validée : ${unite.nom} est à rendre ce soir avant 18h.`,
        'Coche',
        'R04',
      )
      const p = sel.prenom(sel.personne(b, action.par))
      const qui = sel.prenom(sel.personne(b, pret.responsable))
      return succes(`${p} vérifie ${unite.nom} et valide la remise à ${qui}.`, 'R04')
    }

    case 'RENDRE': {
      const unite = sel.materiel(b, action.materiel)
      const pret = sel.pretOuvertDe(b, unite.id)
      const p = sel.prenom(sel.personne(b, action.par))

      if (!pret) return refus(`${unite.nom} n’a pas de prêt en cours.`, 'R08')
      if (action.par !== pret.responsable) {
        const responsable = sel.prenom(sel.personne(b, pret.responsable))
        return refus(
          pret.pourClasse
            ? `Prêt pour la ${pret.pourClasse} : seul ${responsable} peut rendre ${unite.nom}.`
            : `Seul(e) ${responsable} peut rendre ${unite.nom}.`,
          'R08',
        )
      }
      if (pret.statut === 'remise_a_valider') {
        return refus(`La remise de ${unite.nom} n’est pas encore validée.`, 'R04')
      }
      if (pret.statut === 'retour_a_valider') {
        return refus(`Le retour de ${unite.nom} attend déjà l’équipe.`, 'R04')
      }
      if (!action.photo) {
        return refus(`Prends la photo pour valider le retour de ${unite.nom}.`, 'R05')
      }

      const manque = manqueDeclare(unite, action.manquant)
      const declaration = manque ? `signale « ${manque.libelle} »` : 'coche tout'

      if (unite.niveau === 1) {
        pret.statut = 'retour_a_valider'
        pret.retourDeclareLe = b.horloge.maintenant
        pret.declaration = manque ? manque.libelle : 'tout coché'
        if (action.manquant !== undefined) pret.manquant = action.manquant
        unite.statut = 'retour_a_valider'
        notifier(b, ['equipe'], `Retour à contrôler sur place : ${unite.nom} (${p}).`, 'Liste cochée', 'R04')
        return succes(
          `${p} rapporte ${unite.nom}, ${declaration} et prend la photo. L’équipe contrôle sur place.`,
          'R04',
        )
      }

      pret.statut = 'rendu'
      pret.renduLe = b.horloge.maintenant
      unite.statut = 'disponible'
      b.photosDeRetour.unshift({
        id: idSuivant(b, 'PH'),
        pret: pret.id,
        materiel: unite.id,
        responsable: pret.responsable,
        prisLe: b.horloge.maintenant,
        declaration: manque ? `Problème signalé : « ${manque.libelle} »` : 'Déclaré complet',
        ...(action.manquant === undefined ? {} : { composantSignale: action.manquant }),
        statut: 'a_controler',
      })
      prevenirLesInscrits(b, unite)
      return succes(
        `${p} rend ${unite.nom}, ${declaration} et prend la photo. Disponible tout de suite.`,
        'R05',
      )
    }

    case 'VALIDER_RETOUR': {
      const interdit = equipeSeulement(b, action.par)
      if (interdit) return interdit
      const unite = sel.materiel(b, action.materiel)
      const pret = sel.pretOuvertDe(b, unite.id)
      if (!pret || pret.statut !== 'retour_a_valider') {
        return refus(`Aucun retour à valider pour ${unite.nom}.`, 'R04')
      }
      const p = sel.prenom(sel.personne(b, action.par))
      const responsable = pret.responsable
      const manque = manqueDeclare(unite, action.manquant ?? pret.manquant)

      pret.statut = 'rendu'
      pret.renduLe = b.horloge.maintenant

      if (!manque) {
        unite.statut = 'disponible'
        prevenirLesInscrits(b, unite)
        return succes(`${p} contrôle ${unite.nom} sur place : conforme, remis en stock.`, 'R04')
      }

      unite.statut = 'anomalie'
      const composant = action.manquant ?? pret.manquant
      ouvrirIncident(b, {
        materiel: unite.id,
        responsable,
        motif: manque.libelle,
        montant: manque.montant,
        type: composant && unite.composants ? 'composant' : 'casse',
        ...(composant === undefined ? {} : { composant }),
      })
      const qui = sel.prenom(sel.personne(b, responsable))
      return succes(
        `${p} constate : ${manque.libelle}. ${qui} doit ${euros(manque.montant)}, pas le prix du kit.`,
        'R07',
      )
    }

    case 'CONTROLER_PHOTO': {
      const interdit = equipeSeulement(b, action.par)
      if (interdit) return interdit
      const unite = sel.materiel(b, action.materiel)
      if (unite.niveau === 1) {
        return refus(`${unite.nom} est de niveau 1 : contrôle sur place, jamais sur photo.`, 'R04')
      }
      const photo = sel.photoEnAttenteDe(b, unite.id)
      if (!photo) return refus(`Aucune photo à contrôler pour ${unite.nom}.`, 'R05')

      const p = sel.prenom(sel.personne(b, action.par))
      const responsable = sel.prenom(sel.personne(b, photo.responsable))
      const manque = manqueDeclare(unite, action.manquant)

      photo.controlePar = action.par
      photo.controleLe = b.horloge.maintenant

      if (!manque) {
        photo.statut = 'conforme'
        notifier(b, [photo.responsable], `Photo de retour conforme : ${unite.nom}. Merci !`, 'Image', 'R05')
        return succes(`${p} contrôle la photo de ${responsable} : ${unite.nom} conforme.`, 'R05')
      }

      photo.statut = 'probleme'
      // R06 : l'incident va au dernier responsable, jamais au nouvel emprunteur.
      const incident = ouvrirIncident(b, {
        materiel: unite.id,
        responsable: photo.responsable,
        motif: manque.libelle,
        montant: manque.montant,
        type: action.manquant && unite.composants ? 'composant' : 'casse',
        ...(action.manquant === undefined ? {} : { composant: action.manquant }),
      })
      photo.incident = incident.id

      if (unite.statut === 'disponible') {
        unite.statut = 'anomalie'
        return succes(
          `${p} voit sur la photo : ${manque.libelle}. ${responsable} doit ${euros(manque.montant)}, le matériel est retiré du prêt.`,
          'R05',
        )
      }
      const pretEnCours = sel.pretOuvertDe(b, unite.id)
      const emprunteur = pretEnCours ? sel.prenom(sel.personne(b, pretEnCours.responsable)) : '—'
      return succes(
        `${p} voit sur la photo : ${manque.libelle}. C’est ${responsable} qui doit ${euros(manque.montant)}. ${emprunteur} n’est pas mis(e) en cause.`,
        'R06',
      )
    }

    case 'PREVENEZ_MOI': {
      const qui = sel.personne(b, action.par)
      const p = sel.prenom(qui)
      const type: TypeMateriel = action.typeMateriel
      const unites = sel.unitesDuType(b, type)
      const nom = sel.nomDuType(b, type)

      if (sel.unitesDisponiblesDuType(b, type).length > 0) {
        return refus(`${nom} est déjà disponible.`, 'R14')
      }
      if (unites.every((u) => ['perdu', 'anomalie', 'hors_service'].includes(u.statut))) {
        return refus(`${nom} est retiré du prêt.`, 'R14')
      }
      const chezSoi = unites.some((u) => {
        const pret = sel.pretOuvertDe(b, u.id)
        return pret?.responsable === action.par
      })
      if (chezSoi) return refus(`${p} a déjà ${nom}.`, 'R14')
      if (sel.estInscritAuType(b, type, action.par)) return refus(`${p} est déjà inscrit(e).`, 'R14')

      b.prevenus[type] = [...(b.prevenus[type] ?? []), action.par]
      return succes(`${p} sera prévenu(e) dès que ${nom} revient.`, 'R14')
    }

    case 'SIGNALER': {
      const p = sel.prenom(sel.personne(b, action.par))
      b.signalements.unshift({
        id: idSuivant(b, 'S'),
        par: action.par,
        cible: action.cible,
        categorie: action.categorie,
        texte: action.texte ?? '',
        photo: action.photo ?? false,
        le: b.horloge.maintenant,
        statut: 'ouvert',
      })
      const quoi =
        action.cible.type === 'salle' ? `salle ${action.cible.id}` : sel.materiel(b, action.cible.id).nom
      notifier(b, ['equipe'], `Signalement de ${p} : ${action.categorie.toLowerCase()} · ${quoi}.`, 'Drapeau')
      return succes(`${p} signale « ${action.categorie} » sur ${quoi}. L’équipe est prévenue.`)
    }

    case 'TRAITER_SIGNALEMENT': {
      const interdit = equipeSeulement(b, action.par)
      if (interdit) return interdit
      const signalement = b.signalements.find((s) => s.id === action.signalement)
      if (!signalement) return refus(`Signalement inconnu : ${action.signalement}.`, 'R13')
      if (signalement.statut === 'traite') return refus('Ce signalement est déjà traité.', 'R13')
      const p = sel.prenom(sel.personne(b, action.par))
      signalement.statut = 'traite'
      signalement.traitePar = action.par
      signalement.traiteLe = b.horloge.maintenant
      notifier(b, [signalement.par], `Ton signalement a été pris en charge par ${p}.`, 'Coche')
      return succes(`${p} marque le signalement comme traité.`)
    }

    case 'RETIRER': {
      const interdit = equipeSeulement(b, action.par)
      if (interdit) return interdit
      const unite = sel.materiel(b, action.materiel)
      if (unite.statut !== 'disponible') {
        return refus(`${unite.nom} n’est pas en stock : impossible de le retirer maintenant.`, 'R13')
      }
      unite.statut = 'hors_service'
      const p = sel.prenom(sel.personne(b, action.par))
      return succes(`${p} retire ${unite.nom} du prêt.`, 'R13')
    }

    case 'REMETTRE': {
      const interdit = equipeSeulement(b, action.par)
      if (interdit) return interdit
      const unite = sel.materiel(b, action.materiel)
      if (!['anomalie', 'hors_service', 'perdu'].includes(unite.statut)) {
        return refus(`${unite.nom} est déjà en service.`, 'R13')
      }
      unite.statut = 'disponible'
      prevenirLesInscrits(b, unite)
      const p = sel.prenom(sel.personne(b, action.par))
      return succes(`${p} remet ${unite.nom} en service.`, 'R13')
    }

    case 'AJOUTER_MATERIEL': {
      const interdit = equipeSeulement(b, action.par)
      if (interdit) return interdit
      const { donnees } = action
      const base =
        donnees.nom
          .toLowerCase()
          .normalize('NFD')
          .replace(/[̀-ͯ]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') || 'materiel'
      let id = base
      let suffixe = 2
      while (b.materiels.some((m) => m.id === id)) id = `${base}-${suffixe++}`

      const categorie = b.categories[donnees.categorie]
      const unite: Materiel = {
        id,
        type: id,
        nom: donnees.nom,
        categorie: donnees.categorie,
        icone: donnees.icone ?? 'Colis',
        niveau: donnees.niveau,
        lieu: donnees.lieu,
        qr: `MDS-${id.toUpperCase()}`,
        statut: 'disponible',
        forfait: Math.max(0, donnees.forfait),
        ...(categorie?.reserveA === undefined ? {} : { reserveA: categorie.reserveA }),
      }
      b.materiels.push(unite)
      const p = sel.prenom(sel.personne(b, action.par))
      return succes(`${p} ajoute ${donnees.nom} à l’inventaire (QR ${unite.qr}).`, 'R13')
    }

    case 'MODIFIER_FORFAIT': {
      const interdit = directionSeulement(b, action.par)
      if (interdit) return interdit
      const valeur = Math.max(0, action.valeur)
      const unites = sel.unitesDuType(b, action.typeMateriel)
      if (unites.length === 0) return refus(`Type de matériel inconnu : ${action.typeMateriel}.`, 'R12')
      for (const unite of unites) {
        if (action.composant) {
          const composant = unite.composants?.find((c) => c.id === action.composant)
          if (composant) composant.forfait = valeur
        } else if (unite.composants) {
          return refus(
            `${unite.nom} est un kit : modifie le forfait d’un composant, pas celui du kit.`,
            'R07',
          )
        } else {
          unite.forfait = valeur
        }
      }
      const p = sel.prenom(sel.personne(b, action.par))
      const n = unites.length
      return succes(
        `${p} fixe le forfait à ${euros(valeur)} pour ${n} matériel${n > 1 ? 's' : ''} du même type.`,
        'R12',
      )
    }

    case 'AJUSTER_MONTANT': {
      const interdit = directionSeulement(b, action.par)
      if (interdit) return interdit
      const incident = b.incidents.find((i) => i.id === action.incident)
      if (!incident) return refus(`Incident inconnu : ${action.incident}.`, 'R12')
      const valeur = Math.max(0, action.valeur)
      if (valeur > incident.montant) {
        return refus('On peut seulement baisser un montant, jamais l’augmenter.', 'R12')
      }
      if (incident.montantInitial === undefined) incident.montantInitial = incident.montant
      incident.montant = valeur
      incident.ajustePar = action.par
      const p = sel.prenom(sel.personne(b, action.par))
      const qui = sel.prenom(sel.personne(b, incident.responsable))
      return succes(`${p} ajuste le montant dû par ${qui} à ${euros(valeur)}.`, 'R12')
    }

    case 'REMBOURSEMENT': {
      const interdit = directionSeulement(b, action.par)
      if (interdit) return interdit
      const incident = b.incidents.find((i) => i.id === action.incident)
      if (!incident) return refus(`Incident inconnu : ${action.incident}.`, 'R12')
      if (incident.statut === 'rembourse') return refus('Déjà enregistré.', 'R12')
      incident.statut = 'rembourse'
      incident.payeLe = b.horloge.maintenant
      notifier(
        b,
        [incident.responsable],
        `Paiement de ${euros(incident.montant)} enregistré. Merci !`,
        'Portefeuille',
        'R12',
      )
      const p = sel.prenom(sel.personne(b, action.par))
      const qui = sel.prenom(sel.personne(b, incident.responsable))
      return succes(`${p} enregistre le paiement de ${euros(incident.montant)} par ${qui}.`, 'R12')
    }

    case 'DEBLOQUER': {
      const interdit = equipeSeulement(b, action.par)
      if (interdit) return interdit
      const qui = sel.personne(b, action.personne)
      if (!sel.raisonDeBlocage(b, action.personne)) {
        return refus(`${sel.prenom(qui)} n’est pas bloqué(e).`, 'R16')
      }
      b.exemptions[action.personne] = h.jourDe(b.horloge.maintenant)
      const p = sel.prenom(sel.personne(b, action.par))
      return succes(`${p} débloque ${sel.prenom(qui)} pour aujourd’hui.`, 'R16')
    }

    case 'COMPTAGE': {
      const interdit = equipeSeulement(b, action.par)
      if (interdit) return interdit
      const bas: string[] = []
      const quantites: Record<string, number> = {}
      for (const consommable of b.consommables) {
        const saisie = action.quantites[consommable.id]
        if (saisie === undefined) continue
        consommable.quantite = Math.max(0, saisie)
        consommable.dernierComptage = b.horloge.maintenant
        quantites[consommable.id] = consommable.quantite
        if (consommable.quantite < consommable.seuil) bas.push(consommable.nom)
      }
      b.comptages.unshift({ le: b.horloge.maintenant, par: action.par, quantites })
      if (bas.length > 0) {
        notifier(b, ['equipe'], `Stock bas : ${bas.join(', ')}. Pensez au réassort.`, 'Alerte')
      }
      const p = sel.prenom(sel.personne(b, action.par))
      return succes(
        `${p} enregistre le comptage de la semaine.${
          bas.length > 0 ? ` Sous le seuil : ${bas.join(', ')}.` : ' Tout est au-dessus du seuil.'
        }`,
        'R13',
      )
    }

    case 'VERIFIER_SALLE': {
      const interdit = equipeSeulement(b, action.par)
      if (interdit) return interdit
      const salle = b.salles.find((s) => s.id === action.salle)
      if (!salle) return refus(`Salle inconnue : ${action.salle}.`, 'R13')
      salle.presents = Math.max(0, action.presents)
      salle.verifieeLe = b.horloge.maintenant
      const p = sel.prenom(sel.personne(b, action.par))
      return succes(
        `${p} vérifie la salle ${salle.id} : ${salle.presents}/${salle.attendus} ventilateur${
          salle.attendus > 1 ? 's' : ''
        }.`,
        'R13',
      )
    }

    case 'IMPORT_INVENTAIRE': {
      const interdit = equipeSeulement(b, action.par)
      if (interdit) return interdit
      // Les lignes en erreur sont ignorées, jamais importées.
      const valides = action.lignes.filter((l) => !l.erreur && l.niveau !== null)
      for (const ligne of valides) {
        appliquer(b, {
          type: 'AJOUTER_MATERIEL',
          par: action.par,
          donnees: {
            nom: ligne.nom,
            categorie: ligne.categorie,
            niveau: ligne.niveau as 1 | 2,
            lieu: ligne.lieu,
            forfait: ligne.forfait,
            icone: ligne.icone,
          },
        })
      }
      const p = sel.prenom(sel.personne(b, action.par))
      const ignorees = action.lignes.length - valides.length
      return succes(
        `${p} importe ${valides.length} matériel${valides.length > 1 ? 's' : ''} depuis Calc.${
          ignorees > 0
            ? ` ${ignorees} ligne${ignorees > 1 ? 's' : ''} en erreur ignorée${ignorees > 1 ? 's' : ''}.`
            : ''
        }`,
        'R13',
      )
    }

    case 'IMPORT_CLASSES': {
      const interdit = equipeSeulement(b, action.par)
      if (interdit) return interdit
      b.classes = [...action.classes]
      const p = sel.prenom(sel.personne(b, action.par))
      return succes(`${p} importe ${action.classes.length} classes depuis Calc.`, 'R13')
    }

    case 'MODIFIER_CHARTE': {
      const interdit = directionSeulement(b, action.par)
      if (interdit) return interdit
      if (action.articles.length === 0) return refus('La charte doit garder au moins un article.', 'R12')
      if (action.titre !== undefined) b.reglages.charte.titre = action.titre
      b.reglages.charte.articles = action.articles.map((a) => ({ ...a }))
      b.reglages.charteModifieeLe = b.horloge.maintenant
      const p = sel.prenom(sel.personne(b, action.par))
      return succes(`${p} met à jour la charte d’utilisation.`, 'R12')
    }

    case 'REGLAGE': {
      const interdit = equipeSeulement(b, action.par)
      if (interdit) return interdit
      b.reglages[action.cle] = action.valeur
      const p = sel.prenom(sel.personne(b, action.par))
      const quoi = action.cle === 'rappel1630' ? 'le rappel de 16h30' : 'le récap de 8h'
      return succes(`${p} ${action.valeur ? 'active' : 'désactive'} ${quoi}.`, 'R15')
    }

    case 'ALLER_A_16H30': {
      const cible = h.aHeure(b.horloge.maintenant, b.horloge.rappel)
      if (!h.avant(b.horloge.maintenant, cible)) {
        return refus('Il est déjà 16h30 passées.', 'R15')
      }
      allerA(b, cible)
      const prevenus = envoyerLeRappel(b)
      return succes(
        prevenus > 0
          ? `16h30. ${prevenus} emprunteur${prevenus > 1 ? 's' : ''} rappelé${prevenus > 1 ? 's' : ''}.`
          : b.reglages.rappel1630
            ? '16h30. Personne n’a de prêt à rendre.'
            : '16h30. Le rappel est désactivé.',
        'R15',
      )
    }

    case 'FIN_DE_JOURNEE': {
      if (h.estLeSoir(b.horloge)) return refus('La journée est déjà terminée.', 'R15')
      const { annulees, perdus } = finDeJournee(b)
      const bloquees = sel.personnesBloquees(b).length
      const morceaux = [`Fin de la journée, 18h.`]
      if (bloquees > 0) {
        morceaux.push(
          `${bloquees} emprunteur${bloquees > 1 ? 's' : ''} n’${bloquees > 1 ? 'ont' : 'a'} pas tout rendu : blocage appliqué.`,
        )
      } else {
        morceaux.push('Tout a été rendu.')
      }
      if (annulees > 0) {
        morceaux.push(
          `${annulees} remise${annulees > 1 ? 's' : ''} non validée${annulees > 1 ? 's' : ''} annulée${annulees > 1 ? 's' : ''}.`,
        )
      }
      if (perdus > 0) {
        morceaux.push(
          `${perdus} matériel${perdus > 1 ? 's' : ''} déclaré${perdus > 1 ? 's' : ''} perdu${perdus > 1 ? 's' : ''}.`,
        )
      }
      return succes(morceaux.join(' '), perdus > 0 ? 'R11' : 'R10')
    }

    case 'LENDEMAIN': {
      // Passer au lendemain implique de clore la journée en cours.
      if (!h.estLeSoir(b.horloge)) finDeJournee(b)
      allerA(b, h.ouvertureDuLendemain(b.horloge))

      // Les déblocages ne valaient que pour la journée écoulée (R16).
      const aujourdhui = h.jourDe(b.horloge.maintenant)
      for (const [qui, jour] of Object.entries(b.exemptions)) {
        if (jour < aujourdhui) delete b.exemptions[qui]
      }

      if (b.reglages.recap8h) {
        b.recap = sel.construireRecap(b, h.aHeure(b.horloge.maintenant, b.horloge.recap))
        notifier(b, ['equipe'], 'Récap de 8h', 'Enveloppe', 'R15')
      }
      return succes(`${h.jourLongCapitalise(b.horloge.maintenant)}, 8h. Le bureau ouvre.`, 'R15')
    }
  }
}

// ─── dispatch ────────────────────────────────────────────────────────────────

/**
 * Applique une action. Sur refus, `etat` est **l'objet reçu**, inchangé.
 * Sur succès, `etat` est un nouvel objet et l'original n'a pas bougé.
 */
export function dispatch(etat: EtatMDS, action: Action): Resultat {
  // Blocages avant l'action, pour notifier les changements (R10, R16).
  const avant = new Map<PersonneId, string | null>(
    etat.personnes.map((p) => [p.id, sel.raisonDeBlocage(etat, p.id)]),
  )

  const brouillon = structuredClone(etat)
  const depart = brouillon.notifications.length

  let issue: Issue
  try {
    issue = appliquer(brouillon, action)
  } catch (erreur) {
    return {
      etat,
      ok: false,
      msg: erreur instanceof Error ? erreur.message : 'Action impossible.',
      regle: null,
      notifications: [],
    }
  }

  if (!issue.ok) {
    return { etat, ok: false, msg: issue.msg, regle: issue.regle, notifications: [] }
  }

  for (const personne of brouillon.personnes) {
    const raisonAvant = avant.get(personne.id) ?? null
    const raisonApres = sel.raisonDeBlocage(brouillon, personne.id)
    if (!raisonAvant && raisonApres) {
      notifier(
        brouillon,
        [personne.id],
        `Tes emprunts sont bloqués : ${raisonApres}. Rapporte-le au bureau.`,
        'Cadenas',
        'R10',
      )
    }
    if (raisonAvant && !raisonApres && action.type !== 'DEBLOQUER') {
      notifier(brouillon, [personne.id], 'Tu peux de nouveau emprunter.', 'Cadenas ouvert', 'R10')
    }
  }

  const creees = brouillon.notifications.length - depart
  return {
    etat: brouillon,
    ok: true,
    msg: issue.msg,
    regle: issue.regle,
    notifications: brouillon.notifications.slice(0, Math.max(0, creees)),
  }
}
