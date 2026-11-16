/**
 * Recalage du jeu de données sur une date réelle.
 *
 * `data/seed.json` décrit une situation ancrée au jeudi 17 septembre 2026 : des prêts
 * sortis « ce matin », un retard « d'hier », une perte qui tombe à J+2. Ces écarts sont
 * ce qui donne son sens à la démonstration des règles R10 et R11.
 *
 * Plutôt que de réécrire le seed, on le **décale en bloc** : tous les instants avancent
 * du même nombre de jours, donc tous les écarts relatifs sont conservés. L'heure de la
 * journée, elle, ne bouge pas — un prêt sorti à 9:20 reste sorti à 9:20.
 *
 * Le parcours est générique (toute chaîne au format `AAAA-MM-JJ` ou `AAAA-MM-JJTHH:MM`
 * est décalée) : une date ajoutée plus tard au seed suit automatiquement, sans qu'on
 * ait à penser à l'inscrire ici.
 */
import * as h from './horloge'
import { construireRecap } from './selecteurs'
import type { EtatMDS, Instant, Jour } from './types'

/** `2026-09-17` ou `2026-09-17T09:20`, et rien d'autre. */
const FORME_DATE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/

const estDate = (valeur: unknown): valeur is string => typeof valeur === 'string' && FORME_DATE.test(valeur)

/** Décale un instant ou un jour, en gardant son heure. */
function decaler(valeur: string, jours: number): string {
  const [jour, heure] = valeur.split('T')
  const decale = h.jourDepuisNumero(h.numeroDeJour(jour!) + jours)
  return heure === undefined ? decale : `${decale}T${heure}`
}

/** Copie une valeur quelconque en décalant toutes les dates qu'elle contient. */
function parcourir<T>(valeur: T, jours: number): T {
  if (estDate(valeur)) return decaler(valeur, jours) as T
  if (Array.isArray(valeur)) return valeur.map((element) => parcourir(element, jours)) as T
  if (typeof valeur === 'object' && valeur !== null) {
    const copie: Record<string, unknown> = {}
    for (const [cle, sousValeur] of Object.entries(valeur)) {
      copie[cle] = parcourir(sousValeur, jours)
    }
    return copie as T
  }
  return valeur
}

/**
 * Rejoue la situation du seed à la date du jour : le jour d'ancrage devient `maintenant`,
 * et tout le reste suit du même nombre de jours.
 *
 * Le récap de 8h est **recalculé** et non décalé : il contient des dates déjà mises en
 * forme (« Jeudi 17 sept. · 8:00 ») qu'un décalage de chaînes laisserait fausses.
 */
export function recalerSur(etat: EtatMDS, maintenant: Instant): EtatMDS {
  const ancrage: Jour = h.jourDe(etat.horloge.maintenant)
  const cible: Jour = h.jourDe(maintenant)
  const jours = h.numeroDeJour(cible) - h.numeroDeJour(ancrage)

  const decale = jours === 0 ? etat : parcourir(etat, jours)
  const recale: EtatMDS = {
    ...decale,
    horloge: { ...decale.horloge, maintenant },
  }

  // Le seed livre un récap daté de son jour d'ancrage : on le reconstruit sur le nouveau.
  if (recale.recap === null) return recale
  return { ...recale, recap: construireRecap(recale, h.aHeure(maintenant, recale.horloge.recap)) }
}
