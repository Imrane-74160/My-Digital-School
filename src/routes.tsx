import { createBrowserRouter } from 'react-router'
import { AccueilDemo } from './pages/AccueilDemo'
import { EcranEnChantier } from './pages/EcranEnChantier'
import { Introuvable } from './pages/Introuvable'
import { Accueil } from './app-mobile/Accueil'
import { Alertes } from './app-mobile/Alertes'
import { Charte } from './app-mobile/Charte'
import { Connexion } from './app-mobile/Connexion'
import { DispositionApp } from './app-mobile/DispositionApp'
import { FicheMateriel } from './app-mobile/FicheMateriel'
import { Materiel } from './app-mobile/Materiel'
import { Profil } from './app-mobile/Profil'
import { Rendre } from './app-mobile/Rendre'
import { Scanner } from './app-mobile/Scanner'
import { Signaler } from './app-mobile/Signaler'
import { Consommables } from './back-office/Consommables'
import { ConnexionBO } from './back-office/Connexion'
import { ControlePhoto } from './back-office/ControlePhoto'
import { CoqueBackOffice } from './back-office/CoqueBackOffice'
import { ECRANS_BO } from './back-office/ecrans'
import { Emprunteurs } from './back-office/Emprunteurs'
import { Imports } from './back-office/Imports'
import { Incidents } from './back-office/Incidents'
import { MaterielBO } from './back-office/Materiel'
import { Prets } from './back-office/Prets'
import { Reglages } from './back-office/Reglages'
import { SallesBO } from './back-office/Salles'
import { TableauDeBord } from './back-office/TableauDeBord'
import { Validations } from './back-office/Validations'
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

/** B2 → B12 : les fiches vivent dans `back-office/ecrans.ts`, avec l'ordre du menu. */
export const ECRANS_BACK_OFFICE: Fiche[] = ECRANS_BO.map(({ code, chemin, titre, noeud }) => ({
  code,
  chemin,
  titre,
  noeud,
}))

/** Écran construit pour chaque fiche de l'app mobile. */
const ECRAN_APP: Record<string, () => React.ReactElement> = {
  A1: Connexion,
  A2: Charte,
  A3: Accueil,
  A4: Materiel,
  A5: FicheMateriel,
  A6: Rendre,
  A7: Scanner,
  A8: Signaler,
  A9: Alertes,
  A10: Profil,
}

/** Écran construit pour chaque fiche du back-office. */
const ECRAN_BO: Record<string, () => React.ReactElement> = {
  B2: TableauDeBord,
  B3: Validations,
  B4: ControlePhoto,
  B5: MaterielBO,
  B6: Prets,
  B7: Emprunteurs,
  B8: Incidents,
  B9: Consommables,
  B10: SallesBO,
  B11: Imports,
  B12: Reglages,
}

const versRoute =
  (ecrans: Record<string, () => React.ReactElement>) =>
  ({ code, chemin, titre, noeud }: Fiche) => {
    const Ecran = ecrans[code]
    return {
      ...(chemin === '' ? { index: true as const } : { path: chemin }),
      element: Ecran ? <Ecran /> : <EcranEnChantier code={code} titre={titre} noeud={noeud} />,
    }
  }

export const routeur = createBrowserRouter([
  { path: '/', element: <AccueilDemo /> },
  { path: '/design-system', element: <GalerieDesignSystem /> },
  { path: '/app', element: <DispositionApp />, children: ECRANS_APP.map(versRoute(ECRAN_APP)) },
  {
    // B1 · Se connecter : hors de la coque (ni menu principal, ni en-tête de page).
    path: '/admin/connexion',
    element: <ConnexionBO />,
  },
  {
    path: '/admin',
    element: <CoqueBackOffice />,
    children: ECRANS_BACK_OFFICE.map(versRoute(ECRAN_BO)),
  },
  { path: '*', element: <Introuvable /> },
])
