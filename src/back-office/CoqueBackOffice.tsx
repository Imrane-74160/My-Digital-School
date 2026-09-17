import { Outlet } from 'react-router'

/**
 * Coque du back-office : rail du menu principal (11 liens) + barre d'en-tête.
 * Le logo MyDigitalSchool est dans la barre d'en-tête, à gauche du titre de page
 * (cf. `docs/03-ecrans.md`, section B). Squelette en Phase 0, construit en Phase 4.
 */
export function CoqueBackOffice() {
  return (
    <div className="min-h-dvh min-w-[1280px] p-xl">
      <header className="flex items-center gap-lg px-lg py-md" data-testid="en-tete-back-office">
        <p className="mds-texte-corps-fort text-marque-anthracite">MyDigitalSchool</p>
        <p className="mds-texte-petit text-texte-tertiaire">Back-office · Prêts MDS</p>
      </header>
      <div className="flex gap-lg">
        <nav
          data-testid="menu-principal"
          aria-label="Menu principal"
          className="flex w-[92px] shrink-0 flex-col items-center gap-sm rounded-carte bg-marque-anthracite py-xl"
        >
          <p className="mds-mono-micro px-sm text-center text-texte-inverse/60">Menu Phase 4</p>
        </nav>
        <main className="min-w-0 flex-1 rounded-carte bg-surface-carte ring-1 ring-trait-bordure">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
