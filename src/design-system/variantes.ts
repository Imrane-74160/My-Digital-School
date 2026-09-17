/**
 * Variantes et tailles des composants, relevées sur la page « Composants » du Figma.
 *
 * Ce module ne contient que des données : les fichiers de composants n'exportent qu'un
 * composant, ce qui garde le rafraîchissement à chaud de Vite opérationnel.
 */

// ─── Bouton (43:101) ─────────────────────────────────────────────────────────

export type TypeBouton = 'Principal' | 'Secondaire' | 'Alerte'
export type TailleBouton = 'M' | 'L'

export const TYPES_BOUTON = ['Principal', 'Secondaire', 'Alerte'] as const
export const TAILLES_BOUTON = ['M', 'L'] as const

// ─── Bouton icône (44:89) ────────────────────────────────────────────────────

export type StyleBoutonIcone = 'Doux' | 'Contour' | 'Surface' | 'Plein'

export const STYLES_BOUTON_ICONE = ['Doux', 'Contour', 'Surface', 'Plein'] as const
export const TAILLES_BOUTON_ICONE = [36, 40, 44, 48, 52, 56] as const
export type TailleBoutonIcone = (typeof TAILLES_BOUTON_ICONE)[number]

// ─── Avatar (45:110, plus la taille 84 de 93:1013) ───────────────────────────

export const TAILLES_AVATAR = [22, 28, 32, 44, 48, 84] as const
export type TailleAvatar = (typeof TAILLES_AVATAR)[number]

/** « Inès Martin » → « I ». */
export const initialeDe = (nom: string): string => [...nom.trim()][0]?.toUpperCase() ?? '?'

// ─── Pastille (45:96) ────────────────────────────────────────────────────────

export type TypePastille = 'Niveau' | 'Classe' | 'Montant'

export const TYPES_PASTILLE = ['Niveau', 'Classe', 'Montant'] as const

// ─── Pictogramme (59:150) ────────────────────────────────────────────────────

export type FormePictogramme = 'Carré' | 'Rond'
export type TeintePictogramme = 'Neutre' | 'Turquoise' | 'Bleu' | 'Orange' | 'Rose' | 'Blanc' | 'Contour'

export const FORMES_PICTOGRAMME = ['Carré', 'Rond'] as const
export const TEINTES_PICTOGRAMME = [
  'Neutre',
  'Turquoise',
  'Bleu',
  'Orange',
  'Rose',
  'Blanc',
  'Contour',
] as const
export const TAILLES_PICTOGRAMME = [32, 36, 40, 44, 48, 52, 56] as const
export type TaillePictogramme = (typeof TAILLES_PICTOGRAMME)[number]

// ─── Puce de composant (45:130) ──────────────────────────────────────────────

export type EtatPuce = 'Vérifié' | 'Neutre' | 'Manquant'

export const ETATS_PUCE = ['Vérifié', 'Neutre', 'Manquant'] as const
