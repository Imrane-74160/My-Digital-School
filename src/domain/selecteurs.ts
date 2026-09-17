/**
 * Sélecteurs purs : tout ce qui s'affiche se DÉDUIT de l'état, jamais codé en dur
 * (cf. `docs/05-donnees-demo.md`, section « Règles de calcul »).
 */
import { euros, forfaitMateriel } from './forfait'
import * as h from './horloge'
import type {
  ClasseId,
  Consommable,
  EtatMDS,
  Incident,
  Instant,
  Materiel,
  MaterielId,
  Personne,
  PersonneId,
  PhotoDeRetour,
  Pret,
  Recap,
  Role,
  Salle,
  Signalement,
  TypeMateriel,
} from './types'

// ─── Accès ───────────────────────────────────────────────────────────────────

export function personne(etat: EtatMDS, id: PersonneId): Personne {
  const trouvee = etat.personnes.find((p) => p.id === id)
  if (!trouvee) throw new Error(`Personne inconnue : ${id}`)
  return trouvee
}

export function materiel(etat: EtatMDS, id: MaterielId): Materiel {
  const trouve = etat.materiels.find((m) => m.id === id)
  if (!trouve) throw new Error(`Matériel inconnu : ${id}`)
  return trouve
}

/** Prénom court pour les messages, ou le nom à défaut (« Cyrianne », « M. Diallo »). */
export const prenom = (p: Personne): string => p.prenom ?? p.nom

export const estEquipe = (role: Role): boolean => role === 'equipe' || role === 'direction'
export const estDirection = (role: Role): boolean => role === 'direction'

// ─── Prêts ───────────────────────────────────────────────────────────────────

export const STATUTS_OUVERTS = ['remise_a_valider', 'actif', 'retour_a_valider'] as const

export const estOuvert = (pret: Pret): boolean => (STATUTS_OUVERTS as readonly string[]).includes(pret.statut)

export const pretsOuverts = (etat: EtatMDS): Pret[] => etat.prets.filter(estOuvert)

/** Le prêt en cours d'un matériel, s'il y en a un. Un matériel n'a jamais deux prêts ouverts. */
export const pretOuvertDe = (etat: EtatMDS, id: MaterielId): Pret | undefined =>
  etat.prets.find((p) => p.materiel === id && estOuvert(p))

export const pretsDe = (etat: EtatMDS, id: PersonneId): Pret[] =>
  etat.prets.filter((p) => p.responsable === id)

/** Prêts ouverts d'une personne : les actifs d'abord, comme sur l'accueil du Figma. */
export const pretsEnCoursDe = (etat: EtatMDS, id: PersonneId): Pret[] => {
  const rang = (pret: Pret) => (pret.statut === 'actif' ? 0 : pret.statut === 'retour_a_valider' ? 1 : 2)
  return pretsDe(etat, id)
    .filter(estOuvert)
    .sort((a, b) => rang(a) - rang(b))
}

export const historiqueDe = (etat: EtatMDS, id: PersonneId): Pret[] =>
  pretsDe(etat, id)
    .filter((p) => !estOuvert(p))
    .sort((a, b) => (b.renduLe ?? b.sortiLe ?? '').localeCompare(a.renduLe ?? a.sortiLe ?? ''))

/**
 * Un prêt est en retard quand il est encore `actif` et que la fermeture du bureau
 * de son jour de sortie est passée (R10).
 */
export function estEnRetard(etat: EtatMDS, pret: Pret): boolean {
  if (pret.statut !== 'actif' || !pret.sortiLe) return false
  const fermeture = h.aHeure(pret.sortiLe, etat.horloge.bureau.fermeture)
  // « Non rendu À 18h » : l'échéance est atteinte dès la fermeture, pas une minute après.
  return !h.apres(fermeture, etat.horloge.maintenant)
}

export const pretsEnRetard = (etat: EtatMDS): Pret[] => etat.prets.filter((p) => estEnRetard(etat, p))

