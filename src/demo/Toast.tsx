/**
 * Toast de résultat : après chaque action, il affiche Accepté ou Refusé, le message
 * du moteur et le code de la règle (R01…), comme le demande `docs/03-ecrans.md`.
 */
import { useEffect } from 'react'
import { Icone } from '@/design-system'
import { useMDS } from '@/store/useMDS'

const DUREE_AFFICHAGE = 6000

export function Toast() {
  const resultat = useMDS((magasin) => magasin.dernierResultat)
  const effacer = useMDS((magasin) => magasin.effacerResultat)

  useEffect(() => {
    if (!resultat) return
    const minuteur = setTimeout(effacer, DUREE_AFFICHAGE)
    return () => clearTimeout(minuteur)
  }, [resultat, effacer])

  if (!resultat) return null

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="toast"
      data-resultat={resultat.ok ? 'accepte' : 'refuse'}
      className="fixed inset-x-lg bottom-lg z-40 mx-auto flex max-w-[520px] items-start gap-md rounded-carte bg-surface-carte p-lg shadow-elevation ring-1 ring-trait-bordure sm:left-auto sm:right-lg"
    >
      <span
        className={[
          'inline-flex size-[36px] shrink-0 items-center justify-center rounded-rond',
          resultat.ok
            ? 'bg-marque-turquoise-clair text-marque-turquoise-fonce'
            : 'bg-marque-rose-clair text-marque-rose-fonce',
        ].join(' ')}
      >
        <Icone nom={resultat.ok ? 'Coche' : 'Interdit'} taille="xl" />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-xs">
        <p className="mds-texte-petit-fort text-texte-tertiaire">
          {resultat.ok ? 'Accepté' : 'Refusé'}
          {resultat.regle && <span className="mds-mono-micro"> · {resultat.regle}</span>}
        </p>
        <p className="mds-texte-corps text-texte-principal">{resultat.msg}</p>
      </div>

      <button
        type="button"
        onClick={effacer}
        aria-label="Fermer"
        className="inline-flex size-[28px] shrink-0 items-center justify-center rounded-rond text-texte-tertiaire"
      >
        <Icone nom="Croix" taille="lg" />
      </button>
    </div>
  )
}
