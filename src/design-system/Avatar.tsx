/**
 * Composant Figma « Avatar » (`45:110`), plus la taille 84 de l'écran Profil (`93:1013`).
 *
 * La couleur de fond vient de la personne (`personnes[].couleur` du jeu de démo) : c'est
 * une donnée, pas un style — d'où la seule propriété de style passée en ligne du projet.
 *
 * Écart relevé au Figma : les tailles 22 à 48 écrivent l'initiale en **Inter Medium**,
 * la taille 84 en **Bricolage Grotesque 28/32** (style `Chiffre/L`).
 */

import type { TailleAvatar } from './variantes'

/** Taille de boîte et style de l'initiale, relevés variante par variante. */
const GEOMETRIE: Record<TailleAvatar, { boite: string; initiale: string }> = {
  22: { boite: 'size-[22px]', initiale: 'font-texte font-medium text-[9px] leading-[12px]' },
  28: { boite: 'size-[28px]', initiale: 'font-texte font-medium text-[12px] leading-[15px]' },
  32: { boite: 'size-[32px]', initiale: 'font-texte font-medium text-[13px] leading-[18px]' },
  44: { boite: 'size-[44px]', initiale: 'font-texte font-medium text-[18px] leading-[24px]' },
  48: { boite: 'size-[48px]', initiale: 'font-texte font-medium text-[20px] leading-[26px]' },
  // La grande taille du Profil passe en Bricolage Grotesque, comme les chiffres.
  84: { boite: 'size-[84px]', initiale: 'mds-chiffre-l' },
}

type Props = {
  /** Initiale affichée. Se déduit du prénom avec `initialeDe`. */
  initiale: string
  taille?: TailleAvatar
  /** Couleur de la personne, telle qu'elle vient du jeu de démo. */
  couleur: string
  /** Nom complet, pour les lecteurs d'écran. Sans lui, l'avatar est décoratif. */
  titre?: string
  className?: string
}

export function Avatar({ initiale, taille = 32, couleur, titre, className }: Props) {
  const { boite, initiale: styleInitiale } = GEOMETRIE[taille]

  return (
    <span
      className={[
        'inline-flex shrink-0 items-center justify-center rounded-rond text-texte-inverse',
        boite,
        className ?? '',
      ].join(' ')}
      style={{ backgroundColor: couleur }}
      {...(titre === undefined ? { 'aria-hidden': true } : { role: 'img', 'aria-label': titre })}
    >
      <span className={styleInitiale}>{initiale}</span>
    </span>
  )
}
