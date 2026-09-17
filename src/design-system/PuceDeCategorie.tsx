/**
 * Composant Figma « Puce de catégorie » (`61:132`).
 *
 * Puce de filtre mobile (Tout, Studio, Informatique, Cours, Jeux, Boîtes).
 * L'état Active est en anthracite plein ; « Pressée » est le `:active` d'Inactive.
 */

type Props = {
  libelle: string
  active: boolean
  onClick?: () => void
  className?: string
}

export function PuceDeCategorie({ libelle, active, onClick, className }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        // Géométrie du Figma : padding 14/8, rayon 18, libellé Inter 500 13/18.
        'inline-flex shrink-0 items-center rounded-[18px] px-[14px] py-[8px]',
        'font-texte text-[13px] leading-[18px] font-medium whitespace-nowrap',
        'transition-colors duration-appui ease-sortie',
        active
          ? 'bg-marque-anthracite text-texte-inverse'
          : 'bg-surface-bouton-doux text-texte-principal active:bg-etat-doux-presse',
        className ?? '',
      ].join(' ')}
    >
      {libelle}
    </button>
  )
}
