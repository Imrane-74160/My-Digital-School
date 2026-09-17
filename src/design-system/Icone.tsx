import { ICONES, TAILLES_ICONE, type NomIcone, type TailleIcone } from './icones'

type Props = {
  /** Nom Figma de l'icône, ex. « Casque audio ». */
  nom: NomIcone
  taille?: TailleIcone | undefined
  /** Taille exacte en pixels, quand le Figma en impose une hors de l'échelle (ex. Pictogramme). */
  pixels?: number | undefined
  className?: string | undefined
  /**
   * Étiquette accessible. Sans elle, l'icône est purement décorative et masquée
   * aux lecteurs d'écran — c'est le cas le plus fréquent (le libellé voisin suffit).
   */
  titre?: string
}

/**
 * Icône du design system : trait 1,5 px, couleur héritée de `currentColor`.
 * Les tailles viennent du Figma ; la couleur se pose par une classe de texte
 * (`text-marque-turquoise`, `text-texte-tertiaire`…), jamais en dur.
 */
export function Icone({ nom, taille = 'md', pixels, className, titre }: Props) {
  const Dessin = ICONES[nom]
  const cote = pixels ?? TAILLES_ICONE[taille]

  return (
    <span
      className={className}
      style={{ display: 'inline-flex', width: cote, height: cote }}
      {...(titre === undefined ? { 'aria-hidden': true } : { role: 'img', 'aria-label': titre })}
    >
      <Dessin className="size-full" strokeWidth={1.5} focusable={false} aria-hidden />
    </span>
  )
}
