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

/**
 * « Mes prêts » rangés par ce qu'ils demandent, et non à plat : d'abord ce qui doit
 * repartir ce soir (les retards en tête), ensuite ce qui attend un geste de l'équipe.
 * Un groupe vide n'existe pas.
 */
export type GroupeDePrets = {
  cle: 'a_rendre' | 'en_attente'
  titre: string
  prets: Pret[]
}

export function pretsGroupesDe(etat: EtatMDS, id: PersonneId): GroupeDePrets[] {
  const ouverts = pretsDe(etat, id).filter(estOuvert)

  const aRendre = ouverts
    .filter((pret) => pret.statut === 'actif')
    // Un retard passe devant : c'est lui qui bloque les emprunts (R10).
    .sort((a, b) => Number(estEnRetard(etat, b)) - Number(estEnRetard(etat, a)))
  const enAttente = ouverts.filter((pret) => pret.statut !== 'actif')

  const groupes: GroupeDePrets[] = []
  if (aRendre.length > 0) {
    groupes.push({
      cle: 'a_rendre',
      titre: `À rendre avant ${h.heureCourte(etat.horloge.bureau.fermeture)}`,
      prets: aRendre,
    })
  }
  if (enAttente.length > 0) {
    groupes.push({ cle: 'en_attente', titre: 'En attente de l’équipe', prets: enAttente })
  }
  return groupes
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

export type CleLigneAFaire = 'validations' | 'photos' | 'bloques' | 'paiements' | 'signalements'

export type LigneAFaire = {
  cle: CleLigneAFaire
  nombre: number
  titre: string
  detail: string
  /** Vrai pour les paiements : bouton verrouillé côté équipe (R12). */
  reserveASandrine: boolean
  /**
   * Ce qu'on perd à ne pas traiter cette ligne tout de suite, en points (cf. `POIDS`).
   * C'est lui qui ordonne la carte : rien n'est figé, tout se recalcule depuis l'état.
   */
  urgence: number
  /** Pourquoi cette ligne passe avant les autres. Une phrase, déduite du calcul. */
  pourquoi: string
}

// ─── Urgence calculée ────────────────────────────────────────────────────────

/**
 * Poids de l'urgence, en points. Le barème est volontairement lisible : un euro en
 * jeu vaut un point, et les autres facteurs se comparent à de l'argent.
 *
 * - `euro` : l'argent dû ou en sursis compte point pour point.
 * - `blocage` : une personne qui ne peut plus emprunter perd sa journée de travail.
 * - `attente…` : quelqu'un debout au bureau, de plus en plus longtemps.
 * - `controle…` : une photo non contrôlée laisse un doute sur du matériel déjà reparti.
 * - `signalement…` : utile à traiter, jamais bloquant.
 */
const POIDS = {
  euro: 1,
  blocage: 120,
  attenteParPersonne: 40,
  attenteParMinute: 2,
  controleParPhoto: 25,
  controleParHeure: 1,
  signalement: 15,
  signalementAvecPhoto: 25,
} as const

/** Au-delà de 4 h d'attente, la personne est repartie : le compteur plafonne. */
const ATTENTE_MAXIMUM = 4 * 60

/** Fenêtre de la règle R11 : de la sortie à la déclaration de perte, 2 jours. */
const FENETRE_DE_PERTE = 48

/** Depuis combien de minutes ce prêt attend un geste de l'équipe. */
function minutesDAttente(etat: EtatMDS, pret: Pret): number {
  const depuis = pret.statut === 'remise_a_valider' ? pret.demandeLe : pret.retourDeclareLe
  if (depuis === undefined) return 0
  return Math.max(0, h.minutesEntre(depuis, etat.horloge.maintenant))
}

/**
 * L'argent que ce retard fera basculer en perte (R11) : le forfait, pondéré par ce
 * qu'il reste à courir avant l'échéance de J+2. À six heures de l'échéance, un PC à
 * 450 € pèse déjà presque son forfait entier.
 */
function argentEnSursis(etat: EtatMDS, pret: Pret): number {
  const echeance = echeanceDePerte(etat, pret)
  if (echeance === null) return 0
  const heuresRestantes = h.minutesEntre(etat.horloge.maintenant, echeance) / 60
  const avancement = Math.min(1, Math.max(0, 1 - heuresRestantes / FENETRE_DE_PERTE))
  return Math.round(pret.forfait * avancement)
}

/** L'attente la plus longue de la file, plafonnée. */
function attenteLaPlusLongue(etat: EtatMDS, prets: Pret[]): number {
  const attentes = prets.map((pret) => minutesDAttente(etat, pret))
  return Math.min(ATTENTE_MAXIMUM, Math.max(0, ...attentes))
}

/** « 1 h 20 », « 25 min » : une durée d'attente lisible dans une phrase. */
function duree(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const heures = Math.floor(minutes / 60)
  const reste = minutes % 60
  return reste === 0 ? `${heures} h` : `${heures} h ${deuxChiffres(reste)}`
}

const deuxChiffres = (nombre: number) => String(nombre).padStart(2, '0')

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

/**
 * Les lignes de la carte « À faire maintenant » : une ligne seulement si son compteur
 * est non nul, ordonnées par urgence décroissante — jamais dans un ordre figé.
 *
 * `pour` est le rôle de la personne qui regarde : une ligne sur laquelle elle n'a pas
 * la main (les paiements, réservés à la direction par R12) passe en fin de liste, parce
 * qu'elle ne peut rien en faire maintenant.
 */
export function lignesAFaire(etat: EtatMDS, pour?: Role): LigneAFaire[] {
  const lignes: LigneAFaire[] = []

  const remises = remisesAValider(etat)
  const retours = retoursAValider(etat)
  if (remises.length + retours.length > 0) {
    const enFile = [...remises, ...retours]
    const attente = attenteLaPlusLongue(etat, enFile)
    const moities = [
      remises.length > 0 ? compte(remises.length, 'remise') : null,
      retours.length > 0 ? compte(retours.length, 'retour') : null,
    ].filter((x): x is string => x !== null)
    lignes.push({
      cle: 'validations',
      nombre: enFile.length,
      titre: `${moities.join(' et ')} à valider au bureau`,
      detail: detailDesRemises(etat, remises),
      reserveASandrine: false,
      urgence: enFile.length * POIDS.attenteParPersonne + attente * POIDS.attenteParMinute,
      pourquoi:
        attente === 0
          ? `${compte(enFile.length, 'personne')} au bureau`
          : `${compte(enFile.length, 'personne')} au bureau, la plus ancienne depuis ${duree(attente)}`,
    })
  }

  const photos = photosAControler(etat)
  if (photos.length > 0) {
    const plusAncienne = photos.reduce((a, b) => (a.prisLe < b.prisLe ? a : b))
    const heuresDAttente = Math.max(
      0,
      Math.round(h.minutesEntre(plusAncienne.prisLe, etat.horloge.maintenant) / 60),
    )
    lignes.push({
      cle: 'photos',
      nombre: photos.length,
      titre: `${compte(photos.length, 'photo')} de retour à contrôler`,
      detail: 'Niveau 2 · le matériel peut déjà être réemprunté',
      reserveASandrine: false,
      urgence:
        photos.length * POIDS.controleParPhoto +
        Math.min(FENETRE_DE_PERTE, heuresDAttente) * POIDS.controleParHeure,
      pourquoi:
        heuresDAttente === 0
          ? 'Contrôle de niveau 2, sans urgence'
          : `La plus ancienne attend depuis ${duree(heuresDAttente * 60)}`,
    })
  }

  const bloquees = personnesBloquees(etat)
  if (bloquees.length > 0) {
    const sursis = pretsEnRetard(etat).reduce((somme, pret) => somme + argentEnSursis(etat, pret), 0)
    lignes.push({
      cle: 'bloques',
      nombre: bloquees.length,
      titre: `${compte(bloquees.length, 'emprunteur')} bloqué${s(bloquees.length)}`,
      detail: bloquees.map((p) => `${prenom(p)} : ${raisonDeBlocage(etat, p.id) ?? ''}`).join(' · '),
      reserveASandrine: false,
      urgence: bloquees.length * POIDS.blocage + sursis * POIDS.euro,
      pourquoi:
        sursis === 0
          ? `${compte(bloquees.length, 'personne')} ne peut plus emprunter`
          : `${compte(bloquees.length, 'personne')} bloquée${s(bloquees.length)} et ${euros(sursis)} qui basculent en perte`,
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
      urgence: montant * POIDS.euro,
      pourquoi: `${euros(montant)} dus à l’école`,
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
      urgence: ouverts.reduce(
        (somme, sig) => somme + (sig.photo ? POIDS.signalementAvecPhoto : POIDS.signalement),
        0,
      ),
      pourquoi: 'Envoyés depuis l’app, à qualifier',
    })
  }

  // Les lignes verrouillées pour qui regarde passent après : le geste est ailleurs (R12).
  const verrouillee = (ligne: LigneAFaire) =>
    ligne.reserveASandrine && pour !== undefined && !estDirection(pour) ? 1 : 0

  return lignes.sort(
    (a, b) => verrouillee(a) - verrouillee(b) || b.urgence - a.urgence || a.cle.localeCompare(b.cle),
  )
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
