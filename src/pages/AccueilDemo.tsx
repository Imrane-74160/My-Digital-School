/**
 * Page `/` de la démo : le choix de la surface, plus le QR code vers `/app` pour
 * ouvrir le prototype sur un téléphone (cf. `docs/03-ecrans.md`, section C).
 */
import { Link } from 'react-router'
import { Columns2, LayoutDashboard, Smartphone } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { horloge } from '@/domain'
import { MotifQR } from '@/design-system'
import { useEtat } from '@/store/hooks'

type Surface = {
  to: string
  icone: LucideIcon
  titre: string
  detail: string
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
    to: '/cote-a-cote',
    icone: Columns2,
    titre: 'Côte à côte',
    detail: 'Les deux surfaces sur le même état',
  },
]

export function AccueilDemo() {
  const etat = useEtat()
  // L'adresse du QR est celle de la fenêtre : elle marche aussi sur un déploiement statique.
  const adresseApp = `${typeof window === 'undefined' ? '' : window.location.origin}/app`

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
        {SURFACES.map(({ to, icone: Icone, titre, detail }) => (
          <li key={titre}>
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
          </li>
        ))}
      </ul>

      <section className="flex items-center gap-xl rounded-carte bg-surface-carte p-xl ring-1 ring-trait-bordure">
        <span className="shrink-0 rounded-vignette bg-surface-carte p-sm ring-1 ring-trait-bordure">
          <MotifQR code={adresseApp} taille={120} />
        </span>
        <div className="flex min-w-0 flex-col gap-xs">
          <p className="mds-titre-carte text-texte-principal">Ouvrir sur un téléphone</p>
          <p className="mds-texte-petit text-texte-secondaire">
            Le prototype tourne sans serveur : ouvre <span className="mds-mono-code">/app</span> sur ton
            téléphone, sur le même réseau, et il s’affiche en plein écran.
          </p>
          <p className="mds-mono-micro break-all text-texte-tertiaire">{adresseApp}</p>
        </div>
      </section>

      <footer className="flex flex-wrap items-center gap-lg">
        <Link className="mds-texte-petit-fort text-marque-turquoise-fonce underline" to="/design-system">
          Galerie du design system
        </Link>
        <p className="mds-mono-micro text-texte-tertiaire">
          Prototype sans serveur · données locales · {horloge.jourLong(etat.horloge.maintenant)}{' '}
          {horloge.heure(etat.horloge.maintenant)}
        </p>
      </footer>
    </main>
  )
}
