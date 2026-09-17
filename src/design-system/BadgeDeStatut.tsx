/**
 * Composant Figma « Badge de statut » (`45:89`).
 *
 * Les huit statuts affichables du prototype, regroupés en cinq familles de couleur.
 * Le libellé est libre : un badge peut porter « n disponibles » ou « Réemprunté par Tom »
 * tout en gardant la famille de couleur de son statut.
 */
import type { StatutBadge } from './statuts'
import { FAMILLE_DE_STATUT, LIBELLE_DE_STATUT, TONS_DE_BADGE } from './statuts'

type Props = {
  statut: StatutBadge
  /** Remplace le libellé par défaut du statut, en gardant sa couleur. */
  libelle?: string | undefined
  /** Variante « Afficher la pastille » du Figma. */
  pastille?: boolean | undefined
  className?: string | undefined
}

export function BadgeDeStatut({ statut, libelle, pastille = true, className }: Props) {
  const ton = TONS_DE_BADGE[FAMILLE_DE_STATUT[statut]]

  return (
    <span
      className={[
        // Géométrie du Figma : gap 6, padding 8 à gauche / 9 à droite / 3 en haut et en bas.
        'inline-flex shrink-0 items-center gap-[6px] rounded-pastille px-[8px] py-[3px] pr-[9px]',
        'font-texte text-[12px] leading-[16px] font-medium whitespace-nowrap',
        ton.fond,
        ton.texte,
        className ?? '',
      ].join(' ')}
    >
      {pastille && <span className={`size-[6px] shrink-0 rounded-rond ${ton.pastille}`} aria-hidden />}
      {libelle ?? LIBELLE_DE_STATUT[statut]}
    </span>
  )
}
