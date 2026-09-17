/**
 * Composant Figma « Bouton icône » (`44:89`).
 *
 * Bouton rond à icône seule. Styles : Doux (défaut), Contour (« Marquer traité »),
 * Surface (posé sur une photo), Plein (scanner, action principale).
 * Vérifié sur la capture : l'icône reste en `texte/principal` dans les quatre styles,
 * y compris sur le turquoise du style Plein.
 *
 * La boîte va de 36 à 56 px et l'icône occupe la moitié de la boîte.
 * Les trois styles qui gagnent un trait au survol en portent un **transparent** au
 * repos : la boîte garde ainsi exactement la même taille d'un état à l'autre.
 */
import { Icone } from './Icone'
import type { NomIcone } from './icones'
import type { StyleBoutonIcone, TailleBoutonIcone } from './variantes'

const STYLES: Record<StyleBoutonIcone, string> = {
  Doux: [
    'border border-transparent bg-surface-bouton-doux',
    'hover:bg-etat-doux-survol',
    'active:bg-etat-doux-presse',
  ].join(' '),
  Contour: [
    'border border-trait-fort',
    'hover:border-texte-principal hover:bg-surface-bouton-doux',
    'active:border-texte-principal active:bg-etat-doux-survol',
  ].join(' '),
  Surface: [
    'border border-transparent bg-surface-carte',
    'hover:border-trait-fort',
    'active:border-trait-fort active:bg-surface-champ',
  ].join(' '),
  Plein: [
    'border border-transparent bg-marque-turquoise',
    'hover:bg-etat-turquoise-survol hover:shadow-survol-bouton',
    'active:bg-etat-turquoise-presse active:shadow-none',
  ].join(' '),
}

type Props = {
  icone: NomIcone
  /** Nom de l'action, obligatoire : le bouton n'a pas de libellé visible. */
  titre: string
  style?: StyleBoutonIcone
  taille?: TailleBoutonIcone
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export function BoutonIcone({
  icone,
  titre,
  style = 'Doux',
  taille = 40,
  onClick,
  disabled = false,
  className,
}: Props) {
  return (
    <button
      type="button"
      aria-label={titre}
      title={titre}
      onClick={onClick}
      disabled={disabled}
      className={[
        'inline-flex shrink-0 items-center justify-center rounded-rond text-texte-principal',
        'transition-[background-color,box-shadow,border-color] duration-rapide ease-sortie active:duration-appui',
        disabled
          ? 'cursor-not-allowed border border-transparent bg-surface-desactive text-texte-desactive'
          : STYLES[style],
        className ?? '',
      ].join(' ')}
      style={{ width: taille, height: taille }}
    >
      <Icone nom={icone} pixels={Math.round(taille / 2)} />
    </button>
  )
}