/** Échéance de perte : J+2 à la fermeture du bureau (R11, arbitré d'après le Figma). */
export function echeanceDePerte(etat: EtatMDS, pret: Pret): Instant | null {
  if (!pret.sortiLe) return null
  return h.aHeure(h.ajouterJours(pret.sortiLe, 2), etat.horloge.bureau.fermeture)
}

// ─── Blocage (R10, R11, R16) ─────────────────────────────────────────────────

/**
 * Pourquoi cette personne ne peut pas emprunter, ou `null` si elle peut.
 * L'équipe n'est jamais bloquée ; un déblocage manuel ne vaut que pour la journée (R16).
 */
export function raisonDeBlocage(etat: EtatMDS, id: PersonneId): string | null {
  const qui = etat.personnes.find((p) => p.id === id)
  if (!qui || estEquipe(qui.role)) return null
  if (etat.exemptions[id] === h.jourDe(etat.horloge.maintenant)) return null

  const retards = pretsDe(etat, id).filter((p) => estEnRetard(etat, p))
  if (retards.length > 0) {
    return `${retards.map((p) => materiel(etat, p.materiel).nom).join(', ')} non rendu`
  }

  const pertes = etat.incidents.filter(
    (i) => i.responsable === id && i.type === 'perte' && i.statut === 'a_rembourser',
  )
  if (pertes.length > 0) {
    return `perte non remboursée (${pertes.map((i) => materiel(etat, i.materiel).nom).join(', ')})`
  }
  return null
}

export const personnesBloquees = (etat: EtatMDS): Personne[] =>
  etat.personnes.filter((p) => raisonDeBlocage(etat, p.id) !== null)

export const estDebloqueeAujourdhui = (etat: EtatMDS, id: PersonneId): boolean =>
  etat.exemptions[id] === h.jourDe(etat.horloge.maintenant)

/**
 * Élision devant un nom de lieu : « à l'armoire du studio », « au bureau de la pédagogie ».
 * Heuristique suffisante pour les deux lieux du campus.
 */
export function auLieu(lieu: string): string {
  const minuscule = lieu.charAt(0).toLowerCase() + lieu.slice(1)
  return /^[aeiouéèêh]/i.test(lieu) ? `à l’${minuscule}` : `au ${minuscule}`
}

// ─── Catalogue et disponibilité (R02, R14) ───────────────────────────────────

