/**
 * Composant Figma « Infobulle » (`49:81`).
 *
 * Bulle sombre affichée au survol d'un lien de la barre latérale du back-office,
 * dont les liens n'ont pas de libellé visible. Padding 10/6, rayon « pastille »,
 * ombre d'élévation, libellé Inter 500 12/16 en `texte/inverse`.
 */

type Props = {
  libelle: string
  className?: string
}

export function Infobulle({ libelle, className }: Props) {
  return (
    <span
      role="tooltip"
      className={[
        'pointer-events-none inline-flex items-center rounded-pastille px-[10px] py-[6px]',
        'bg-texte-principal text-texte-inverse shadow-elevation',
        'font-texte text-[12px] leading-[16px] font-medium whitespace-nowrap',
        className ?? '',
      ].join(' ')}
    >
      {libelle}
    </span>
  )
}
