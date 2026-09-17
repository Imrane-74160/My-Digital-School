import type { ProprietesIcone } from './icones'

/**
 * « Trépied » — absent de lucide. Tracé relevé sur le nœud Figma du Trépied LeoFoto,
 * replacé sur la grille 24 : colonne centrale puis trois pieds.
 */
export function Trepied({ className, strokeWidth = 1.5, ...reste }: ProprietesIcone) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      {...reste}
    >
      <path d="M12 3v7" />
      <path d="M12 10 6 21" />
      <path d="m12 10 6 11" />
      <path d="M12 10v11" />
    </svg>
  )
}
