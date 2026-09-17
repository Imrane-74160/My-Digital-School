/**
 * Composant Figma « Interrupteur » (`89:425`).
 *
 * Relevé dans les SVG exportés : piste 44 × 26 entièrement arrondie, curseur blanc de
 * 20 px de diamètre à 3 px des bords. Activé, la piste est `marque/turquoise` et le
 * curseur est à droite ; coupé, la piste est `trait/fort` et le curseur à gauche.
 * La bascule dure 200 ms.
 */

type Props = {
  active: boolean
  onChange: (active: boolean) => void
  /** Étiquette accessible : l'interrupteur n'a pas de libellé visible. */
  etiquette: string
  disabled?: boolean
  className?: string
}

export function Interrupteur({ active, onChange, etiquette, disabled = false, className }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={etiquette}
      disabled={disabled}
      onClick={() => onChange(!active)}
      className={[
        // Piste 44 × 26, curseur à 3 px des bords.
        'relative inline-flex h-[26px] w-[44px] shrink-0 items-center rounded-rond p-[3px]',
        'transition-colors duration-base ease-sortie',
        disabled
          ? 'cursor-not-allowed bg-surface-desactive'
          : active
            ? 'bg-marque-turquoise'
            : 'bg-trait-fort',
        className ?? '',
      ].join(' ')}
    >
      <span
        aria-hidden
        className={[
          'block size-[20px] rounded-rond bg-surface-carte',
          'transition-transform duration-base ease-sortie',
          // 31 − 13 = 18 px entre les deux positions du curseur.
          active ? 'translate-x-[18px]' : 'translate-x-0',
        ].join(' ')}
      />
    </button>
  )
}
