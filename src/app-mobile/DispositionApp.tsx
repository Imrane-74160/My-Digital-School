import { Outlet, useLocation } from 'react-router'
import { horloge } from '@/domain'
import { BarreDeNavigationMobile, BarreDEtat } from '@/design-system'
import { useEtat, usePersonaApp } from '@/store/hooks'
import { CadreTelephone } from './CadreTelephone'

/**
 * Écrans où le Figma masque la barre de navigation (cf. `docs/03-ecrans.md`, section A) :
 * ils occupent toute la hauteur du téléphone.
 */
const SANS_BARRE_DE_NAVIGATION = ['/app/connexion', '/app/charte', '/app/scanner', '/app/signaler'] as const

function afficheBarreDeNavigation(chemin: string): boolean {
  if (chemin.startsWith('/app/rendre')) return false
  return !SANS_BARRE_DE_NAVIGATION.some((sans) => chemin === sans)
}

export function DispositionApp() {
  const { pathname } = useLocation()
  const etat = useEtat()
  const persona = usePersonaApp()
  const avecBarre = afficheBarreDeNavigation(pathname)

  const nonLues = etat.notifications.filter((n) => n.pour.includes(persona.id) && !n.lue).length

  return (
    <CadreTelephone>
      <BarreDEtat heure={horloge.heure(etat.horloge.maintenant)} />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      {avecBarre && (
        <div
          data-testid="zone-navigation"
          className="flex h-[102px] shrink-0 items-center justify-center px-lg"
        >
          <BarreDeNavigationMobile avecPastille={nonLues > 0 ? ['Alertes'] : []} />
        </div>
      )}
    </CadreTelephone>
  )
}
