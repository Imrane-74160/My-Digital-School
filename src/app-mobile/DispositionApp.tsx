import { Navigate, Outlet, useLocation } from 'react-router'
import { horloge } from '@/domain'
import { BarreDeNavigationMobile, BarreDEtat } from '@/design-system'
import { useEtat, usePersonaApp, useSessionApp } from '@/store/hooks'
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
  const session = useSessionApp()
  const etat = useEtat()

  // Sans session, un seul écran est accessible : la connexion.
  if (session === null) {
    return (
      <CadreTelephone>
        <BarreDEtat heure={horloge.heure(etat.horloge.maintenant)} />
        <main className="flex-1 overflow-y-auto overscroll-y-contain">
          {pathname === '/app/connexion' ? <Outlet /> : <Navigate to="/app/connexion" replace />}
        </main>
      </CadreTelephone>
    )
  }

  return <AppConnectee chemin={pathname} />
}

/** La coque de l'app une fois la session ouverte : barre d'état, écran, navigation. */
function AppConnectee({ chemin }: { chemin: string }) {
  const etat = useEtat()
  const persona = usePersonaApp()
  const avecBarre = afficheBarreDeNavigation(chemin)
  const nonLues = etat.notifications.filter((n) => n.pour.includes(persona.id) && !n.lue).length

  // La charte s'accepte à la première connexion, avant tout le reste (R03).
  const doitAccepterLaCharte = persona.charteAcceptee === null && chemin !== '/app/charte'
  // Déjà connecté : l'écran de connexion n'a plus lieu d'être.
  const dejaConnecte = chemin === '/app/connexion'

  return (
    <CadreTelephone>
      <BarreDEtat heure={horloge.heure(etat.horloge.maintenant)} />
      {/* `overscroll-y-contain` : le rebond du défilement ne tire plus la page entière. */}
      <main className="flex-1 overflow-y-auto overscroll-y-contain">
        {doitAccepterLaCharte ? (
          <Navigate to="/app/charte" replace />
        ) : dejaConnecte ? (
          <Navigate to="/app" replace />
        ) : (
          <Outlet />
        )}
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
