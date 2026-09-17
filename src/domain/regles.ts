/**
 * Les 16 règles métier, validées en ateliers (cf. `docs/02-regles-metier.md`).
 * Toute action refusée renvoie le code de la règle qui l'a refusée, affiché dans le toast.
 */
import type { CodeRegle, Regle } from './types'

export const REGLES: readonly Regle[] = [
  { code: 'R01', cle: 'bureau', libelle: 'On emprunte seulement quand le bureau est ouvert (8h–18h).' },
  { code: 'R02', cle: 'dispo', libelle: 'Pas de réservation : premier arrivé, premier servi.' },
  {
    code: 'R03',
    cle: 'forfait',
    libelle: 'Forfait affiché et accepté avant chaque emprunt. Charte acceptée à la 1re connexion.',
  },
  { code: 'R04', cle: 'n1', libelle: "Niveau 1 : remise et retour validés sur place par l'équipe." },
  { code: 'R05', cle: 'n2', libelle: 'Niveau 2 : retour avec photo, contrôle plus tard.' },
  {
    code: 'R06',
    cle: 'reemprunt',
    libelle:
      'Niveau 2 : le matériel peut repartir avant le contrôle ; la photo protège le nouvel emprunteur.',
  },
  {
    code: 'R07',
    cle: 'composant',
    libelle: 'Composant manquant : on doit le forfait du composant, pas celui du kit.',
  },
  { code: 'R08', cle: 'retour', libelle: 'Seul le responsable du prêt fait le retour.' },
  {
    code: 'R09',
    cle: 'classe',
    libelle: '« Pour ma classe » réservé aux intervenants, qui restent responsables.',
  },
  { code: 'R10', cle: 'blocage', libelle: 'Non rendu à 18h le jour même : emprunts bloqués.' },
  { code: 'R11', cle: 'perte', libelle: 'Toujours absent à J+2 à 18h : déclaré perdu, forfait dû.' },
  {
    code: 'R12',
    cle: 'argent',
    libelle: 'Forfaits, ajustements (baisse seulement) et paiements : réservés à Sandrine.',
  },
  { code: 'R13', cle: 'equipe', libelle: "Valider, contrôler, gérer : réservé à l'équipe." },
  {
    code: 'R14',
    cle: 'prevenez',
    libelle:
      '« Me prévenir » : tous les inscrits du type sont prévenus au retour, le premier qui scanne le prend.',
  },
  { code: 'R15', cle: 'temps', libelle: "Rappel à 16h30 aux emprunteurs, récap de 8h à l'équipe." },
  {
    code: 'R16',
    cle: 'deblocage',
    libelle: "L'équipe peut débloquer une personne pour la journée uniquement.",
  },
] as const

export const regle = (code: CodeRegle): Regle => {
  const trouvee = REGLES.find((r) => r.code === code)
  if (!trouvee) throw new Error(`Règle inconnue : ${code}`)
  return trouvee
}

/** Messages de refus fixés par les arbitrages (cf. `docs/02-regles-metier.md`). */
export const REFUS = {
  forfaitNonAccepte: 'Accepte le forfait pour emprunter.',
  charteNonAcceptee: 'Accepte la charte avant ton premier emprunt.',
} as const