/** Nom du type tel qu'affiché dans le catalogue mobile : le nom de l'unité sans son « #NN ». */
export function nomDuType(etat: EtatMDS, type: TypeMateriel): string {
  const premier = etat.materiels.find((m) => m.type === type)
  if (!premier) throw new Error(`Type de matériel inconnu : ${type}`)
  return premier.nom.replace(/\s+#\d+$/, '')
}

export const unitesDuType = (etat: EtatMDS, type: TypeMateriel): Materiel[] =>
  etat.materiels.filter((m) => m.type === type)

export const unitesDisponiblesDuType = (etat: EtatMDS, type: TypeMateriel): Materiel[] =>
  unitesDuType(etat, type).filter((m) => m.statut === 'disponible')

/** Un forfait par type : « Un changement s'applique à tout le type ». */
export function forfaitsParType(etat: EtatMDS): { type: TypeMateriel; nom: string; forfait: number }[] {
  const types = [...new Set(etat.materiels.map((m) => m.type))]
  return types.map((type) => {
    const premier = unitesDuType(etat, type)[0]!
    return { type, nom: nomDuType(etat, type), forfait: forfaitMateriel(premier) }
  })
}

export const inscritsAuType = (etat: EtatMDS, type: TypeMateriel): PersonneId[] => etat.prevenus[type] ?? []

export const estInscritAuType = (etat: EtatMDS, type: TypeMateriel, id: PersonneId): boolean =>
  inscritsAuType(etat, type).includes(id)

/** Classes proposées dans « Pour ma classe » : la liste globale (mise à jour par ▶ IMPORT_CLASSES). */
export const classesProposees = (etat: EtatMDS): ClasseId[] => etat.classes

// ─── Contrôles en attente ────────────────────────────────────────────────────

export const remisesAValider = (etat: EtatMDS): Pret[] =>
  etat.prets.filter((p) => p.statut === 'remise_a_valider')

export const retoursAValider = (etat: EtatMDS): Pret[] =>
  etat.prets.filter((p) => p.statut === 'retour_a_valider')

export const photosAControler = (etat: EtatMDS): PhotoDeRetour[] =>
  etat.photosDeRetour.filter((p) => p.statut === 'a_controler')

export const photoEnAttenteDe = (etat: EtatMDS, id: MaterielId): PhotoDeRetour | undefined =>
  etat.photosDeRetour.find((p) => p.materiel === id && p.statut === 'a_controler')

export const incidentsARembourser = (etat: EtatMDS): Incident[] =>
  etat.incidents.filter((i) => i.statut === 'a_rembourser')

export const signalementsOuverts = (etat: EtatMDS): Signalement[] =>
  etat.signalements.filter((s) => s.statut === 'ouvert')

export const consommablesBas = (etat: EtatMDS): Consommable[] =>
  etat.consommables.filter((c) => c.quantite < c.seuil)

export const sallesARegler = (etat: EtatMDS): Salle[] => etat.salles.filter((s) => s.presents !== s.attendus)

// ─── Indicateurs « En ce moment » ────────────────────────────────────────────

export type Compteurs = {
  /** Prêts `actif` + `retour_a_valider`. */
  sortis: number
  enRetard: number
  /** Remises + retours N1 en attente (arbitré : 4 sur le seed initial). */
  aValider: number
  photos: number
  aRembourser: { nombre: number; montant: number }
  stockBas: number
}

export function compteurs(etat: EtatMDS): Compteurs {
  const aRembourser = incidentsARembourser(etat)
  return {
    sortis: etat.prets.filter((p) => p.statut === 'actif' || p.statut === 'retour_a_valider').length,
    enRetard: pretsEnRetard(etat).length,
    aValider: remisesAValider(etat).length + retoursAValider(etat).length,
    photos: photosAControler(etat).length,
    aRembourser: {
      nombre: aRembourser.length,
      montant: aRembourser.reduce((somme, i) => somme + i.montant, 0),
    },
    stockBas: consommablesBas(etat).length,
  }
}

// ─── Accords en français ─────────────────────────────────────────────────────

const s = (nombre: number) => (nombre > 1 ? 's' : '')

/** « 3 remises », « 1 remise ». */
const compte = (nombre: number, mot: string) => `${nombre} ${mot}${s(nombre)}`

/** « Inès, M. Diallo et Léa ». */
function enumerer(elements: string[]): string {
  if (elements.length <= 1) return elements[0] ?? ''
  return `${elements.slice(0, -1).join(', ')} et ${elements[elements.length - 1]!}`
}

// ─── Carte « À faire maintenant » ────────────────────────────────────────────

export type LigneAFaire = {
  cle: 'validations' | 'photos' | 'bloques' | 'paiements' | 'signalements'
  nombre: number
  titre: string
  detail: string
  /** Vrai pour les paiements : bouton verrouillé côté équipe (R12). */
  reserveASandrine: boolean
}

/**
 * Détail de la ligne « validations », tel qu'arbitré :
 * 2 personnes → format du Figma · 3 et plus → énumération des prénoms.
 */
function detailDesRemises(etat: EtatMDS, remises: Pret[]): string {
  const prenoms = remises.map((p) => prenom(personne(etat, p.responsable)))
  if (remises.length >= 3) return `${enumerer(prenoms)} attendent au bureau`
  return remises
    .map((p, index) => {
      const qui = prenoms[index]!
      if (p.pourClasse) return `${qui} pour la ${p.pourClasse}`
      return `${qui} attend avec le ${nomDuType(etat, materiel(etat, p.materiel).type)}`
    })
    .join(' · ')
}

/** Les lignes de la carte « À faire maintenant » : une ligne seulement si son compteur > 0. */
export function lignesAFaire(etat: EtatMDS): LigneAFaire[] {
  const lignes: LigneAFaire[] = []

  const remises = remisesAValider(etat)
  const retours = retoursAValider(etat)
  if (remises.length + retours.length > 0) {
    const moities = [
      remises.length > 0 ? compte(remises.length, 'remise') : null,
      retours.length > 0 ? compte(retours.length, 'retour') : null,
    ].filter((x): x is string => x !== null)
    lignes.push({
      cle: 'validations',
      nombre: remises.length + retours.length,
      titre: `${moities.join(' et ')} à valider au bureau`,
      detail: detailDesRemises(etat, remises),
      reserveASandrine: false,
    })
  }

  const photos = photosAControler(etat)
  if (photos.length > 0) {
    lignes.push({
      cle: 'photos',
      nombre: photos.length,
      titre: `${compte(photos.length, 'photo')} de retour à contrôler`,
      detail: 'Niveau 2 · le matériel peut déjà être réemprunté',
      reserveASandrine: false,
    })
  }

  const bloquees = personnesBloquees(etat)
  if (bloquees.length > 0) {
    lignes.push({
      cle: 'bloques',
      nombre: bloquees.length,
      titre: `${compte(bloquees.length, 'emprunteur')} bloqué${s(bloquees.length)}`,
      detail: bloquees.map((p) => `${prenom(p)} : ${raisonDeBlocage(etat, p.id) ?? ''}`).join(' · '),
      reserveASandrine: false,
    })
  }

  const paiements = incidentsARembourser(etat)
  if (paiements.length > 0) {
    const montant = paiements.reduce((somme, i) => somme + i.montant, 0)
    lignes.push({
      cle: 'paiements',
      nombre: paiements.length,
      titre: `${compte(paiements.length, 'paiement')} à enregistrer · ${euros(montant)}`,
      detail: 'Forfaits dus au bureau',
      reserveASandrine: true,
    })
  }

  const ouverts = signalementsOuverts(etat)
  if (ouverts.length > 0) {
    lignes.push({
      cle: 'signalements',
      nombre: ouverts.length,
      titre: `${compte(ouverts.length, 'signalement')} ouvert${s(ouverts.length)}`,
      detail: ouverts
        .slice(0, 3)
        .map((sig) =>
          sig.cible.type === 'salle' ? `Salle ${sig.cible.id}` : materiel(etat, sig.cible.id).nom,
        )
        .join(', '),
      reserveASandrine: false,
    })
  }

  return lignes
}

// ─── Récap de 8h ─────────────────────────────────────────────────────────────

/**
 * Construit l'instantané du récap, au format de la carte Figma « Récap de 8h » :
 * une ligne d'en-tête, puis une ligne par indicateur non nul.
 */
export function construireRecap(etat: EtatMDS, le: Instant): Recap {
  const c = compteurs(etat)
  const bloquees = personnesBloquees(etat).length
  const ouverts = signalementsOuverts(etat).length
  const bas = consommablesBas(etat)

  const lignes = [`${h.jourLongCapitalise(le)} · ${h.heure(le)}`]
  if (c.enRetard > 0) lignes.push(`${compte(c.enRetard, 'prêt')} en retard`)
  if (bloquees > 0) lignes.push(`${compte(bloquees, 'emprunteur')} bloqué${s(bloquees)}`)
  if (c.photos > 0) lignes.push(`${compte(c.photos, 'photo')} à contrôler`)
  if (c.aRembourser.nombre > 0) {
    lignes.push(`${compte(c.aRembourser.nombre, 'paiement')} · ${euros(c.aRembourser.montant)}`)
  }
  if (ouverts > 0) lignes.push(`${compte(ouverts, 'signalement')} ouvert${s(ouverts)}`)
  if (bas.length > 0) lignes.push(`Stock bas : ${bas.map((x) => x.nom.toLowerCase()).join(', ')}`)

  return { le, lignes }
}

/** Destinataires du récap : équipe + direction (« Cyrianne, Lydia, Sandrine »). */
export const destinatairesDuRecap = (etat: EtatMDS): Personne[] =>
  etat.personnes.filter((p) => estEquipe(p.role))
