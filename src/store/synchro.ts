/**
 * Synchronisation entre onglets : ouvrir l'app mobile et le back-office côte à côte
 * dans deux onglets doit montrer le même état, sans rechargement.
 *
 * L'événement `storage` ne se déclenche que dans les AUTRES onglets que celui qui a
 * écrit : il n'y a donc pas de boucle de réhydratation.
 */
import { CLE_PERSISTANCE, useMDS } from './useMDS'

export function brancherSynchroEntreOnglets(): () => void {
  const surChangement = (evenement: StorageEvent) => {
    if (evenement.key !== null && evenement.key !== CLE_PERSISTANCE) return
    void useMDS.persist.rehydrate()
  }
  window.addEventListener('storage', surChangement)
  return () => window.removeEventListener('storage', surChangement)
}
