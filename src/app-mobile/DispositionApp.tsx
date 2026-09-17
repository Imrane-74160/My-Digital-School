import { Outlet, useLocation } from 'react-router'
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
  const avecBarre = afficheBarreDeNavigation(pathname)

  return (
    <CadreTelephone>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      {avecBarre && (
        <div
          data-testid="zone-navigation"
          className="flex h-[102px] shrink-0 items-center justify-center px-lg"
        >
          <p className="mds-texte-petit w-full rounded-carte-mobile bg-surface-bouton-doux py-lg text-center text-texte-tertiaire">
            Barre de navigation · Phase 3
          </p>
        </div>
      )}
    </CadreTelephone>
  )
}
