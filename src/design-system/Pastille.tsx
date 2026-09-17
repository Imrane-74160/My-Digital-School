/**
 * Composant Figma « Pastille » (`45:96`).
 *
 * Information courte en chasse fixe : Niveau (N1/N2), Classe (B3, prêt pour la classe),
 * Montant (forfait). Seule la variante Classe est en anthracite sur texte inverse.
 */

import type { TypePastille } from './variantes'

type Props = {
  type: TypePastille
  libelle: string
  className?: string
}

export function Pastille({ type, libelle, className }: Props) {
  const classe = type === 'Classe'

  return (
    <span
      className={[
        // Géométrie du Figma : padding 7 horizontal, 2 vertical, rayon « pastille ».
        'inline-flex shrink-0 items-center rounded-pastille px-[7px] py-[2px]',
        'font-mono text-[11px] leading-[16px] whitespace-nowrap',
        classe ? 'bg-marque-anthracite text-texte-inverse' : 'bg-surface-pastille text-texte-secondaire',
        className ?? '',
      ].join(' ')}
    >
      {libelle}
    </span>
  )
}
