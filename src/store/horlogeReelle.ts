/**
 * Pont entre l'horloge système et le domaine.
 *
 * `src/domain/` est pur : il ne connaît ni `Date`, ni fuseau, et manipule des instants
 * `AAAA-MM-JJTHH:MM` en heure locale du campus. Ce module est le seul endroit du projet
 * qui lit l'heure de la machine, et il la traduit dans ce format.
 */
import type { Instant } from '@/domain'

const deuxChiffres = (valeur: number) => String(valeur).padStart(2, '0')

/** L'instant courant, en heure locale, au format attendu par le domaine. */
export function maintenantReel(date: Date = new Date()): Instant {
  const jour = `${date.getFullYear()}-${deuxChiffres(date.getMonth() + 1)}-${deuxChiffres(date.getDate())}`
  return `${jour}T${deuxChiffres(date.getHours())}:${deuxChiffres(date.getMinutes())}`
}
