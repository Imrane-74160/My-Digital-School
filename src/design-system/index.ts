/**
 * Design system : les composants portent les mêmes noms que dans la page
 * « Composants » du Figma (`40:3`), et leurs variantes sont des props typées.
 * Correspondance des noms de props : `docs/04-design-system.md`.
 */
export { Bouton } from './Bouton'
export type { TailleBouton, TypeBouton } from './Bouton'
export { Icone } from './Icone'
export { ICONES, NOMS_ICONES, TAILLES_ICONE, iconePeutEtre } from './icones'
export type { ComposantIcone, NomIcone, ProprietesIcone, TailleIcone } from './icones'
export { Trepied } from './TrepiedIcone'
