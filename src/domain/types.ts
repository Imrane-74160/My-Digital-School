/**
 * Types du domaine « Prêts MDS ».
 *
 * Vocabulaire métier en français (`remise_a_valider`, `EMPRUNTER`…), conformément à
 * `CLAUDE.md`. Ces types suivent au plus près `data/seed.json` : le chargement du jeu
 * de démo reste ainsi une simple validation, sans transformation cachée.
 */

// ─── Identifiants et instants ────────────────────────────────────────────────

export type PersonneId = string
export type MaterielId = string
/** Type de matériel, ex. `casque-anglais`. Le catalogue mobile liste des types, pas des unités. */
export type TypeMateriel = string
export type ComposantId = string
export type PretId = string
export type IncidentId = string
export type SignalementId = string
export type PhotoId = string
export type NotificationId = string
export type ConsommableId = string
export type SalleId = string
export type ClasseId = string
export type CategorieId = string

/**
 * Instant en heure locale du campus (Europe/Paris), au format `AAAA-MM-JJTHH:MM`.
 * Jamais un `Date` : le domaine reste pur et déterministe, sans fuseau du runtime.
 */
export type Instant = string
/** Jour seul, au format `AAAA-MM-JJ`. */
export type Jour = string
/** Heure seule, au format `HH:MM`. */
export type Heure = string

// ─── Personnes ───────────────────────────────────────────────────────────────

export const ROLES = ['eleve', 'intervenant', 'equipe', 'direction'] as const
export type Role = (typeof ROLES)[number]

export type Personne = {
  id: PersonneId
  nom: string
  prenom?: string
  role: Role
  classe?: ClasseId
  /** Classes d'un intervenant : affichage et présélection dans « Pour ma classe ». */
  classes?: ClasseId[]
  couleur: string
  email?: string
  charteAcceptee: Instant | null
  empruntsAnnee?: number
  droits?: string
  note?: string
}

// ─── Matériel ────────────────────────────────────────────────────────────────

export const STATUTS_MATERIEL = [
  'disponible',
  'remise_a_valider',
  'emprunte',
  'retour_a_valider',
  /** Retiré du prêt suite à un incident. */
  'anomalie',
  /** Retiré manuellement par l'équipe. */
  'hors_service',
  'perdu',
] as const
export type StatutMateriel = (typeof STATUTS_MATERIEL)[number]

export type Niveau = 1 | 2

export type Composant = {
  id: ComposantId
  nom: string
  forfait: number
}

export type Materiel = {
  id: MaterielId
  type: TypeMateriel
  nom: string
  categorie: CategorieId
  icone: string
  niveau: Niveau
  lieu: string
  qr: string
  statut: StatutMateriel
  /** Forfait de l'unité, ou `composants` pour un kit — jamais les deux. */
  forfait?: number
  composants?: Composant[]
  /** Rôle exigé pour emprunter, ex. `intervenant` pour les boîtes. */
  reserveA?: Role
  /** Note interne, affichée uniquement au back-office. */
  note?: string
}

export type Categorie = {
  nom: string
  court: string
  reserveA?: Role
}

// ─── Prêts ───────────────────────────────────────────────────────────────────

export const STATUTS_PRET = [
  'remise_a_valider',
  'actif',
  'retour_a_valider',
  'rendu',
  'perdu',
  /** Remise jamais validée, annulée à la fin de la journée. */
  'annule',
] as const
export type StatutPret = (typeof STATUTS_PRET)[number]

export type Pret = {
  id: PretId
  materiel: MaterielId
  /** Seule personne autorisée à rendre (R08). Pour un prêt de classe, c'est l'intervenant. */
  responsable: PersonneId
  pourClasse: ClasseId | null
  statut: StatutPret
  /** Forfait accepté au moment de l'emprunt (R03) : figé, même si le forfait du type change. */
  forfait: number
  demandeLe?: Instant
  sortiLe?: Instant
  valideePar?: PersonneId
  retourDeclareLe?: Instant
  declaration?: string
  /** Composant déclaré manquant au retour, en attente de contrôle. */
  manquant?: ComposantId
  renduLe?: Instant
}

// ─── Photos de retour (niveau 2) ─────────────────────────────────────────────

export const STATUTS_PHOTO = ['a_controler', 'conforme', 'probleme'] as const
export type StatutPhoto = (typeof STATUTS_PHOTO)[number]

export type PhotoDeRetour = {
  id: PhotoId
  pret: PretId
  materiel: MaterielId
  /** Personne mise en cause par cette photo, même si le matériel est déjà reparti (R06). */
  responsable: PersonneId
  fichier?: string
  prisLe: Instant
  declaration?: string
  composantSignale?: ComposantId
  statut: StatutPhoto
  /** Renseigné quand le matériel est reparti avant le contrôle (R06). */
  reempruntePar?: PersonneId
  controlePar?: PersonneId
  controleLe?: Instant
  incident?: IncidentId
}

// ─── Incidents ───────────────────────────────────────────────────────────────

export const TYPES_INCIDENT = ['casse', 'composant', 'perte'] as const
export type TypeIncident = (typeof TYPES_INCIDENT)[number]

