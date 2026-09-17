/**
 * Aides d'affichage partagées par les écrans du back-office.
 *
 * Comme pour l'app mobile, tout ce qui se déduit de l'état vit dans
 * `src/domain/selecteurs.ts` : ce module ne fait que traduire l'état en badges,
 * en lignes de contexte et en libellés de colonnes.
 */
import { euros, horloge, selecteurs, type EtatMDS, type Materiel, type Pret } from '@/domain'
import type { NomIcone, StatutBadge, TeintePictogramme } from '@/design-system'
import { teinteDe } from '@/app-mobile/aides'

export { iconeDe, teinteDe } from '@/app-mobile/aides'

/** Teinte du pictogramme d'un matériel, ou une teinte neutre si le matériel est inconnu. */
export const teinteDuMateriel = (materiel: Materiel | undefined): TeintePictogramme =>
  materiel ? teinteDe(materiel) : 'Neutre'

// ─── Matériel (B5) ───────────────────────────────────────────────────────────

/** Badge de la colonne Statut du tableau d'inventaire. */
export function badgeDeMateriel(materiel: Materiel): { statut: StatutBadge; libelle: string } {
  switch (materiel.statut) {
    case 'disponible':
      return { statut: 'Disponible', libelle: 'Disponible' }
    case 'remise_a_valider':
      return { statut: 'À valider', libelle: 'Remise à valider' }
    case 'emprunte':
      return { statut: 'En cours', libelle: 'Sorti' }
    case 'retour_a_valider':
      return { statut: 'À valider', libelle: 'Retour à valider' }
    case 'anomalie':
      return { statut: 'Incident', libelle: 'Anomalie' }
    case 'perdu':
      return { statut: 'En retard', libelle: 'Perdu' }
    case 'hors_service':
      return { statut: 'Retiré', libelle: 'Retiré du prêt' }
  }
}

/**
 * La ligne de contexte affichée sous le badge de statut, dérivée du statut :
 * le responsable, le responsable et sa classe, l'étape en cours, la restriction,
 * ou à défaut la note interne du matériel.
 */
export function contexteDuMateriel(etat: EtatMDS, materiel: Materiel): string | undefined {
  const pret = selecteurs.pretOuvertDe(etat, materiel.id)

  if (pret) {
    const qui = selecteurs.personne(etat, pret.responsable).nom
    if (pret.pourClasse) return `${qui} · ${pret.pourClasse}`
    if (pret.statut === 'retour_a_valider') return `${qui} · retour`
    if (pret.statut === 'remise_a_valider') return `${qui} · remise`
    if (selecteurs.estEnRetard(etat, pret)) return `${qui} · en retard`
    return qui
  }

  // Niveau 2 rendu : la photo attend encore le contrôle, même si le matériel est reparti.
  const photo = selecteurs.photoEnAttenteDe(etat, materiel.id)
  if (photo) return `${selecteurs.personne(etat, photo.responsable).nom} · photo à contrôler`

  if (materiel.note) return materiel.note
  if (materiel.reserveA === 'intervenant') return 'Intervenants uniquement'
  return undefined
}

// ─── Prêts (B6) ──────────────────────────────────────────────────────────────

/** Les quatre badges distincts de la colonne Statut des prêts. */
export function badgeDePretBO(etat: EtatMDS, pret: Pret): { statut: StatutBadge; libelle: string } {
  if (pret.statut === 'remise_a_valider') return { statut: 'À valider', libelle: 'À valider' }
  if (pret.statut === 'retour_a_valider') return { statut: 'À valider', libelle: 'Retour à valider' }
  if (selecteurs.estEnRetard(etat, pret)) return { statut: 'En retard', libelle: 'En retard' }
  return { statut: 'En cours', libelle: 'En cours' }
}

/** Colonne « Sorti » d'un prêt : l'instant de sortie, ou la demande pour une remise. */
export const sortieDuPret = (etat: EtatMDS, pret: Pret): string =>
  horloge.quand(pret.sortiLe ?? pret.demandeLe ?? etat.horloge.maintenant, etat.horloge.maintenant)

// ─── Emprunteurs (B7) ────────────────────────────────────────────────────────

/** Colonne Profil : « Élève · B3 », « Intervenant · B3, M1 ». */
export function profilDe(etat: EtatMDS, id: string): string {
  const personne = selecteurs.personne(etat, id)
  const role = personne.role === 'intervenant' ? 'Intervenant' : 'Élève'
  const classes = personne.classes?.join(', ') ?? personne.classe ?? ''
  return classes === '' ? role : `${role} · ${classes}`
}

/** Montant dû par une personne, ou « – » quand elle ne doit rien. */
export function duPar(etat: EtatMDS, id: string): string {
  const total = selecteurs
    .incidentsARembourser(etat)
    .filter((incident) => incident.responsable === id)
    .reduce((somme, incident) => somme + incident.montant, 0)
  return total === 0 ? '–' : euros(total)
}

// ─── Incidents et signalements ───────────────────────────────────────────────

/** Icône du matériel concerné par un incident, pour le pictogramme de la carte. */
export function iconeDuMaterielId(etat: EtatMDS, id: string): NomIcone {
  return (etat.materiels.find((materiel) => materiel.id === id)?.icone ?? 'Colis') as NomIcone
}

/** Libellé de la cible d'un signalement : « Salle 103 » ou le nom du matériel. */
export function cibleDuSignalement(etat: EtatMDS, cible: { type: string; id: string }): string {
  return cible.type === 'salle'
    ? `Salle ${cible.id}`
    : (etat.materiels.find((materiel) => materiel.id === cible.id)?.nom ?? cible.id)
}

// ─── Salles (B10) ────────────────────────────────────────────────────────────

/** Statut d'une salle : Complet, n manquant(s), n en trop. */
export function statutDeSalle(presents: number, attendus: number): { statut: StatutBadge; libelle: string } {
  const ecart = presents - attendus
  if (ecart === 0) return { statut: 'Disponible', libelle: 'Complet' }
  if (ecart < 0) {
    const manque = -ecart
    return { statut: 'En retard', libelle: `${manque} manquant${manque > 1 ? 's' : ''}` }
  }
  return { statut: 'À valider', libelle: `${ecart} en trop` }
}
