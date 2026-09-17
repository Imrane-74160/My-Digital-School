/**
 * Composants Figma « Barre de navigation mobile » (`61:155`) et
 * « Onglet de navigation mobile » (`49:124`).
 *
 * Barre flottante anthracite de 358 px au rayon 36, padding 10/8, cinq onglets de 56 px
 * répartis par `justify-between`. Trois apparences d'onglet :
 * - **Actif** : fond `marque/turquoise`, icône sombre ;
 * - **Inactif** : sans fond, icône en `texte/inverse` sur l'anthracite ;
 * - **Scanner** : fond blanc et icône sombre, c'est le bouton central.
 */
import { NavLink } from 'react-router'
import { Icone } from './Icone'
import { ONGLETS_MOBILES, type OngletMobile } from './variantes'

type Props = {
  onglets?: OngletMobile[]
  /** Onglets portant une pastille de non-lu, par libellé. */
  avecPastille?: string[]
  className?: string
}

export function BarreDeNavigationMobile({ onglets = ONGLETS_MOBILES, avecPastille = [], className }: Props) {
  return (
    <nav
      aria-label="Navigation principale"
      className={[
        'flex w-[358px] items-center justify-between rounded-carte bg-marque-anthracite px-[10px] py-sm',
        className ?? '',
      ].join(' ')}
    >
      {onglets.map(({ vers, icone, libelle, scanner }) => (
        <NavLink
          key={libelle}
          to={vers}
          end={vers === '/app'}
          aria-label={libelle}
          className={({ isActive }) =>
            [
              'relative inline-flex size-[56px] items-center justify-center rounded-rond',
              'transition-[background-color,transform] duration-appui ease-sortie active:scale-95',
              scanner
                ? 'bg-surface-carte text-texte-principal'
                : isActive
                  ? 'bg-marque-turquoise text-texte-principal'
                  : 'text-texte-inverse',
            ].join(' ')
          }
        >
          <Icone nom={icone} taille="3xl" />
          {avecPastille.includes(libelle) && (
            <span
              aria-hidden
              className="absolute top-[14px] right-[14px] size-[10px] rounded-rond bg-marque-orange"
            />
          )}
        </NavLink>
      ))}
    </nav>
  )
}
