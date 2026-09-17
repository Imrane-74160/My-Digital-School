import { createBrowserRouter } from 'react-router'
import { AccueilDemo } from './pages/AccueilDemo'
import { EcranEnChantier } from './pages/EcranEnChantier'
import { Introuvable } from './pages/Introuvable'
import { DispositionApp } from './app-mobile/DispositionApp'
import { CoqueBackOffice } from './back-office/CoqueBackOffice'
import { GalerieDesignSystem } from './design-system/GalerieDesignSystem'

/** Une fiche d'écran de `docs/03-ecrans.md` : code, chemin, titre, nœud Figma. */
type Fiche = { code: string; chemin: string; titre: string; noeud: string }

/** A1 → A10, page Figma « App mobile » (15:3). */
export const ECRANS_APP: Fiche[] = [
  { code: 'A3', chemin: '', titre: 'Accueil', noeud: '28:2' },
  { code: 'A1', chemin: 'connexion', titre: 'Connexion', noeud: '91:711' },
  { code: 'A2', chemin: 'charte', titre: 'Charte', noeud: '91:838' },
  { code: 'A4', chemin: 'materiel', titre: 'Matériel', noeud: '29:2' },
  { code: 'A5', chemin: 'materiel/:itemId', titre: 'Fiche matériel', noeud: '30:2' },
  { code: 'A6', chemin: 'rendre/:itemId', titre: 'Rendre', noeud: '31:2' },
  { code: 'A7', chemin: 'scanner', titre: 'Scanner', noeud: '92:757' },
  { code: 'A8', chemin: 'signaler', titre: 'Signaler', noeud: '92:874' },
  { code: 'A9', chemin: 'alertes', titre: 'Alertes', noeud: '93:809' },
  { code: 'A10', chemin: 'profil', titre: 'Profil', noeud: '93:942' },
]

/** B2 → B12, page Figma « Back-office » (15:2). B1 vit hors de la coque. */
export const ECRANS_BACK_OFFICE: Fiche[] = [
  { code: 'B2', chemin: '', titre: 'Tableau de bord', noeud: '8:950' },
  { code: 'B3', chemin: 'validations', titre: 'Validations sur place', noeud: '19:2' },
  { code: 'B4', chemin: 'controle-photo', titre: 'Contrôle photo', noeud: '22:2' },
  { code: 'B5', chemin: 'materiel', titre: 'Matériel', noeud: '24:3' },
  { code: 'B6', chemin: 'prets', titre: 'Prêts', noeud: '26:2' },
  { code: 'B7', chemin: 'emprunteurs', titre: 'Emprunteurs', noeud: '83:2266' },
  { code: 'B8', chemin: 'incidents', titre: 'Incidents & paiements', noeud: '27:2' },
  { code: 'B9', chemin: 'consommables', titre: 'Consommables', noeud: '84:2451' },
  { code: 'B10', chemin: 'salles', titre: 'Salles', noeud: '87:2645' },
  { code: 'B11', chemin: 'imports', titre: 'Imports Calc', noeud: '88:2861' },
  { code: 'B12', chemin: 'reglages', titre: 'Réglages', noeud: '89:3051' },
]

const versRoute = ({ code, chemin, titre, noeud }: Fiche) => ({
  ...(chemin === '' ? { index: true as const } : { path: chemin }),
  element: <EcranEnChantier code={code} titre={titre} noeud={noeud} />,
})

export const routeur = createBrowserRouter([
  { path: '/', element: <AccueilDemo /> },
  { path: '/design-system', element: <GalerieDesignSystem /> },
  { path: '/app', element: <DispositionApp />, children: ECRANS_APP.map(versRoute) },
  {
    // B1 · Se connecter : hors de la coque (ni menu, ni en-tête de page).
    path: '/admin/connexion',
    element: <EcranEnChantier code="B1" titre="Se connecter" noeud="14:950" />,
  },
  { path: '/admin', element: <CoqueBackOffice />, children: ECRANS_BACK_OFFICE.map(versRoute) },
  { path: '*', element: <Introuvable /> },
])
