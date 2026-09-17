import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/polices'
import './styles/index.css'
import { App } from './App'
import { brancherSynchroEntreOnglets } from './store/synchro'

// App mobile et back-office ouverts côte à côte dans deux onglets restent synchronisés.
brancherSynchroEntreOnglets()

const racine = document.getElementById('racine')
if (!racine) throw new Error('Élément #racine introuvable dans index.html')

createRoot(racine).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
