/**
 * Les actions du moteur (cf. `docs/02-regles-metier.md`, « Actions du moteur »).
 * `par` est toujours l'auteur de l'action : c'est lui dont on vérifie les droits.
 */
import type {
  ArticleCharte,
  CategorieId,
  CategorieSignalement,
  CibleSignalement,
  ClasseId,
  ComposantId,
  ConsommableId,
  IncidentId,
  LigneImport,
  MaterielId,
  Niveau,
  PersonneId,
  SalleId,
  SignalementId,
  TypeMateriel,
} from './types'

export type DonneesNouveauMateriel = {
  nom: string
  categorie: CategorieId
  niveau: Niveau
  lieu: string
  forfait: number
  icone?: string
}

export type Action =
  // ── Emprunteur ──────────────────────────────────────────────────────────
  | { type: 'ACCEPTER_CHARTE'; par: PersonneId }
  | {
      type: 'EMPRUNTER'
      par: PersonneId
      materiel: MaterielId
      pourClasse?: ClasseId
      /** Case « J'accepte le forfait » cochée : précondition du moteur (R03). */
      forfaitAccepte: boolean
    }
  | {
      type: 'RENDRE'
      par: PersonneId
      materiel: MaterielId
      /** Composant décoché dans la checklist. */
      manquant?: ComposantId
      /** Photo de retour prise : obligatoire (R05). */
      photo: boolean
    }
  | { type: 'PREVENEZ_MOI'; par: PersonneId; typeMateriel: TypeMateriel }
  | {
      type: 'SIGNALER'
      par: PersonneId
      cible: CibleSignalement
      categorie: CategorieSignalement
      texte?: string
      photo?: boolean
    }
  // ── Équipe ──────────────────────────────────────────────────────────────
  | { type: 'VALIDER_REMISE'; par: PersonneId; materiel: MaterielId }
  | { type: 'VALIDER_RETOUR'; par: PersonneId; materiel: MaterielId; manquant?: ComposantId }
  | { type: 'CONTROLER_PHOTO'; par: PersonneId; materiel: MaterielId; manquant?: ComposantId }
  | { type: 'TRAITER_SIGNALEMENT'; par: PersonneId; signalement: SignalementId }
  | { type: 'RETIRER'; par: PersonneId; materiel: MaterielId }
  | { type: 'REMETTRE'; par: PersonneId; materiel: MaterielId }
  | { type: 'AJOUTER_MATERIEL'; par: PersonneId; donnees: DonneesNouveauMateriel }
  | { type: 'DEBLOQUER'; par: PersonneId; personne: PersonneId }
  | { type: 'COMPTAGE'; par: PersonneId; quantites: Record<ConsommableId, number> }
  | { type: 'VERIFIER_SALLE'; par: PersonneId; salle: SalleId; presents: number }
  | { type: 'IMPORT_INVENTAIRE'; par: PersonneId; lignes: LigneImport[] }
  | { type: 'IMPORT_CLASSES'; par: PersonneId; classes: ClasseId[] }
  | { type: 'REGLAGE'; par: PersonneId; cle: 'rappel1630' | 'recap8h'; valeur: boolean }
  // ── Direction (Sandrine) ────────────────────────────────────────────────
  | {
      type: 'MODIFIER_FORFAIT'
      par: PersonneId
      /** S'applique à tout le type : « Un changement s'applique à tout le type ». */
      typeMateriel: TypeMateriel
      composant?: ComposantId
      valeur: number
    }
  | { type: 'AJUSTER_MONTANT'; par: PersonneId; incident: IncidentId; valeur: number }
  | { type: 'REMBOURSEMENT'; par: PersonneId; incident: IncidentId }
  | { type: 'MODIFIER_CHARTE'; par: PersonneId; titre?: string; articles: ArticleCharte[] }
  // ── Horloge du panneau de démo ──────────────────────────────────────────
  | { type: 'ALLER_A_16H30' }
  | { type: 'FIN_DE_JOURNEE' }
  | { type: 'LENDEMAIN' }

export type TypeAction = Action['type']

/** Actions dont l'accès est réservé à l'équipe (R13) ou à la direction (R12). */
export const ACTIONS_PROTEGEES = {
  equipe: [
    'VALIDER_REMISE',
    'VALIDER_RETOUR',
    'CONTROLER_PHOTO',
    'TRAITER_SIGNALEMENT',
    'RETIRER',
    'REMETTRE',
    'AJOUTER_MATERIEL',
    'DEBLOQUER',
    'COMPTAGE',
    'VERIFIER_SALLE',
    'IMPORT_INVENTAIRE',
    'IMPORT_CLASSES',
    'REGLAGE',
  ],
  direction: ['MODIFIER_FORFAIT', 'AJUSTER_MONTANT', 'REMBOURSEMENT', 'MODIFIER_CHARTE'],
} as const satisfies Record<'equipe' | 'direction', readonly TypeAction[]>
