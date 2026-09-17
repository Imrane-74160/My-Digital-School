/**
 * Composant Figma « Liste déroulante » (`46:100`).
 *
 * Déclencheur : hauteur 40, padding 16 à gauche / 14 à droite, gap 8, rayon « bouton »,
 * fond `surface/bouton-doux` qui passe à `état/doux-survol` au survol et une fois ouverte.
 * Menu : rayon « vignette », ombre d'élévation, options de 150 × 34 au rayon « pastille »,
 * l'option choisie sur `surface/champ` avec une coche de 14 px.
 */
import { useEffect, useRef, useState } from 'react'
import { Icone } from './Icone'

export type OptionListe<Valeur extends string> = {
  valeur: Valeur
  libelle: string
}

type Props<Valeur extends string> = {
  /** Nom du filtre, pour les lecteurs d'écran. */
  etiquette: string
  options: OptionListe<Valeur>[]
  valeur: Valeur
  onChange: (valeur: Valeur) => void
  className?: string
}

export function ListeDeroulante<Valeur extends string>({
  etiquette,
  options,
  valeur,
  onChange,
  className,
}: Props<Valeur>) {
  const [ouverte, setOuverte] = useState(false)
  const conteneur = useRef<HTMLDivElement>(null)
  const choisie = options.find((option) => option.valeur === valeur)

  // Un clic à l'extérieur ou la touche Échap referment le menu.
  useEffect(() => {
    if (!ouverte) return
    const surClic = (evenement: MouseEvent) => {
      if (!conteneur.current?.contains(evenement.target as Node)) setOuverte(false)
    }
    const surTouche = (evenement: KeyboardEvent) => {
      if (evenement.key === 'Escape') setOuverte(false)
    }
    document.addEventListener('mousedown', surClic)
    document.addEventListener('keydown', surTouche)
    return () => {
      document.removeEventListener('mousedown', surClic)
      document.removeEventListener('keydown', surTouche)
    }
  }, [ouverte])

  return (
    <div ref={conteneur} className={`relative inline-block ${className ?? ''}`}>
      <button
        type="button"
        aria-label={etiquette}
        aria-haspopup="listbox"
        aria-expanded={ouverte}
        onClick={() => setOuverte((precedent) => !precedent)}
        className={[
          'inline-flex h-[40px] items-center gap-sm rounded-bouton pl-lg pr-[14px]',
          'font-texte text-[14px] leading-[20px] text-texte-principal whitespace-nowrap',
          'transition-colors duration-rapide ease-sortie',
          ouverte ? 'bg-etat-doux-survol' : 'bg-surface-bouton-doux hover:bg-etat-doux-survol',
        ].join(' ')}
      >
        {choisie?.libelle ?? ''}
        <Icone nom="Chevron bas" pixels={16} />
      </button>

      {ouverte && (
        <ul
          role="listbox"
          aria-label={etiquette}
          className="absolute top-[46px] left-0 z-10 flex flex-col gap-[2px] rounded-vignette bg-surface-carte p-[6px] shadow-elevation"
        >
          {options.map((option) => {
            const active = option.valeur === valeur
            return (
              <li key={option.valeur} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.valeur)
                    setOuverte(false)
                  }}
                  className={[
                    'flex h-[34px] w-[150px] items-center gap-sm rounded-pastille px-[10px] py-sm',
                    'font-texte text-[14px] leading-[20px] text-texte-principal',
                    active ? 'bg-surface-champ' : 'hover:bg-surface-champ',
                  ].join(' ')}
                >
                  <span className="flex-1 text-left whitespace-nowrap">{option.libelle}</span>
                  {active && <Icone nom="Coche" pixels={14} />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
