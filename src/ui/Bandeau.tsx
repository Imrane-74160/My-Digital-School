/**
 * Bandeau de résultat : après chaque action, le message du moteur de règles.
 *
 * Un refus porte un code de règle (R01…), utile en test et en relecture mais sans
 * intérêt pour l'utilisateur : il est posé en attribut `data-regle`, pas à l'écran.
 */
import { useEffect } from 'react'
import { Icone } from '@/design-system'
import { useMDS } from '@/store/useMDS'

const DUREE_AFFICHAGE = 6000

export function Bandeau() {
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
      data-regle={resultat.regle ?? ''}
      className="fixed inset-x-lg bottom-lg z-40 mx-auto flex max-w-[520px] items-start gap-md rounded-carte bg-surface-carte p-lg shadow-elevation ring-1 ring-trait-bordure sm:right-lg sm:left-auto"
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
        {!resultat.ok && <p className="mds-texte-petit-fort text-marque-rose-fonce">Action impossible</p>}
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
