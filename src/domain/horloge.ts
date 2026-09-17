/**
 * Horloge du domaine.
 *
 * Aucun `Date`, aucun `Date.now()`, aucun `Intl` : tout est calculé sur l'instant porté
 * par l'état (`AAAA-MM-JJTHH:MM`, heure locale du campus, Europe/Paris). Le domaine reste
 * donc pur et déterministe — le même état donne toujours le même rendu, sur n'importe
 * quelle machine et dans n'importe quel fuseau.
 *
 * Le format est trié lexicographiquement comme chronologiquement (champs à largeur fixe,
 * complétés par des zéros) : comparer deux instants revient à comparer deux chaînes.
 */
import type { Heure, Horloge, Instant, Jour } from './types'

const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'] as const
const JOURS_COURTS = ['Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.', 'Dim.'] as const
// Abréviations telles qu'elles apparaissent dans le Figma (« lundi 14 sept. »).
const MOIS_COURTS = [
  'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.',
] as const

export type Composantes = {
  annee: number
  /** 1 à 12. */
  mois: number
  jour: number
  heures: number
  minutes: number
}

const deuxChiffres = (n: number) => String(n).padStart(2, '0')

export function analyser(instant: Instant): Composantes {
  const trouve = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/.exec(instant)
  if (!trouve) throw new Error(`Instant invalide : ${instant}`)
  return {
    annee: Number(trouve[1]),
    mois: Number(trouve[2]),
    jour: Number(trouve[3]),
    heures: Number(trouve[4] ?? '0'),
    minutes: Number(trouve[5] ?? '0'),
  }
}

export function formater({ annee, mois, jour, heures, minutes }: Composantes): Instant {
  return `${annee}-${deuxChiffres(mois)}-${deuxChiffres(jour)}T${deuxChiffres(heures)}:${deuxChiffres(minutes)}`
}

/** `2026-09-17T10:15` → `2026-09-17`. */
export function jourDe(instant: Instant): Jour {
  return instant.slice(0, 10)
}

// ─── Calendrier grégorien ────────────────────────────────────────────────────

/** Jours écoulés depuis le 1er janvier 1970 (algorithme « days from civil »). */
export function numeroDeJour(instant: Instant | Jour): number {
  const { annee, mois, jour } = analyser(jourDe(instant))
  const a = annee - (mois <= 2 ? 1 : 0)
  const ere = Math.floor(a / 400)
  const anneeDansEre = a - ere * 400
  const jourDansAnnee = Math.floor((153 * (mois + (mois > 2 ? -3 : 9)) + 2) / 5) + jour - 1
  const jourDansEre =
    anneeDansEre * 365 +
    Math.floor(anneeDansEre / 4) -
    Math.floor(anneeDansEre / 100) +
    jourDansAnnee
  return ere * 146097 + jourDansEre - 719468
}

/** Inverse de `numeroDeJour`. */
export function jourDepuisNumero(numero: number): Jour {
  const decale = numero + 719468
  const ere = Math.floor(decale / 146097)
  const jourDansEre = decale - ere * 146097
  const anneeDansEre = Math.floor(
    (jourDansEre - Math.floor(jourDansEre / 1460) + Math.floor(jourDansEre / 36524) - Math.floor(jourDansEre / 146096)) / 365,
  )
  const annee = anneeDansEre + ere * 400
  const jourDansAnnee =
    jourDansEre - (365 * anneeDansEre + Math.floor(anneeDansEre / 4) - Math.floor(anneeDansEre / 100))
  const mp = Math.floor((5 * jourDansAnnee + 2) / 153)
  const jour = jourDansAnnee - Math.floor((153 * mp + 2) / 5) + 1
  const mois = mp + (mp < 10 ? 3 : -9)
  return `${annee + (mois <= 2 ? 1 : 0)}-${deuxChiffres(mois)}-${deuxChiffres(jour)}`
}

/** 0 = lundi … 6 = dimanche. Le 1er janvier 1970 était un jeudi (indice 3). */
export function indiceJourDeLaSemaine(instant: Instant | Jour): number {
  const n = numeroDeJour(instant)
  return (((n + 3) % 7) + 7) % 7
}

export function nomDuJour(instant: Instant | Jour): string {
  return JOURS[indiceJourDeLaSemaine(instant)]!
}

// ─── Comparaisons et déplacements ────────────────────────────────────────────

export const avant = (a: Instant, b: Instant) => a < b
export const apres = (a: Instant, b: Instant) => a > b
export const memeJour = (a: Instant, b: Instant) => jourDe(a) === jourDe(b)

/** Nombre de jours calendaires entre deux instants (pas de gestion des week-ends : hors périmètre). */
export const joursEcoules = (depuis: Instant, jusqu: Instant) =>
  numeroDeJour(jusqu) - numeroDeJour(depuis)

