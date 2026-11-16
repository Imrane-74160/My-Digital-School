/**
 * Accès au store depuis les écrans.
 *
 * Les écrans d'une surface ne sont rendus qu'une fois la session ouverte : la coque
 * (`DispositionApp`, `CoqueBackOffice`) redirige vers la connexion sinon. `usePersonne…`
 * peut donc renvoyer une `Personne` et non `Personne | null`.
 */
import { selecteurs, type EtatMDS, type Personne, type PersonneId } from '@/domain'
import { useMDS } from './useMDS'

/** L'état du domaine. */
export const useEtat = (): EtatMDS => useMDS((magasin) => magasin.etat)

/** Sélecteur dérivé, recalculé à chaque changement d'état. */
export function useSelecteur<T>(calcul: (etat: EtatMDS) => T): T {
  return useMDS((magasin) => calcul(magasin.etat))
}

/** La session de l'app : `null` tant que personne n'est connecté. */
export const useSessionApp = (): PersonneId | null => useMDS((magasin) => magasin.sessionApp)

/** La session du back-office. */
export const useSessionAdmin = (): PersonneId | null => useMDS((magasin) => magasin.sessionAdmin)

/** La personne connectée à l'app. À n'appeler que sous la coque, qui garantit la session. */
export function usePersonaApp(): Personne {
  const id = useSessionApp()
  const etat = useEtat()
  if (id === null) throw new Error('Aucune session : cet écran doit vivre sous DispositionApp.')
  return selecteurs.personne(etat, id)
}

/** La personne connectée au back-office. */
export function useUtilisateurBO(): Personne {
  const id = useSessionAdmin()
  const etat = useEtat()
  if (id === null) throw new Error('Aucune session : cet écran doit vivre sous CoqueBackOffice.')
  return selecteurs.personne(etat, id)
}
