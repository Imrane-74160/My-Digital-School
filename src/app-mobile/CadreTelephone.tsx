import type { ReactNode } from 'react'

/**
 * Chrome de démonstration (hors produit) : sur ordinateur l'app s'affiche dans un cadre
 * de téléphone à la taille exacte de la maquette Figma (390 × 844) ; sous 500 px de large,
 * elle occupe tout l'écran. Les deux seules valeurs littérales autorisées ici sont
 * les dimensions de la maquette, citées dans CLAUDE.md.
 */
export function CadreTelephone({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh justify-center min-[500px]:items-center min-[500px]:p-2xl">
      <div
        data-testid="cadre-telephone"
        className="
          relative flex min-h-dvh w-full flex-col overflow-hidden
          min-[500px]:h-[844px] min-[500px]:min-h-[844px] min-[500px]:w-[390px]
          min-[500px]:rounded-carte min-[500px]:shadow-elevation
          min-[500px]:ring-1 min-[500px]:ring-trait-bordure
        "
        style={{ backgroundImage: 'var(--mds-fond-ecran)' }}
      >
        {children}
      </div>
    </div>
  )
}
