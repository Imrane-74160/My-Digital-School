import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Icone } from './Icone'
import type { NomIcone, TailleIcone } from './icones'

import type { TailleBouton, TypeBouton } from './variantes'

type Props = {
  libelle: string
  type?: TypeBouton | undefined
  taille?: TailleBouton | undefined
  /** Icône à gauche du libellé. Absente = variante « Afficher l'icône : non ». */
  icone?: NomIcone | undefined
  /** Rendu personnalisé de l'icône, quand ce n'est pas une icône du design system. */
  enfantIcone?: ReactNode | undefined
  /** Occupe toute la largeur disponible : c'est le cas des boutons d'action mobile. */
  pleineLargeur?: boolean | undefined
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'className' | 'children'>

/** Géométrie relevée sur le Figma : M = 40 px, L = 52 px. */
const GEOMETRIE: Record<TailleBouton, { boite: string; texte: string; icone: TailleIcone }> = {
  // M : hauteur 40, padding 16 de chaque côté, rayon « bouton », libellé 14/18.
  M: { boite: 'h-[40px] px-lg rounded-bouton', texte: 'text-[14px] leading-[18px]', icone: 'md' },
  // L : hauteur 52, padding 16 à gauche et 20 à droite, rayon « champ », libellé 16/18.
  L: { boite: 'h-[52px] pl-lg pr-xl rounded-champ', texte: 'text-[16px] leading-[18px]', icone: 'xl' },
}

/**
 * Couleurs par type, États Défaut / Survol / Pressé.
 * Le libellé reste en `texte-principal` sur les trois types, y compris sur le turquoise
 * et l'orange : c'est bien ce que montre le composant Figma.
 * Le halo au survol n'existe que pour Principal et Alerte, pas pour Secondaire.
 */
const TONS: Record<TypeBouton, string> = {
  Principal: [
    'bg-marque-turquoise text-texte-principal',
    'hover:bg-etat-turquoise-survol hover:shadow-survol-bouton',
    'active:bg-etat-turquoise-presse active:shadow-none',
  ].join(' '),
  Secondaire: [
    'bg-surface-bouton-doux text-texte-principal',
    'hover:bg-etat-doux-survol',
    'active:bg-etat-doux-presse',
  ].join(' '),
  Alerte: [
    'bg-marque-orange text-texte-principal',
    'hover:bg-etat-orange-survol hover:shadow-survol-bouton-alerte',
    'active:bg-etat-orange-presse active:shadow-none',
  ].join(' '),
}

const DESACTIVE = 'bg-surface-desactive text-texte-desactive cursor-not-allowed'

export function Bouton({
  libelle,
  type = 'Principal',
  taille = 'M',
  icone,
  enfantIcone,
  pleineLargeur = false,
  disabled = false,
  ...reste
}: Props) {
  const { boite, texte, icone: tailleIcone } = GEOMETRIE[taille]

  return (
    <button
      type="button"
      disabled={disabled}
      className={[
        'inline-flex shrink-0 items-center justify-center gap-sm',
        'font-texte font-medium whitespace-nowrap',
        // Survol 120 ms, appui 80 ms : durées du design system, coupées par prefers-reduced-motion.
        'transition-[background-color,box-shadow] duration-rapide ease-sortie active:duration-appui',
        boite,
        texte,
        pleineLargeur ? 'w-full' : '',
        disabled ? DESACTIVE : TONS[type],
      ].join(' ')}
      {...reste}
    >
      {enfantIcone ?? (icone ? <Icone nom={icone} taille={tailleIcone} /> : null)}
      {libelle}
    </button>
  )
}
