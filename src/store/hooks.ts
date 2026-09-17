/**
 * Accès au store depuis les écrans. Les composants ne touchent jamais `dispatch`
 * directement : ils passent par `useExecuter`, qui alimente aussi le toast de démo.
 */
import { selecteurs, type Action, type EtatMDS, type Personne } from '@/domain'
import { useMDS } from './useMDS'

/** L'état du domaine. */
export const useEtat = (): EtatMDS => useMDS((magasin) => magasin.etat)

/** Sélecteur dérivé, recalculé à chaque changement d'état. */
export function useSelecteur<T>(calcul: (etat: EtatMDS) => T): T {
  return useMDS((magasin) => calcul(magasin.etat))
}

/** Joue une action du domaine et met à jour le toast. */
export const useExecuter = (): ((
  action: Action,
) => ReturnType<typeof useMDS.getState>['executer'] extends (a: Action) => infer R ? R : never) =>
  useMDS((magasin) => magasin.executer)

/** La persona connectée dans l'app mobile. */
export function usePersonaApp(): Personne {
  const id = useMDS((magasin) => magasin.personaApp)
  const etat = useEtat()
  return selecteurs.personne(etat, id)
}

/** L'utilisateur connecté au back-office. */
export function useUtilisateurBO(): Personne {
  const id = useMDS((magasin) => magasin.utilisateurBO)
  const etat = useEtat()
  return selecteurs.personne(etat, id)
}