export const STATUTS_INCIDENT = ['a_rembourser', 'rembourse'] as const
export type StatutIncident = (typeof STATUTS_INCIDENT)[number]

export type Incident = {
  id: IncidentId
  materiel: MaterielId
  responsable: PersonneId
  type: TypeIncident
  motif: string
  montant: number
  /** Conservé quand Sandrine baisse le montant (R12). */
  montantInitial?: number
  ajustePar?: PersonneId
  composant?: ComposantId
  statut: StatutIncident
  creeLe: Instant
  payeLe?: Instant
}

// ─── Signalements ────────────────────────────────────────────────────────────

export const CATEGORIES_SIGNALEMENT = ['Panne', 'Casse', 'Manquant', 'Déplacé', 'Autre'] as const
export type CategorieSignalement = (typeof CATEGORIES_SIGNALEMENT)[number]

export const STATUTS_SIGNALEMENT = ['ouvert', 'traite'] as const
export type StatutSignalement = (typeof STATUTS_SIGNALEMENT)[number]

export type CibleSignalement =
  | { type: 'materiel'; id: MaterielId }
  | { type: 'salle'; id: SalleId }

export type Signalement = {
  id: SignalementId
  par: PersonneId
  cible: CibleSignalement
  categorie: CategorieSignalement
  texte: string
  photo: boolean
  le: Instant
  statut: StatutSignalement
  traitePar?: PersonneId
  traiteLe?: Instant
}

// ─── Notifications ───────────────────────────────────────────────────────────

/** `equipe` désigne l'ensemble équipe + direction (boîte commune du back-office). */
export type DestinataireNotification = PersonneId | 'equipe'

export type Notification = {
  id: NotificationId
  pour: DestinataireNotification[]
  le: Instant
  icone: string
  texte: string
  lue: boolean
  regle?: CodeRegle
}

// ─── Consommables, salles, réglages ──────────────────────────────────────────

export type Consommable = {
  id: ConsommableId
  nom: string
  unite: string
  icone: string
  quantite: number
  seuil: number
  dernierComptage: Instant
}

export type Comptage = {
  le: Instant
  par: PersonneId
  quantites: Record<ConsommableId, number>
}

export type Salle = {
  id: SalleId
  attendus: number
  presents: number
  verifieeLe: Instant
}

export type ArticleCharte = {
  id: string
  titre: string
  texte: string
}

export type Charte = {
  titre: string
  articles: ArticleCharte[]
}

export type Reglages = {
  charte: Charte
  charteModifieeLe: Instant
  rappel1630: boolean
  recap8h: boolean
}

// ─── Imports Calc ────────────────────────────────────────────────────────────

export type LigneImport = {
  nom: string
  categorie: CategorieId
  niveau: Niveau | null
  lieu: string
  forfait: number
  icone: string
  /** Présent si la ligne est invalide : elle sera ignorée à l'import. */
  erreur?: string
}

export type ImportExemple = {
  inventaire: {
    fichier: string
    deposePar: PersonneId
    deposeLe: Instant
    lignes: LigneImport[]
  }
  classes: {
    fichier: string
    classes: ClasseId[]
  }
}

// ─── Récap de 8h ─────────────────────────────────────────────────────────────

/**
 * Instantané, pas un calcul en direct : généré par ▶ LENDEMAIN quand `recap8h` est actif,
 * puis stocké tel quel (cf. `docs/02-regles-metier.md`, section « Récap de 8h »).
 */
export type Recap = {
  le: Instant
  /** Ligne d'en-tête puis une ligne par indicateur non nul. */
  lignes: string[]
}

// ─── État complet ────────────────────────────────────────────────────────────

export type Horloge = {
  maintenant: Instant
  bureau: { ouverture: Heure; fermeture: Heure }
  rappel: Heure
  recap: Heure
}

export type EtatMDS = {
  version: number
  horloge: Horloge
  categories: Record<CategorieId, Categorie>
  lieux: string[]
  classes: ClasseId[]
  personnes: Personne[]
  materiels: Materiel[]
  prets: Pret[]
  photosDeRetour: PhotoDeRetour[]
  /** Inscriptions « Me prévenir », indexées par TYPE de matériel et non par unité (R14). */
  prevenus: Record<TypeMateriel, PersonneId[]>
  incidents: Incident[]
  signalements: Signalement[]
  notifications: Notification[]
  consommables: Consommable[]
  comptages: Comptage[]
  salles: Salle[]
  reglages: Reglages
  /** Déblocages manuels : jour (`AAAA-MM-JJ`) pour lequel la personne est exemptée (R16). */
  exemptions: Record<PersonneId, Jour>
  importExemple: ImportExemple
  recap: Recap | null
  /** Compteur d'identifiants, pour que `dispatch` reste déterministe. */
  sequence: number
}

// ─── Règles ──────────────────────────────────────────────────────────────────

export const CODES_REGLE = [
  'R01', 'R02', 'R03', 'R04', 'R05', 'R06', 'R07', 'R08',
  'R09', 'R10', 'R11', 'R12', 'R13', 'R14', 'R15', 'R16',
] as const
export type CodeRegle = (typeof CODES_REGLE)[number]

export type Regle = {
  code: CodeRegle
  cle: string
  libelle: string
}
