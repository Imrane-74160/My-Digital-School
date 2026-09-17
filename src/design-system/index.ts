/**
 * Design system : les composants portent les mêmes noms que dans la page
 * « Composants » du Figma (`40:3`), et leurs variantes sont des props typées.
 * Correspondance des noms de props : `docs/04-design-system.md`.
 *
 * Les composants n'exportent qu'un composant chacun ; les variantes, tailles et
 * familles de couleur vivent dans `variantes.ts` et `statuts.ts`.
 */
export { Avatar } from './Avatar'
export { BadgeDeStatut } from './BadgeDeStatut'
export { Bouton } from './Bouton'
export { BoutonIcone } from './BoutonIcone'
export { Icone } from './Icone'
export { ICONES, iconePeutEtre, NOMS_ICONES, TAILLES_ICONE } from './icones'
export type { ComposantIcone, NomIcone, ProprietesIcone, TailleIcone } from './icones'
export { Pastille } from './Pastille'
export { Pictogramme } from './Pictogramme'
export { PuceDeCategorie } from './PuceDeCategorie'
export { PuceDeComposant } from './PuceDeComposant'
export { FAMILLE_DE_STATUT, LIBELLE_DE_STATUT, STATUTS_BADGE, TONS_DE_BADGE } from './statuts'
export type { FamilleDeBadge, StatutBadge } from './statuts'
export { Trepied } from './TrepiedIcone'
export {
  ETATS_PUCE,
  ONGLETS_MOBILES,
  FORMES_PICTOGRAMME,
  initialeDe,
  STYLES_BOUTON_ICONE,
  TAILLES_AVATAR,
  TAILLES_BOUTON,
  TAILLES_BOUTON_ICONE,
  TAILLES_PICTOGRAMME,
  TEINTES_PICTOGRAMME,
  TYPES_BOUTON,
  TYPES_PASTILLE,
} from './variantes'
export type {
  EtatPuce,
  OngletMobile,
  FormePictogramme,
  StyleBoutonIcone,
  TailleAvatar,
  TailleBouton,
  TailleBoutonIcone,
  TaillePictogramme,
  TeintePictogramme,
  TypeBouton,
  TypePastille,
} from './variantes'
export { CaseACocher } from './CaseACocher'
export { Champ } from './Champ'
export { Interrupteur } from './Interrupteur'
export { ListeDeroulante } from './ListeDeroulante'
export type { OptionListe } from './ListeDeroulante'
export { Onglets } from './Onglets'
export type { Onglet } from './Onglets'
export { BarreDeNavigationMobile } from './BarreDeNavigationMobile'
export { EnTeteDeCarte } from './EnTeteDeCarte'
export { Infobulle } from './Infobulle'
export { LienDeNavigation } from './LienDeNavigation'
// Utilitaire, pas un composant Figma : le motif de QR est dérivé du code du matériel.
export { MotifQR } from './MotifQR'

// Structure, cartes et tableaux
export {
  BarreDEtat,
  Carte,
  CarteSombre,
  Encart,
  EnTeteDePage,
  EnTeteEcranMobile,
  EtatVide,
  TitreDeSection,
  VisuelMateriel,
  ZoneDAction,
} from './structure'
export type { TonEncart } from './structure'
export {
  ActionDuCompte,
  BoutonPrincipalMobile,
  CarteDePret,
  Etape,
  LigneDeCatalogue,
  LigneDeComposant,
  LigneDeMontant,
  LigneDeNotification,
  LigneDInformation,
  MaterielDetecte,
  Raccourci,
} from './cartes-mobile'
export {
  ActionAFaire,
  CarteDeStock,
  CarteDeValidation,
  CarteDIncident,
  CartePhotoDeRetour,
  Indicateur,
  LigneDeForfait,
  LigneDeReglage,
  LigneDeStock,
  PretDeClasse,
  Regle,
} from './cartes-bo'
export type { TonIndicateur } from './cartes-bo'
export { CelluleDouble, EnTeteDeTableau, LigneDeTableau, LigneDImport, Tableau } from './tableau'
export type { Colonne } from './tableau'
