/**
 * Familles de couleur des badges, relevées sur le composant Figma « Badge de statut » (`45:89`).
 *
 * Cinq familles pour huit statuts. Les couleurs de pastille ont été lues dans les SVG
 * exportés du Figma et correspondent toutes à un token existant :
 * turquoise `#2DB8C5`, bleu `#5C98D0`, orange `#EF8900`, rose `#EC4391`, gris `#8C929C`.
 */

/** Les huit statuts affichables, dans l'ordre du Figma. */
export const STATUTS_BADGE = [
  'Disponible',
  'En cours',
  'À valider',
  'En retard',
  'Bloqué',
  'Retiré',
  'Payé',
  'Incident',
] as const

export type StatutBadge = (typeof STATUTS_BADGE)[number]

export type FamilleDeBadge = 'turquoise' | 'bleu' | 'orange' | 'rose' | 'neutre'

export const FAMILLE_DE_STATUT: Record<StatutBadge, FamilleDeBadge> = {
  Disponible: 'turquoise',
  Payé: 'turquoise',
  'En cours': 'bleu',
  'À valider': 'orange',
  Bloqué: 'orange',
  'En retard': 'rose',
  Incident: 'rose',
  Retiré: 'neutre',
}

export const TONS_DE_BADGE: Record<FamilleDeBadge, { fond: string; texte: string; pastille: string }> = {
  turquoise: {
    fond: 'bg-marque-turquoise-clair',
    texte: 'text-marque-turquoise-fonce',
    pastille: 'bg-marque-turquoise',
  },
  bleu: {
    fond: 'bg-marque-bleu-clair',
    texte: 'text-marque-bleu-fonce',
    pastille: 'bg-marque-bleu',
  },
  orange: {
    fond: 'bg-marque-orange-clair',
    texte: 'text-marque-orange-fonce',
    pastille: 'bg-marque-orange',
  },
  rose: {
    fond: 'bg-marque-rose-clair',
    texte: 'text-marque-rose-fonce',
    pastille: 'bg-marque-rose',
  },
  neutre: {
    fond: 'bg-surface-pastille',
    texte: 'text-texte-secondaire',
    pastille: 'bg-texte-tertiaire',
  },
}

/** Libellé par défaut d'un statut : le badge accepte aussi un libellé libre. */
export const LIBELLE_DE_STATUT: Record<StatutBadge, string> = {
  Disponible: 'Disponible',
  'En cours': 'En cours',
  'À valider': 'À valider',
  'En retard': 'En retard',
  Bloqué: 'Bloqué',
  Retiré: 'Retiré',
  Payé: 'Payé',
  Incident: 'Incident',
}
