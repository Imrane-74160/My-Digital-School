/**
 * Composant Figma « En-tête de carte » (`49:129`).
 *
 * En-tête commun à toutes les cartes du back-office : pictogramme rond en contour de
 * 40 px, titre `Titre/Carte` (18/24), sous-titre `Texte/Petit` en `texte/secondaire`,
 * et le bouton « Plus d'options » à droite. Hauteur 60, padding 18 en haut / 12 en bas
 * et 20 sur les côtés. Le Figma précise de l'étirer sur toute la largeur de la carte.
 */
import type { ReactNode } from 'react'
import { BoutonIcone } from './BoutonIcone'
import { Icone } from './Icone'
import type { NomIcone } from './icones'

type Props = {
  icone: NomIcone
  titre: string
  sousTitre?: string
  /** Affiche le bouton « Plus d'options ». */
  options?: () => void
  /** Contenu libre posé à droite, avant les options : onglets, filtre, bouton. */
  aDroite?: ReactNode
  className?: string
}

export function EnTeteDeCarte({ icone, titre, sousTitre, options, aDroite, className }: Props) {
  return (
    <header
      className={['flex min-h-[60px] items-center gap-md px-xl pt-[18px] pb-md', className ?? ''].join(' ')}
    >
      {/* Pictogramme en contour, distinct du composant Pictogramme : 40 px et trait sombre. */}
      <span
        aria-hidden
        className="inline-flex size-[40px] shrink-0 items-center justify-center rounded-rond border border-texte-principal text-texte-principal"
      >
        <Icone nom={icone} pixels={22} />
      </span>

      <div className="flex min-w-0 flex-1 flex-col">
        <p className="mds-titre-carte truncate text-texte-principal">{titre}</p>
        {sousTitre && <p className="mds-texte-petit truncate text-texte-secondaire">{sousTitre}</p>}
      </div>

      {aDroite}
      {options && <BoutonIcone icone="Plus d'options" titre={`Options · ${titre}`} onClick={options} />}
    </header>
  )
}
