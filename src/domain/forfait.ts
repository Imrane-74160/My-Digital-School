/**
 * Forfaits (R03, R07).
 *
 * Un matériel porte soit un `forfait` d'unité, soit des `composants` — jamais les deux.
 * Le forfait d'un kit est la somme de ses composants. Quand un composant manque, seul
 * son forfait est dû (R07), jamais celui du kit entier.
 */
import type { Composant, ComposantId, Materiel } from './types'

export function forfaitMateriel(materiel: Materiel): number {
  if (materiel.composants) return materiel.composants.reduce((somme, c) => somme + c.forfait, 0)
  return materiel.forfait ?? 0
}

export function composantDe(materiel: Materiel, id: ComposantId): Composant | undefined {
  return materiel.composants?.find((c) => c.id === id)
}

export type Manque = {
  /** Libellé repris dans le message de refus et dans le motif de l'incident. */
  libelle: string
  montant: number
}

/**
 * Ce qui est dû quand un retour est déclaré incomplet.
 * - `manquant` désigne un composant du kit → forfait de ce composant seul (R07).
 * - `manquant` ne correspond à aucun composant (matériel sans kit, déclaré abîmé)
 *   → forfait complet du matériel.
 * - pas de `manquant` → rien n'est dû.
 */
export function manqueDeclare(materiel: Materiel, manquant?: ComposantId): Manque | null {
  if (!manquant) return null
  const composant = composantDe(materiel, manquant)
  if (composant) return { libelle: `${composant.nom} manquant(e)`, montant: composant.forfait }
  return { libelle: 'contenu incomplet ou abîmé', montant: forfaitMateriel(materiel) }
}

/** Montants en euros, au format français du Figma : « 1 130 € ». */
export function euros(montant: number): string {
  const arrondi = Math.round(montant)
  // Séparateur de milliers : espace insécable, comme dans le Figma.
  const chiffres = String(Math.abs(arrondi)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return `${arrondi < 0 ? '-' : ''}${chiffres} €`
}
