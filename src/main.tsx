import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/polices'
import './styles/index.css'
import { App } from './App'
import { brancherSynchroEntreOnglets } from './store/synchro'
import { useMDS } from './store/useMDS'

// App mobile et back-office ouverts côte à côte dans deux onglets restent synchronisés.
brancherSynchroEntreOnglets()

/**
 * Poignée de service, exposée à la console du navigateur. Elle ne donne accès à rien
 * de plus que ce que l'utilisateur a déjà dans son propre navigateur, et sert à deux
 * choses : rejouer une échéance pendant une présentation
 * (`__mds.getState().executer({ type: 'FIN_DE_JOURNEE' })`) et repartir d'un état
 * propre (`__mds.getState().reinitialiser()`). Les tests de bout en bout s'en servent
 * aussi pour avancer le temps, que l'interface ne permet plus de faire.
 */
declare global {
  interface Window {
    __mds: typeof useMDS
  }
}
window.__mds = useMDS

const racine = document.getElementById('racine')
if (!racine) throw new Error('Élément #racine introuvable dans index.html')

createRoot(racine).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
