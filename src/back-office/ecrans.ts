/**
 * Les fiches d'écran du back-office (`docs/03-ecrans.md`, section B) et l'ordre des
 * onze liens du Menu principal (`61:206`). Ce module ne contient aucun composant :
 * `routes.tsx` et `CoqueBackOffice.tsx` s'y réfèrent tous les deux.
 */
import type { NomIcone } from '@/design-system'

export type FicheBO = {
  code: string
  /** Chemin relatif à `/admin` ; chaîne vide pour le tableau de bord. */
  chemin: string
  titre: string
  noeud: string
  icone: NomIcone
}

/** B2 → B12, dans l'ordre du rail sombre. B1 « Se connecter » vit hors de la coque. */
export const ECRANS_BO: FicheBO[] = [
  { code: 'B2', chemin: '', titre: 'Tableau de bord', noeud: '8:950', icone: 'Tableau de bord' },
  { code: 'B3', chemin: 'validations', titre: 'Validations sur place', noeud: '19:2', icone: 'Liste cochée' },
  { code: 'B4', chemin: 'controle-photo', titre: 'Contrôle photo', noeud: '22:2', icone: 'Image' },
  { code: 'B5', chemin: 'materiel', titre: 'Matériel', noeud: '24:3', icone: 'Grille' },
  { code: 'B6', chemin: 'prets', titre: 'Prêts', noeud: '26:2', icone: 'Colis' },
  { code: 'B7', chemin: 'emprunteurs', titre: 'Emprunteurs', noeud: '83:2266', icone: 'Utilisateurs' },
  { code: 'B8', chemin: 'incidents', titre: 'Incidents & paiements', noeud: '27:2', icone: 'Portefeuille' },
  { code: 'B9', chemin: 'consommables', titre: 'Consommables', noeud: '84:2451', icone: 'Stylo' },
  { code: 'B10', chemin: 'salles', titre: 'Salles', noeud: '87:2645', icone: 'Ventilateur' },
  { code: 'B11', chemin: 'imports', titre: 'Imports Calc', noeud: '88:2861', icone: 'Import' },
  { code: 'B12', chemin: 'reglages', titre: 'Réglages', noeud: '89:3051', icone: 'Réglages' },
]

/** La fiche correspondant à une adresse `/admin/...`. */
export function ficheDuChemin(chemin: string): FicheBO {
  const reste = chemin.replace(/^\/admin\/?/, '').replace(/\/$/, '')
  // Une sous-page (`materiel/kit-r10-01`) reste rattachée à sa fiche de premier niveau.
  const premier = reste.split('/')[0] ?? ''
  return ECRANS_BO.find((fiche) => fiche.chemin === premier) ?? ECRANS_BO[0]!
}
