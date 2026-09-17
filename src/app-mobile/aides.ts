/**
 * Aides d'affichage partagées par les écrans mobile.
 *
 * Tout ce qui se déduit de l'état vit dans `src/domain/selecteurs.ts` : ce module ne
 * porte que la traduction en éléments visuels (teinte d'une catégorie, badge d'un prêt).
 */
import { horloge, selecteurs, type EtatMDS, type Materiel, type Pret } from '@/domain'
import type { NomIcone, StatutBadge, TeintePictogramme } from '@/design-system'

/** Teinte du pictogramme selon la catégorie, dans l'esprit des couleurs de la charte. */
export const TEINTE_PAR_CATEGORIE: Record<string, TeintePictogramme> = {
  studio: 'Turquoise',
  informatique: 'Bleu',
  cours: 'Orange',
  jeux: 'Rose',
  boites: 'Neutre',
}

export const teinteDe = (materiel: Materiel): TeintePictogramme =>
  TEINTE_PAR_CATEGORIE[materiel.categorie] ?? 'Neutre'

/** L'icône du matériel, telle que la nomme le jeu de démo. */
export const iconeDe = (materiel: Materiel): NomIcone => materiel.icone as NomIcone

/** Où et comment le matériel se remet, tel qu'affiché dans le catalogue. */
export function modeDeRemise(materiel: Materiel): string {
  return materiel.niveau === 1 ? `Remise par l’équipe · ${materiel.lieu}` : `Libre-service · ${materiel.lieu}`
}

/** Badge et libellé d'un prêt vu par son responsable, sur l'accueil mobile. */
export function badgeDePret(
  etat: EtatMDS,
  pret: Pret,
): { statut: StatutBadge; libelle: string; alerte: boolean } {
  const heure = horloge.heure(pret.sortiLe ?? pret.demandeLe ?? etat.horloge.maintenant)

  if (pret.statut === 'remise_a_valider') {
    return { statut: 'À valider', libelle: `Demande envoyée · ${heure}`, alerte: true }
  }
  if (pret.statut === 'retour_a_valider') {
    return { statut: 'À valider', libelle: `Retour en vérification · ${heure}`, alerte: true }
  }
  if (selecteurs.estEnRetard(etat, pret)) {
    return { statut: 'En retard', libelle: `En retard · depuis ${heure}`, alerte: true }
  }
  return { statut: 'En cours', libelle: `En cours · depuis ${heure}`, alerte: false }
}

/** Badge d'un TYPE de matériel dans le catalogue, du point de vue de la persona. */
export function badgeDeType(
  etat: EtatMDS,
  type: string,
  personneId: string,
): { statut: StatutBadge; libelle: string; unite?: Materiel | undefined } {
  const unites = selecteurs.unitesDuType(etat, type)
  const libres = unites.filter((unite) => unite.statut === 'disponible')

  // Une unité du type est-elle déjà chez la persona, ou en attente de remise ?
  // Dans ce cas la ligne mène à SON exemplaire : c'est de là qu'elle le rend.
  for (const unite of unites) {
    const pret = selecteurs.pretOuvertDe(etat, unite.id)
    if (pret?.responsable !== personneId) continue
    if (pret.statut === 'remise_a_valider') return { statut: 'À valider', libelle: 'Ta demande', unite }
    return { statut: 'En cours', libelle: 'Chez toi', unite }
  }

  if (libres.length === 0) return { statut: 'Retiré', libelle: 'Indisponible' }
  if (libres.length === 1) return { statut: 'Disponible', libelle: 'Disponible', unite: libres[0] }
  return {
    statut: 'Disponible',
    libelle: `${libres.length} disponibles`,
    unite: libres[0],
  }
}

/** Les sections du catalogue : une par catégorie du seed, les vides masquées. */
export function sectionsDuCatalogue(
  etat: EtatMDS,
  personneRole: string,
): { cle: string; titre: string; types: string[] }[] {
  return Object.entries(etat.categories)
    .filter(([, categorie]) => !categorie.reserveA || categorie.reserveA === personneRole)
    .map(([cle, categorie]) => ({
      cle,
      titre: categorie.nom,
      types: [...new Set(etat.materiels.filter((m) => m.categorie === cle).map((m) => m.type))],
    }))
    .filter((section) => section.types.length > 0)
}
