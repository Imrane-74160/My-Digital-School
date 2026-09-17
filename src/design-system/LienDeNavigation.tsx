/**
 * Composant Figma « Lien de navigation » (`49:107`).
 *
 * Lien du rail du back-office : cercle de 48 px, icône de 21 px, sans libellé visible.
 * Variables liées relevées sur le nœud : l'icône est en `texte/inverse` au repos et en
 * `texte/principal` quand le lien est actif, sur un fond `marque/turquoise`.
 * Le survol pose `état/nav-survol` et fait apparaître l'infobulle à droite, en 120 ms.
 */
import { Link } from 'react-router'
import { Icone } from './Icone'
import { Infobulle } from './Infobulle'
import type { NomIcone } from './icones'

type Props = {
  icone: NomIcone
  libelle: string
  vers: string
  actif: boolean
}

export function LienDeNavigation({ icone, libelle, vers, actif }: Props) {
  return (
    <span className="group relative inline-flex">
      <Link
        to={vers}
        aria-label={libelle}
        aria-current={actif ? 'page' : undefined}
        className={[
          'inline-flex size-[48px] items-center justify-center rounded-rond',
          'transition-colors duration-rapide ease-sortie',
          actif ? 'bg-marque-turquoise text-texte-principal' : 'text-texte-inverse hover:bg-etat-nav-survol',
        ].join(' ')}
      >
        <Icone nom={icone} pixels={21} />
      </Link>

      {/* Le Figma place la bulle 10 px à droite du cercle, centrée verticalement. */}
      <span className="pointer-events-none absolute top-1/2 left-[58px] z-20 -translate-y-1/2 opacity-0 transition-opacity duration-rapide ease-sortie group-hover:opacity-100 group-focus-within:opacity-100">
        <Infobulle libelle={libelle} />
      </span>
    </span>
  )
}
