/**
 * Disposition du tableau de bord, par compte.
 *
 * Ce n'est pas de l'état métier : rien ici ne change une règle ni un compteur. C'est
 * une préférence d'affichage, propre à chaque membre de l'équipe — d'où sa place dans
 * le store et non dans `domain/`.
 *
 * Deux temps, comme demandé : un défaut déduit du **rôle** (la direction ouvre sur
 * l'état du campus, l'équipe sur les gestes du jour), puis **ajustable** carte par
 * carte — ordre, colonne, et masquage.
 */
import type { Role } from '@/domain'

/** Les cartes du tableau de bord, identifiées une fois pour toutes. */
export const CLES_CARTES = [
  'afaire',
  'enCeMoment',
  'retards',
  'signalements',
  'consommables',
  'recap',
] as const

export type CleCarte = (typeof CLES_CARTES)[number]

/** Les deux colonnes de l'écran : la principale est fluide, la latérale fait 420 px. */
export const ZONES = ['principale', 'cote'] as const
export type ZoneCarte = (typeof ZONES)[number]

export type Disposition = {
  principale: CleCarte[]
  cote: CleCarte[]
  masquees: CleCarte[]
}

/**
 * L'ordre du Figma (`8:950`) pour l'équipe pédagogique : on vient y chercher ce qu'il
 * y a à faire. La direction, elle, vient prendre la température avant d'agir — son
 * tableau ouvre sur « En ce moment » et garde le récap de 8h à portée.
 */
const DEFAUTS: Record<'equipe' | 'direction', Disposition> = {
  equipe: {
    principale: ['afaire', 'enCeMoment', 'retards', 'signalements'],
    cote: ['consommables', 'recap'],
    masquees: [],
  },
  direction: {
    principale: ['enCeMoment', 'afaire', 'retards', 'signalements'],
    cote: ['recap', 'consommables'],
    masquees: [],
  },
}

export const dispositionParDefaut = (role: Role): Disposition =>
  structuredClone(DEFAUTS[role === 'direction' ? 'direction' : 'equipe'])

/**
 * Remet une disposition stockée d'aplomb : une carte ajoutée depuis la dernière visite
 * revient à sa place par défaut, une carte inconnue disparaît, et aucune ne peut
 * figurer deux fois.
 */
export function normaliser(stockee: Disposition | undefined, role: Role): Disposition {
  const defaut = dispositionParDefaut(role)
  if (!stockee) return defaut

  const vues = new Set<CleCarte>()
  const garder = (liste: readonly CleCarte[] | undefined): CleCarte[] =>
    (liste ?? []).filter((cle) => {
      if (!CLES_CARTES.includes(cle) || vues.has(cle)) return false
      vues.add(cle)
      return true
    })

  const disposition: Disposition = {
    principale: garder(stockee.principale),
    cote: garder(stockee.cote),
    masquees: garder(stockee.masquees),
  }

  // Une carte jamais vue reprend la colonne que le rôle lui donne, en fin de colonne.
  for (const cle of CLES_CARTES) {
    if (vues.has(cle)) continue
    const zone: ZoneCarte = defaut.cote.includes(cle) ? 'cote' : 'principale'
    disposition[zone].push(cle)
  }
  return disposition
}

/** Où se trouve cette carte : dans une colonne, ou masquée. */
export function zoneDe(disposition: Disposition, cle: CleCarte): ZoneCarte | 'masquee' {
  if (disposition.principale.includes(cle)) return 'principale'
  if (disposition.cote.includes(cle)) return 'cote'
  return 'masquee'
}

const sans = (liste: CleCarte[], cle: CleCarte) => liste.filter((element) => element !== cle)

/** Retire la carte de partout, pour la reposer ensuite. */
const retirer = (disposition: Disposition, cle: CleCarte): Disposition => ({
  principale: sans(disposition.principale, cle),
  cote: sans(disposition.cote, cle),
  masquees: sans(disposition.masquees, cle),
})

/**
 * Pose la carte dans une colonne, à la position demandée (`index` au-delà de la fin =
 * en dernier). Masquer, c'est la poser dans `masquees`.
 */
export function poser(
  disposition: Disposition,
  cle: CleCarte,
  zone: ZoneCarte | 'masquee',
  index = Number.MAX_SAFE_INTEGER,
): Disposition {
  const propre = retirer(disposition, cle)
  const cible = zone === 'masquee' ? 'masquees' : zone
  const liste = [...propre[cible]]
  liste.splice(Math.max(0, Math.min(index, liste.length)), 0, cle)
  return { ...propre, [cible]: liste }
}

/** Monte (`-1`) ou descend (`+1`) la carte dans sa colonne. Aux extrémités, rien ne bouge. */
export function deplacer(disposition: Disposition, cle: CleCarte, sens: -1 | 1): Disposition {
  const zone = zoneDe(disposition, cle)
  if (zone === 'masquee') return disposition
  const liste = disposition[zone]
  const position = liste.indexOf(cle)
  const cible = position + sens
  if (cible < 0 || cible >= liste.length) return disposition
  return poser(disposition, cle, zone, cible)
}

/** Fait passer la carte dans l'autre colonne, en bas. */
export function changerDeColonne(disposition: Disposition, cle: CleCarte): Disposition {
  const zone = zoneDe(disposition, cle)
  if (zone === 'masquee') return disposition
  return poser(disposition, cle, zone === 'principale' ? 'cote' : 'principale')
}

/** Masque une carte affichée, ou remet une carte masquée dans sa colonne par défaut. */
export function basculerVisibilite(disposition: Disposition, cle: CleCarte, role: Role): Disposition {
  if (zoneDe(disposition, cle) !== 'masquee') return poser(disposition, cle, 'masquee')
  const defaut = dispositionParDefaut(role)
  return poser(disposition, cle, defaut.cote.includes(cle) ? 'cote' : 'principale')
}

/** Vrai quand rien n'a été touché : le bouton « Rétablir » n'a alors rien à faire. */
export const estParDefaut = (disposition: Disposition, role: Role): boolean =>
  JSON.stringify(disposition) === JSON.stringify(dispositionParDefaut(role))
