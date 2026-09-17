/**
 * Composant Figma « Champ » (`46:128`).
 *
 * Champ de recherche ou de saisie. États relevés : Défaut et Rempli portent un trait
 * `trait/bordure`, Survol passe à `trait/fort`, Focus à un trait turquoise de 2 px
 * doublé de l'anneau `Focus/Anneau`. Le placeholder est en `texte/tertiaire`,
 * la valeur saisie en `texte/principal`.
 */
import type { InputHTMLAttributes } from 'react'
import { Icone } from './Icone'
import type { NomIcone } from './icones'

type Props = {
  /** Étiquette accessible : le Figma n'affiche pas de label au-dessus du champ. */
  etiquette: string
  valeur: string
  onChange: (valeur: string) => void
  placeholder?: string
  /** Icône à gauche, ex. « Loupe » pour une recherche. */
  icone?: NomIcone
  /** Le Figma dessine 320 px ; la plupart des écrans l'étirent sur toute la largeur. */
  pleineLargeur?: boolean
  className?: string
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'placeholder' | 'className' | 'aria-label'
>

export function Champ({
  etiquette,
  valeur,
  onChange,
  placeholder,
  icone,
  pleineLargeur = false,
  className,
  ...reste
}: Props) {
  return (
    <div
      className={[
        // Géométrie du Figma : hauteur 48, padding 16 à gauche / 18 à droite, gap 10, rayon « champ ».
        'flex h-[48px] items-center gap-[10px] rounded-champ pl-lg pr-[18px]',
        'border border-trait-bordure bg-surface-carte',
        'transition-colors duration-rapide ease-sortie',
        'hover:border-trait-fort',
        // Le trait de focus est porté par le conteneur, l'anneau par la règle globale.
        'focus-within:border-2 focus-within:border-marque-turquoise focus-within:shadow-focus-anneau',
        // Le trait de focus fait 2 px : on retire 1 px de padding pour que la boîte ne bouge pas.
        'focus-within:pl-[15px] focus-within:pr-[17px]',
        pleineLargeur ? 'w-full' : 'w-[320px]',
        className ?? '',
      ].join(' ')}
    >
      {icone && <Icone nom={icone} taille="lg" className="text-texte-tertiaire" />}
      <input
        type="text"
        aria-label={etiquette}
        value={valeur}
        placeholder={placeholder}
        onChange={(evenement) => onChange(evenement.target.value)}
        className={[
          'min-w-0 flex-1 bg-transparent outline-none',
          'font-texte text-[14px] leading-[20px] text-texte-principal',
          'placeholder:text-texte-tertiaire',
          // L'anneau est déjà posé sur le conteneur : pas de double anneau.
          'focus-visible:shadow-none',
        ].join(' ')}
        {...reste}
      />
    </div>
  )
}
