/**
 * Composant Figma « Case à cocher » (`46:144`) et son libellé cliquable.
 *
 * Carré de 24 px, rayon 7, trait 1,5 px. Décochée : trait `trait/fort` sur fond blanc,
 * survol en `surface/champ` avec trait `texte/principal`. Cochée : turquoise plein
 * avec une coche de 16 px, survol `état/turquoise-survol`.
 *
 * Le Figma précise « à placer avec un libellé cliquable » : le composant porte donc
 * son libellé et coche la case quand on clique dessus.
 */
import type { ReactNode } from 'react'
import { Icone } from './Icone'

type Props = {
  cochee: boolean
  onChange: (cochee: boolean) => void
  /** Libellé cliquable. Un nœud React pour permettre un lien à l'intérieur. */
  libelle: ReactNode
  disabled?: boolean
  /** Style « Liste » du Figma : le libellé occupe toute la largeur restante. */
  pleineLargeur?: boolean
  className?: string
}

export function CaseACocher({
  cochee,
  onChange,
  libelle,
  disabled = false,
  pleineLargeur = false,
  className,
}: Props) {
  return (
    <label
      className={[
        'group inline-flex items-start gap-md',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        pleineLargeur ? 'w-full' : '',
        className ?? '',
      ].join(' ')}
    >
      <input
        type="checkbox"
        checked={cochee}
        disabled={disabled}
        onChange={(evenement) => onChange(evenement.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={[
          // Géométrie du Figma : 24 px, rayon 7, trait 1,5.
          'mt-[1px] flex size-[24px] shrink-0 items-center justify-center rounded-[7px]',
          'transition-colors duration-base ease-sortie',
          cochee
            ? 'bg-marque-turquoise text-texte-inverse group-hover:bg-etat-turquoise-survol'
            : 'border-[1.5px] border-trait-fort bg-surface-carte group-hover:border-texte-principal group-hover:bg-surface-champ',
          disabled ? 'border-texte-desactive bg-surface-desactive' : '',
          // L'anneau de focus suit le focus clavier de la case masquée.
          'peer-focus-visible:shadow-focus-anneau',
        ].join(' ')}
      >
        {cochee && <Icone nom="Coche" pixels={16} />}
      </span>
      <span
        className={[
          'mds-texte-corps',
          disabled ? 'text-texte-desactive' : 'text-texte-principal',
          pleineLargeur ? 'flex-1' : '',
        ].join(' ')}
      >
        {libelle}
      </span>
    </label>
  )
}
