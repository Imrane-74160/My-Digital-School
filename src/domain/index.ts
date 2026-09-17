/**
 * API publique du domaine. `src/store/`, `src/app-mobile/` et `src/back-office/`
 * n'importent que depuis ici — jamais un fichier interne.
 *
 * Le domaine est pur : ni React, ni DOM, ni store, ni horloge système
 * (une règle ESLint le vérifie).
 */
export type { Action, DonneesNouveauMateriel, TypeAction } from './actions'
export { ACTIONS_PROTEGEES } from './actions'
export { dispatch } from './engine'
export type { Resultat } from './engine'
export { composantDe, euros, forfaitMateriel, manqueDeclare } from './forfait'
export type { Manque } from './forfait'
export * as horloge from './horloge'
export { REFUS, REGLES, regle } from './regles'
export { analyserSeed, chargerSeed, PERSONA_PAR_DEFAUT, verifierCoherence, VERSION_SEED } from './seed'
export * as selecteurs from './selecteurs'
export type { Compteurs, LigneAFaire } from './selecteurs'
export * from './types'