export function ajouterJours(instant: Instant, nombre: number): Instant {
  const { heures, minutes } = analyser(instant)
  const nouveauJour = jourDepuisNumero(numeroDeJour(instant) + nombre)
  return `${nouveauJour}T${deuxChiffres(heures)}:${deuxChiffres(minutes)}`
}

/** Même jour, à l'heure demandée. `aHeure('2026-09-17T10:15', '18:00')` → `2026-09-17T18:00`. */
export const aHeure = (instant: Instant, heure: Heure): Instant => `${jourDe(instant)}T${heure}`

export const minutesDeLHeure = (heure: Heure): number => {
  const [h, m] = heure.split(':')
  return Number(h) * 60 + Number(m)
}

const minutesDansLaJournee = (instant: Instant) => {
  const { heures, minutes } = analyser(instant)
  return heures * 60 + minutes
}

// ─── Bureau (R01) ────────────────────────────────────────────────────────────

/** On emprunte seulement quand le bureau est ouvert, 8h–18h (R01). */
export function estBureauOuvert(horloge: Horloge): boolean {
  const maintenant = minutesDansLaJournee(horloge.maintenant)
  return (
    maintenant >= minutesDeLHeure(horloge.bureau.ouverture) &&
    maintenant < minutesDeLHeure(horloge.bureau.fermeture)
  )
}

/** Vrai après la fermeture du bureau : « le soir » du moteur de référence. */
export function estLeSoir(horloge: Horloge): boolean {
  return minutesDansLaJournee(horloge.maintenant) >= minutesDeLHeure(horloge.bureau.fermeture)
}

/** Instant de fermeture du jour courant. */
export const fermetureDuJour = (horloge: Horloge): Instant =>
  aHeure(horloge.maintenant, horloge.bureau.fermeture)

/** Ouverture du lendemain, 8h. */
export const ouvertureDuLendemain = (horloge: Horloge): Instant =>
  aHeure(ajouterJours(horloge.maintenant, 1), horloge.bureau.ouverture)

// ─── Rendus (formats repris du Figma) ────────────────────────────────────────

/** `2026-09-17T09:20` → `9:20`. Le Figma n'affiche pas de zéro devant l'heure. */
export function heure(instant: Instant): string {
  const { heures, minutes } = analyser(instant)
  return `${heures}:${deuxChiffres(minutes)}`
}

/** `2026-09-17T18:00` → `18h`. Utilisé pour les échéances (« Ven. 18h »). */
export function heureRonde(instant: Instant): string {
  const { heures, minutes } = analyser(instant)
  return minutes === 0 ? `${heures}h` : `${heures}h${deuxChiffres(minutes)}`
}

/** `2026-09-17` → `jeudi 17 sept.` */
export function jourLong(instant: Instant | Jour): string {
  const { mois, jour } = analyser(jourDe(instant))
  return `${nomDuJour(instant)} ${jour} ${MOIS_COURTS[mois - 1]!}`
}

const capitaliser = (texte: string) => texte.charAt(0).toUpperCase() + texte.slice(1)

/** `Jeudi 17 sept.` — en-tête du récap de 8h. */
export const jourLongCapitalise = (instant: Instant | Jour): string => capitaliser(jourLong(instant))

/**
 * Colonne « Quand » des tableaux du back-office, telle que dessinée dans le Figma :
 * aujourd'hui → l'heure (`9:40`) · hier → `Hier` · dans les 6 derniers jours → `Mardi` ·
 * au-delà → `lundi 14 sept.`
 */
export function quand(instant: Instant, maintenant: Instant): string {
  const ecart = joursEcoules(instant, maintenant)
  if (ecart === 0) return heure(instant)
  if (ecart === 1) return 'Hier'
  if (ecart > 1 && ecart < 7) return capitaliser(nomDuJour(instant))
  return jourLong(instant)
}

/**
 * Échéance d'un prêt, telle que dessinée sur la carte « Prêts en retard » :
 * `Auj. 18h` · `Hier 18h` · `Ven. 18h` · `lundi 14 sept. 18h`.
 */
export function echeance(instant: Instant, maintenant: Instant): string {
  const ecart = joursEcoules(instant, maintenant)
  const h = heureRonde(instant)
  if (ecart === 0) return `Auj. ${h}`
  if (ecart === 1) return `Hier ${h}`
  if (Math.abs(ecart) < 7) return `${JOURS_COURTS[indiceJourDeLaSemaine(instant)]!} ${h}`
  return `${jourLong(instant)} ${h}`
}

/**
 * Date relative en minuscules, pour les phrases (« Yanis · B3 · hier ») :
 * `aujourd'hui` · `hier` · `lundi` · `lundi 14 sept.`
 */
export function jourRelatif(instant: Instant, maintenant: Instant): string {
  const ecart = joursEcoules(instant, maintenant)
  if (ecart === 0) return "aujourd'hui"
  if (ecart === 1) return 'hier'
  if (ecart > 1 && ecart < 7) return nomDuJour(instant)
  return jourLong(instant)
}
