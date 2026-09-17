/**
 * Composant Figma « Puce de composant » (`45:130`).
 *
 * États : Vérifié, Neutre, Survol, Manquant. « Survol » n'est pas un état à porter en
 * props : c'est le `:hover` de Neutre. La bascule Neutre ↔ Manquant se fait en 200 ms.
 *
 * Deux usages distincts, conformes à l'arbitrage sur B3 :
 * - **lecture seule** (`Vérifié`, sans `onBascule`) : carte de validation d'une remise,
 *   où le contenu est déjà vérifié et les puces ne sont pas cliquables ;
 * - **bascule** (`Neutre`/`Manquant`, avec `onBascule`) : carte de retour et contrôle photo,
 *   où l'équipe marque un composant manquant.
 */
import { Icone } from './Icone'
import type { EtatPuce } from './variantes'

type Props = {
  nom: string
  etat: EtatPuce
  /** Rend la puce cliquable. Absent = puce en lecture seule. */
  onBascule?: () => void
  className?: string
}

/** Géométrie commune relevée au Figma : gap 5, padding 10/5, rayon « vignette » 14. */
const BOITE =
  'inline-flex shrink-0 items-center gap-[5px] rounded-vignette px-[10px] py-[5px] font-texte text-[12px] leading-[16px] whitespace-nowrap'

const TONS: Record<EtatPuce, string> = {
  Vérifié: 'bg-marque-turquoise-clair text-texte-principal',
  // Neutre n'a pas de fond : seulement un trait. Son survol vient du Figma (état « Survol »).
  Neutre: 'border border-trait-fort text-texte-principal',
  Manquant: 'border border-marque-orange bg-marque-orange-clair text-marque-orange-fonce',
}

const SURVOL: Record<EtatPuce, string> = {
  Vérifié: '',
  Neutre: 'hover:border-texte-principal hover:bg-surface-champ',
  Manquant: 'hover:bg-marque-orange-clair',
}

export function PuceDeComposant({ nom, etat, onBascule, className }: Props) {
  const contenu = (
    <>
      {etat === 'Vérifié' && <Icone nom="Coche" taille="xs" />}
      {etat === 'Manquant' && <Icone nom="Croix" taille="xs" />}
      {nom}
    </>
  )

  const classes = [BOITE, TONS[etat], className ?? ''].join(' ')

  if (!onBascule) {
    return <span className={classes}>{contenu}</span>
  }

  return (
    <button
      type="button"
      onClick={onBascule}
      aria-pressed={etat === 'Manquant'}
      className={[classes, SURVOL[etat], 'cursor-pointer transition-colors duration-base ease-sortie'].join(
        ' ',
      )}
    >
      {contenu}
    </button>
  )
}
