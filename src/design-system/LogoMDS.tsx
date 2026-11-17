/**
 * Logo MyDigitalSchool.
 *
 * Le tracé vient de `reference/charte/` : c'est la charte de l'école, pas un composant
 * Figma à redessiner. Il apparaît sur les deux écrans de connexion (`91:711`, `14:950`)
 * et dans la barre d'en-tête du back-office.
 */
import logo from '@/assets/logo-mydigitalschool.svg'

/** Rapport du tracé d'origine (150 × 88) : la largeur se déduit de la hauteur. */
const RAPPORT = 150 / 88

export function LogoMDS({ hauteur = 40, className }: { hauteur?: number; className?: string }) {
  return (
    <img
      src={logo}
      alt="MyDigitalSchool"
      width={Math.round(hauteur * RAPPORT)}
      height={hauteur}
      className={className}
      style={{ height: hauteur, width: 'auto' }}
    />
  )
}
