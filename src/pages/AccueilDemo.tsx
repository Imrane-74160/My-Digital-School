import { Link } from 'react-router'
import { LayoutDashboard, Smartphone, Columns2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type Surface = {
  to: string
  icone: LucideIcon
  titre: string
  detail: string
  desactive?: boolean
}

const SURFACES: Surface[] = [
  {
    to: '/app',
    icone: Smartphone,
    titre: 'App mobile',
    detail: 'Élèves et intervenants · 390 × 844',
  },
  {
    to: '/admin',
    icone: LayoutDashboard,
    titre: 'Back-office',
    detail: 'Équipe pédagogique et direction · 1440 × 839',
  },
  {
    to: '/',
    icone: Columns2,
    titre: 'Côte à côte',
    detail: 'Les deux surfaces en même temps · Phase 5',
    desactive: true,
  },
]

export function AccueilDemo() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[880px] flex-col justify-center gap-3xl p-2xl">
      <header className="flex flex-col gap-sm">
        <p className="mds-mono-micro text-texte-tertiaire">MyDigitalSchool · prototype</p>
        <h1 className="mds-titre-page text-texte-principal">Prêts MDS</h1>
        <p className="mds-texte-corps text-texte-secondaire">
          Emprunte le matériel de l’école en 30 secondes. Scanne, emprunte, rends le soir avec une photo.
        </p>
      </header>

      <ul className="grid gap-lg sm:grid-cols-3">
        {SURFACES.map(({ to, icone: Icone, titre, detail, desactive }) => (
          <li key={titre}>
            {desactive ? (
              <div
                aria-disabled="true"
                className="flex h-full flex-col gap-md rounded-carte bg-surface-carte/60 p-xl ring-1 ring-trait-bordure"
              >
                <Icone aria-hidden strokeWidth={1.5} className="size-2xl text-texte-desactive" />
                <p className="mds-titre-carte text-texte-desactive">{titre}</p>
                <p className="mds-texte-petit text-texte-desactive">{detail}</p>
              </div>
            ) : (
              <Link
                to={to}
                className="
                  flex h-full flex-col gap-md rounded-carte bg-surface-carte p-xl ring-1 ring-trait-bordure
                  transition-shadow duration-rapide ease-sortie hover:shadow-douce
                "
              >
                <Icone aria-hidden strokeWidth={1.5} className="size-2xl text-marque-turquoise" />
                <p className="mds-titre-carte text-texte-principal">{titre}</p>
                <p className="mds-texte-petit text-texte-secondaire">{detail}</p>
              </Link>
            )}
          </li>
        ))}
      </ul>

      <footer className="flex flex-wrap items-center gap-lg">
        <Link className="mds-texte-petit-fort text-marque-turquoise-fonce underline" to="/design-system">
          Galerie du design system
        </Link>
        <p className="mds-mono-micro text-texte-tertiaire">
          Prototype sans serveur · données locales · jeudi 17 septembre 2026, 10:15
        </p>
      </footer>
    </main>
  )
}
