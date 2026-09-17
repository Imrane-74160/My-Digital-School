/**
 * Mode « Côte à côte » — `/cote-a-cote` (panneau de démo, `docs/03-ecrans.md` section C).
 *
 * Les deux surfaces dans la même fenêtre, chacune dans son propre document : la
 * synchronisation passe par l'événement `storage`, exactement comme entre deux
 * onglets. Une action jouée à gauche se voit à droite sans rechargement.
 *
 * Le back-office demande 1280 px : sur une fenêtre plus étroite, il est mis à
 * l'échelle plutôt que tronqué.
 */
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Icone } from '@/design-system'

const LARGEUR_APP = 390
const LARGEUR_BO = 1280

export function CoteACote() {
  const conteneur = useRef<HTMLDivElement>(null)
  const [echelle, setEchelle] = useState(1)

  // Le back-office garde sa largeur de maquette : on l'ajuste par une mise à l'échelle.
  useEffect(() => {
    const mesurer = () => {
      const disponible = (conteneur.current?.clientWidth ?? LARGEUR_BO) - LARGEUR_APP - 24
      setEchelle(Math.min(1, Math.max(0.5, disponible / LARGEUR_BO)))
    }
    mesurer()
    window.addEventListener('resize', mesurer)
    return () => window.removeEventListener('resize', mesurer)
  }, [])

  return (
    <main className="flex min-h-dvh flex-col gap-md p-lg">
      <header className="flex items-center gap-md">
        <Link
          to="/"
          aria-label="Retour à l’accueil de la démo"
          className="inline-flex size-[40px] items-center justify-center rounded-rond bg-surface-bouton-doux text-texte-principal"
        >
          <Icone nom="Retour" taille="xl" />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col">
          <h1 className="mds-titre-carte text-texte-principal">Côte à côte</h1>
          <p className="mds-texte-petit text-texte-tertiaire">
            App mobile et back-office sur le même état · synchronisés par l’événement `storage`
          </p>
        </div>
      </header>

      <div ref={conteneur} className="flex min-h-0 flex-1 items-start gap-lg">
        <iframe
          title="App mobile"
          src="/app"
          className="shrink-0 rounded-carte bg-surface-carte shadow-elevation"
          style={{ width: LARGEUR_APP, height: 844 }}
        />

        <div
          className="min-w-0 flex-1 overflow-hidden rounded-carte"
          style={{ height: 844 }}
          data-testid="cadre-back-office"
        >
          <iframe
            title="Back-office"
            src="/admin"
            className="origin-top-left border-0 bg-surface-carte"
            style={{
              width: LARGEUR_BO,
              height: 844 / echelle,
              transform: `scale(${echelle})`,
            }}
          />
        </div>
      </div>
    </main>
  )
}
