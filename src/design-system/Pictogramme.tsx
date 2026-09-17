/**
 * Composant Figma « Pictogramme » (`59:150`).
 *
 * Vignette (carré, rayon 14) ou pictogramme (rond) portant une icône.
 * Vérifié sur la capture du Figma : **seul le fond est teinté**, l'icône reste
 * en `texte/principal` sur les sept teintes. La boîte va de 32 à 56 px et
 * l'icône occupe la moitié de la boîte (22 px dans une boîte de 44).
 */
import { Icone } from './Icone'
import type { NomIcone } from './icones'
import type { FormePictogramme, TaillePictogramme, TeintePictogramme } from './variantes'

const FONDS: Record<TeintePictogramme, string> = {
  Neutre: 'bg-surface-champ',
  Turquoise: 'bg-marque-turquoise-clair',
  Bleu: 'bg-marque-bleu-clair',
  Orange: 'bg-marque-orange-clair',
  Rose: 'bg-marque-rose-clair',
  Blanc: 'bg-surface-carte',
  Contour: 'border border-texte-principal',
}

type Props = {
  icone: NomIcone
  forme?: FormePictogramme
  teinte?: TeintePictogramme
  taille?: TaillePictogramme
  /** Nom accessible. Sans lui, le pictogramme est décoratif. */
  titre?: string
  className?: string
}

export function Pictogramme({
  icone,
  forme = 'Carré',
  teinte = 'Neutre',
  taille = 44,
  titre,
  className,
}: Props) {
  return (
    <span
      className={[
        'inline-flex shrink-0 items-center justify-center text-texte-principal',
        forme === 'Rond' ? 'rounded-rond' : 'rounded-vignette',
        FONDS[teinte],
        className ?? '',
      ].join(' ')}
      style={{ width: taille, height: taille }}
      {...(titre === undefined ? { 'aria-hidden': true } : { role: 'img', 'aria-label': titre })}
    >
      <Icone nom={icone} pixels={Math.round(taille / 2)} />
    </span>
  )
}
