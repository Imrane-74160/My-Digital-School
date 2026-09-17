/**
 * Chargement du jeu de démo.
 *
 * `data/seed.json` est la source de vérité des données ; ce module le valide et le
 * transforme en `EtatMDS`. La validation est explicite plutôt que déléguée à une
 * dépendance : les messages d'erreur nomment le chemin exact du champ fautif, ce qui
 * rend une modification manuelle du seed sans risque.
 */
import seedBrut from '../../data/seed.json'
import * as hor from './horloge'
import { construireRecap } from './selecteurs'
import {
  CATEGORIES_SIGNALEMENT,
  ROLES,
  STATUTS_INCIDENT,
  STATUTS_MATERIEL,
  STATUTS_PHOTO,
  STATUTS_PRET,
  STATUTS_SIGNALEMENT,
  TYPES_INCIDENT,
} from './types'
import type {
  CategorieSignalement,
  CibleSignalement,
  Composant,
  Consommable,
  EtatMDS,
  Incident,
  LigneImport,
  Materiel,
  Niveau,
  Notification,
  Personne,
  PhotoDeRetour,
  Pret,
  Salle,
  Signalement,
  StatutIncident,
  StatutMateriel,
  StatutPhoto,
  StatutPret,
  StatutSignalement,
  TypeIncident,
} from './types'

// ─── Outils de validation ────────────────────────────────────────────────────

class SeedInvalide extends Error {}

const objet = (valeur: unknown, ou: string): Record<string, unknown> => {
  if (typeof valeur !== 'object' || valeur === null || Array.isArray(valeur)) {
    throw new SeedInvalide(`${ou} : objet attendu`)
  }
  return valeur as Record<string, unknown>
}

const liste = (valeur: unknown, ou: string): unknown[] => {
  if (!Array.isArray(valeur)) throw new SeedInvalide(`${ou} : tableau attendu`)
  return valeur
}

const texte = (valeur: unknown, ou: string): string => {
  if (typeof valeur !== 'string') throw new SeedInvalide(`${ou} : chaîne attendue`)
  return valeur
}

const nombre = (valeur: unknown, ou: string): number => {
  if (typeof valeur !== 'number' || !Number.isFinite(valeur)) {
    throw new SeedInvalide(`${ou} : nombre attendu`)
  }
  return valeur
}

const booleen = (valeur: unknown, ou: string): boolean => {
  if (typeof valeur !== 'boolean') throw new SeedInvalide(`${ou} : booléen attendu`)
  return valeur
}

const parmi = <T extends string>(valeur: unknown, valeurs: readonly T[], ou: string): T => {
  const brut = texte(valeur, ou)
  if (!(valeurs as readonly string[]).includes(brut)) {
    throw new SeedInvalide(`${ou} : « ${brut} » hors des valeurs admises (${valeurs.join(', ')})`)
  }
  return brut as T
}

const instant = (valeur: unknown, ou: string): string => {
  const brut = texte(valeur, ou)
  hor.analyser(brut) // lève si le format n'est pas AAAA-MM-JJ[THH:MM]
  return brut
}

/** N'ajoute la propriété que si la valeur est présente (`exactOptionalPropertyTypes`). */
const si = <T>(valeur: T | undefined, cle: string): Record<string, T> =>
  valeur === undefined ? {} : ({ [cle]: valeur } as Record<string, T>)

const texteOpt = (v: unknown, ou: string) => (v === undefined || v === null ? undefined : texte(v, ou))
const nombreOpt = (v: unknown, ou: string) => (v === undefined || v === null ? undefined : nombre(v, ou))
const instantOpt = (v: unknown, ou: string) => (v === undefined || v === null ? undefined : instant(v, ou))

const niveau = (valeur: unknown, ou: string): Niveau => {
  const brut = nombre(valeur, ou)
  if (brut !== 1 && brut !== 2) throw new SeedInvalide(`${ou} : niveau 1 ou 2 attendu, reçu ${brut}`)
  return brut
}

// ─── Lecture des collections ─────────────────────────────────────────────────

function lirePersonne(brut: unknown, ou: string): Personne {
  const o = objet(brut, ou)
  const charte = o['charteAcceptee']
  return {
    id: texte(o['id'], `${ou}.id`),
    nom: texte(o['nom'], `${ou}.nom`),
    ...si(texteOpt(o['prenom'], `${ou}.prenom`), 'prenom'),
    role: parmi(o['role'], ROLES, `${ou}.role`),
    ...si(texteOpt(o['classe'], `${ou}.classe`), 'classe'),
    ...si(
      o['classes'] === undefined
        ? undefined
        : liste(o['classes'], `${ou}.classes`).map((c, i) => texte(c, `${ou}.classes[${i}]`)),
      'classes',
    ),
    couleur: texte(o['couleur'], `${ou}.couleur`),
    ...si(texteOpt(o['email'], `${ou}.email`), 'email'),
    charteAcceptee: charte === null || charte === undefined ? null : instant(charte, `${ou}.charteAcceptee`),
    ...si(nombreOpt(o['empruntsAnnee'], `${ou}.empruntsAnnee`), 'empruntsAnnee'),
    ...si(texteOpt(o['droits'], `${ou}.droits`), 'droits'),
    ...si(texteOpt(o['note'], `${ou}.note`), 'note'),
  }
}

function lireComposant(brut: unknown, ou: string): Composant {
  const o = objet(brut, ou)
  return {
    id: texte(o['id'], `${ou}.id`),
    nom: texte(o['nom'], `${ou}.nom`),
    forfait: nombre(o['forfait'], `${ou}.forfait`),
  }
}

function lireMateriel(brut: unknown, ou: string): Materiel {
  const o = objet(brut, ou)
  const composants =
    o['composants'] === undefined
      ? undefined
      : liste(o['composants'], `${ou}.composants`).map((c, i) => lireComposant(c, `${ou}.composants[${i}]`))
  const forfait = nombreOpt(o['forfait'], `${ou}.forfait`)
  if (composants && forfait !== undefined) {
    throw new SeedInvalide(`${ou} : un matériel porte soit « forfait », soit « composants », jamais les deux`)
  }
  if (!composants && forfait === undefined) {
    throw new SeedInvalide(`${ou} : « forfait » ou « composants » obligatoire`)
  }
  return {
    id: texte(o['id'], `${ou}.id`),
    type: texte(o['type'], `${ou}.type`),
    nom: texte(o['nom'], `${ou}.nom`),
    categorie: texte(o['categorie'], `${ou}.categorie`),
    icone: texte(o['icone'], `${ou}.icone`),
    niveau: niveau(o['niveau'], `${ou}.niveau`),
    lieu: texte(o['lieu'], `${ou}.lieu`),
    qr: texte(o['qr'], `${ou}.qr`),
    statut: parmi<StatutMateriel>(o['statut'], STATUTS_MATERIEL, `${ou}.statut`),
    ...si(forfait, 'forfait'),
    ...si(composants, 'composants'),
    ...si(
      o['reserveA'] === undefined ? undefined : parmi(o['reserveA'], ROLES, `${ou}.reserveA`),
      'reserveA',
    ),
    ...si(texteOpt(o['note'], `${ou}.note`), 'note'),
  }
}

function lirePret(brut: unknown, ou: string): Pret {
  const o = objet(brut, ou)
  if ('emprunteur' in o) {
    throw new SeedInvalide(`${ou} : le champ « emprunteur » a été supprimé, seul « responsable » existe`)
  }
  const pourClasse = o['pourClasse']
  return {
    id: texte(o['id'], `${ou}.id`),
    materiel: texte(o['materiel'], `${ou}.materiel`),
    responsable: texte(o['responsable'], `${ou}.responsable`),
    pourClasse:
      pourClasse === null || pourClasse === undefined ? null : texte(pourClasse, `${ou}.pourClasse`),
    statut: parmi<StatutPret>(o['statut'], STATUTS_PRET, `${ou}.statut`),
    forfait: nombre(o['forfait'], `${ou}.forfait`),
    ...si(instantOpt(o['demandeLe'], `${ou}.demandeLe`), 'demandeLe'),
    ...si(instantOpt(o['sortiLe'], `${ou}.sortiLe`), 'sortiLe'),
    ...si(texteOpt(o['valideePar'], `${ou}.valideePar`), 'valideePar'),
    ...si(instantOpt(o['retourDeclareLe'], `${ou}.retourDeclareLe`), 'retourDeclareLe'),
    ...si(texteOpt(o['declaration'], `${ou}.declaration`), 'declaration'),
    ...si(texteOpt(o['manquant'], `${ou}.manquant`), 'manquant'),
    ...si(instantOpt(o['renduLe'], `${ou}.renduLe`), 'renduLe'),
  }
}

function lirePhoto(brut: unknown, ou: string): PhotoDeRetour {
  const o = objet(brut, ou)
  return {
    id: texte(o['id'], `${ou}.id`),
    pret: texte(o['pret'], `${ou}.pret`),
    materiel: texte(o['materiel'], `${ou}.materiel`),
    responsable: texte(o['responsable'], `${ou}.responsable`),
    ...si(texteOpt(o['fichier'], `${ou}.fichier`), 'fichier'),
    prisLe: instant(o['prisLe'], `${ou}.prisLe`),
    ...si(texteOpt(o['declaration'], `${ou}.declaration`), 'declaration'),
    ...si(texteOpt(o['composantSignale'], `${ou}.composantSignale`), 'composantSignale'),
    statut: parmi<StatutPhoto>(o['statut'], STATUTS_PHOTO, `${ou}.statut`),
    ...si(texteOpt(o['reempruntePar'], `${ou}.reempruntePar`), 'reempruntePar'),
    ...si(texteOpt(o['controlePar'], `${ou}.controlePar`), 'controlePar'),
    ...si(instantOpt(o['controleLe'], `${ou}.controleLe`), 'controleLe'),
    ...si(texteOpt(o['incident'], `${ou}.incident`), 'incident'),
  }
}

function lireIncident(brut: unknown, ou: string): Incident {
  const o = objet(brut, ou)
  return {
    id: texte(o['id'], `${ou}.id`),
    materiel: texte(o['materiel'], `${ou}.materiel`),
    responsable: texte(o['responsable'], `${ou}.responsable`),
    type: parmi<TypeIncident>(o['type'], TYPES_INCIDENT, `${ou}.type`),
    motif: texte(o['motif'], `${ou}.motif`),
    montant: nombre(o['montant'], `${ou}.montant`),
    ...si(nombreOpt(o['montantInitial'], `${ou}.montantInitial`), 'montantInitial'),
    ...si(texteOpt(o['ajustePar'], `${ou}.ajustePar`), 'ajustePar'),
    ...si(texteOpt(o['composant'], `${ou}.composant`), 'composant'),
    statut: parmi<StatutIncident>(o['statut'], STATUTS_INCIDENT, `${ou}.statut`),
    creeLe: instant(o['creeLe'], `${ou}.creeLe`),
    ...si(instantOpt(o['payeLe'], `${ou}.payeLe`), 'payeLe'),
  }
}

function lireCible(brut: unknown, ou: string): CibleSignalement {
  const o = objet(brut, ou)
  const type = texte(o['type'], `${ou}.type`)
  const id = texte(o['id'], `${ou}.id`)
  if (type === 'materiel') return { type: 'materiel', id }
  if (type === 'salle') return { type: 'salle', id }
  throw new SeedInvalide(`${ou}.type : « materiel » ou « salle » attendu, reçu « ${type} »`)
}

function lireSignalement(brut: unknown, ou: string): Signalement {
  const o = objet(brut, ou)
  return {
    id: texte(o['id'], `${ou}.id`),
    par: texte(o['par'], `${ou}.par`),
    cible: lireCible(o['cible'], `${ou}.cible`),
    categorie: parmi<CategorieSignalement>(o['categorie'], CATEGORIES_SIGNALEMENT, `${ou}.categorie`),
    texte: texte(o['texte'], `${ou}.texte`),
    photo: booleen(o['photo'], `${ou}.photo`),
    le: instant(o['le'], `${ou}.le`),
    statut: parmi<StatutSignalement>(o['statut'], STATUTS_SIGNALEMENT, `${ou}.statut`),
    ...si(texteOpt(o['traitePar'], `${ou}.traitePar`), 'traitePar'),
    ...si(instantOpt(o['traiteLe'], `${ou}.traiteLe`), 'traiteLe'),
  }
}

function lireNotification(brut: unknown, ou: string): Notification {
  const o = objet(brut, ou)
  const regle = texteOpt(o['regle'], `${ou}.regle`)
  return {
    id: texte(o['id'], `${ou}.id`),
    pour: liste(o['pour'], `${ou}.pour`).map((p, i) => texte(p, `${ou}.pour[${i}]`)),
    le: instant(o['le'], `${ou}.le`),
    icone: texte(o['icone'], `${ou}.icone`),
    texte: texte(o['texte'], `${ou}.texte`),
    lue: booleen(o['lue'], `${ou}.lue`),
    ...si(regle as Notification['regle'], 'regle'),
  }
}

function lireConsommable(brut: unknown, ou: string): Consommable {
  const o = objet(brut, ou)
  return {
    id: texte(o['id'], `${ou}.id`),
    nom: texte(o['nom'], `${ou}.nom`),
    unite: texte(o['unite'], `${ou}.unite`),
    icone: texte(o['icone'], `${ou}.icone`),
    quantite: nombre(o['quantite'], `${ou}.quantite`),
    seuil: nombre(o['seuil'], `${ou}.seuil`),
    dernierComptage: instant(o['dernierComptage'], `${ou}.dernierComptage`),
  }
}

function lireSalle(brut: unknown, ou: string): Salle {
  const o = objet(brut, ou)
  return {
    id: texte(o['id'], `${ou}.id`),
    attendus: nombre(o['attendus'], `${ou}.attendus`),
    presents: nombre(o['presents'], `${ou}.presents`),
    verifieeLe: instant(o['verifieeLe'], `${ou}.verifieeLe`),
  }
}

function lireLigneImport(brut: unknown, ou: string): LigneImport {
  const o = objet(brut, ou)
  const niv = o['niveau']
  return {
    nom: texte(o['nom'], `${ou}.nom`),
    categorie: texte(o['categorie'], `${ou}.categorie`),
    niveau: niv === null || niv === undefined ? null : niveau(niv, `${ou}.niveau`),
    lieu: texte(o['lieu'], `${ou}.lieu`),
    forfait: nombre(o['forfait'], `${ou}.forfait`),
    icone: texte(o['icone'], `${ou}.icone`),
    ...si(texteOpt(o['erreur'], `${ou}.erreur`), 'erreur'),
  }
}

/** Plus grand numéro d'identifiant déjà utilisé, pour que les nouveaux ids ne collisionnent pas. */
function prochaineSequence(ids: string[]): number {
  const numeros = ids.map((id) => Number(/(\d+)$/.exec(id)?.[1] ?? 0))
  return Math.max(0, ...numeros) + 1
}

// ─── Assemblage ──────────────────────────────────────────────────────────────

export function analyserSeed(source: unknown): EtatMDS {
  const o = objet(source, 'seed')
  const meta = objet(o['meta'], 'seed.meta')
  const horlogeBrute = objet(o['horloge'], 'seed.horloge')
  const bureau = objet(horlogeBrute['bureau'], 'seed.horloge.bureau')
  const reglagesBruts = objet(o['reglages'], 'seed.reglages')
  const charte = objet(reglagesBruts['charte'], 'seed.reglages.charte')
  const importBrut = objet(o['importExemple'], 'seed.importExemple')
  const inventaire = objet(importBrut['inventaire'], 'seed.importExemple.inventaire')
  const classesImport = objet(importBrut['classes'], 'seed.importExemple.classes')

  const categories: EtatMDS['categories'] = {}
  for (const [cle, valeur] of Object.entries(objet(o['categories'], 'seed.categories'))) {
    const c = objet(valeur, `seed.categories.${cle}`)
    categories[cle] = {
      nom: texte(c['nom'], `seed.categories.${cle}.nom`),
      court: texte(c['court'], `seed.categories.${cle}.court`),
      ...si(
        c['reserveA'] === undefined
          ? undefined
          : parmi(c['reserveA'], ROLES, `seed.categories.${cle}.reserveA`),
        'reserveA',
      ),
    }
  }

  const prevenus: EtatMDS['prevenus'] = {}
  for (const [type, valeur] of Object.entries(objet(o['prevenus'], 'seed.prevenus'))) {
    prevenus[type] = liste(valeur, `seed.prevenus.${type}`).map((p, i) =>
      texte(p, `seed.prevenus.${type}[${i}]`),
    )
  }

  const exemptions: EtatMDS['exemptions'] = {}
  for (const [qui, valeur] of Object.entries(objet(o['exemptions'], 'seed.exemptions'))) {
    exemptions[qui] = texte(valeur, `seed.exemptions.${qui}`)
  }

  const personnes = liste(o['personnes'], 'seed.personnes').map((p, i) =>
    lirePersonne(p, `seed.personnes[${i}]`),
  )
  const materiels = liste(o['materiels'], 'seed.materiels').map((m, i) =>
    lireMateriel(m, `seed.materiels[${i}]`),
  )
  const prets = liste(o['prets'], 'seed.prets').map((p, i) => lirePret(p, `seed.prets[${i}]`))
  const photosDeRetour = liste(o['photosDeRetour'], 'seed.photosDeRetour').map((p, i) =>
    lirePhoto(p, `seed.photosDeRetour[${i}]`),
  )
  const incidents = liste(o['incidents'], 'seed.incidents').map((x, i) =>
    lireIncident(x, `seed.incidents[${i}]`),
  )
  const signalements = liste(o['signalements'], 'seed.signalements').map((x, i) =>
    lireSignalement(x, `seed.signalements[${i}]`),
  )
  const notifications = liste(o['notifications'], 'seed.notifications').map((x, i) =>
    lireNotification(x, `seed.notifications[${i}]`),
  )
  const comptages = liste(o['comptages'], 'seed.comptages').map((x, i) => {
    const c = objet(x, `seed.comptages[${i}]`)
    const quantites: Record<string, number> = {}
    for (const [cle, valeur] of Object.entries(objet(c['quantites'], `seed.comptages[${i}].quantites`))) {
      quantites[cle] = nombre(valeur, `seed.comptages[${i}].quantites.${cle}`)
    }
    return {
      le: instant(c['le'], `seed.comptages[${i}].le`),
      par: texte(c['par'], `seed.comptages[${i}].par`),
      quantites,
    }
  })

  const etat: EtatMDS = {
    version: nombre(meta['version'], 'seed.meta.version'),
    horloge: {
      maintenant: instant(horlogeBrute['maintenant'], 'seed.horloge.maintenant'),
      bureau: {
        ouverture: texte(bureau['ouverture'], 'seed.horloge.bureau.ouverture'),
        fermeture: texte(bureau['fermeture'], 'seed.horloge.bureau.fermeture'),
      },
      rappel: texte(horlogeBrute['rappel'], 'seed.horloge.rappel'),
      recap: texte(horlogeBrute['recap'], 'seed.horloge.recap'),
    },
    categories,
    lieux: liste(o['lieux'], 'seed.lieux').map((l, i) => texte(l, `seed.lieux[${i}]`)),
    classes: liste(o['classes'], 'seed.classes').map((c, i) => texte(c, `seed.classes[${i}]`)),
    personnes,
    materiels,
    prets,
    photosDeRetour,
    prevenus,
    incidents,
    signalements,
    notifications,
    consommables: liste(o['consommables'], 'seed.consommables').map((c, i) =>
      lireConsommable(c, `seed.consommables[${i}]`),
    ),
    comptages,
    salles: liste(o['salles'], 'seed.salles').map((s, i) => lireSalle(s, `seed.salles[${i}]`)),
    reglages: {
      charte: {
        titre: texte(charte['titre'], 'seed.reglages.charte.titre'),
        articles: liste(charte['articles'], 'seed.reglages.charte.articles').map((a, i) => {
          const art = objet(a, `seed.reglages.charte.articles[${i}]`)
          return {
            id: texte(art['id'], `seed.reglages.charte.articles[${i}].id`),
            titre: texte(art['titre'], `seed.reglages.charte.articles[${i}].titre`),
            texte: texte(art['texte'], `seed.reglages.charte.articles[${i}].texte`),
          }
        }),
      },
      charteModifieeLe: instant(reglagesBruts['charteModifieeLe'], 'seed.reglages.charteModifieeLe'),
      rappel1630: booleen(reglagesBruts['rappel1630'], 'seed.reglages.rappel1630'),
      recap8h: booleen(reglagesBruts['recap8h'], 'seed.reglages.recap8h'),
    },
    exemptions,
    importExemple: {
      inventaire: {
        fichier: texte(inventaire['fichier'], 'seed.importExemple.inventaire.fichier'),
        deposePar: texte(inventaire['deposePar'], 'seed.importExemple.inventaire.deposePar'),
        deposeLe: instant(inventaire['deposeLe'], 'seed.importExemple.inventaire.deposeLe'),
        lignes: liste(inventaire['lignes'], 'seed.importExemple.inventaire.lignes').map((l, i) =>
          lireLigneImport(l, `seed.importExemple.inventaire.lignes[${i}]`),
        ),
      },
      classes: {
        fichier: texte(classesImport['fichier'], 'seed.importExemple.classes.fichier'),
        classes: liste(classesImport['classes'], 'seed.importExemple.classes.classes').map((c, i) =>
          texte(c, `seed.importExemple.classes.classes[${i}]`),
        ),
      },
    },
    recap: null,
    sequence: prochaineSequence([
      ...prets.map((p) => p.id),
      ...incidents.map((i) => i.id),
      ...signalements.map((s) => s.id),
      ...photosDeRetour.map((p) => p.id),
      ...notifications.map((n) => n.id),
    ]),
  }

  verifierCoherence(etat)

  // Le récap de 8h est un instantané : on le génère une fois au chargement, daté de 8:00.
  if (etat.reglages.recap8h) {
    etat.recap = construireRecap(etat, hor.aHeure(etat.horloge.maintenant, etat.horloge.recap))
  }

  return etat
}

/** Invariants que tout jeu de données doit respecter, seed livré comme seed modifié à la main. */
export function verifierCoherence(etat: EtatMDS): void {
  const idsMateriels = new Set(etat.materiels.map((m) => m.id))
  const idsPersonnes = new Set(etat.personnes.map((p) => p.id))

  const ouvertsParMateriel = new Map<string, string[]>()
  for (const pret of etat.prets) {
    if (!idsMateriels.has(pret.materiel)) {
      throw new SeedInvalide(`Prêt ${pret.id} : matériel inconnu « ${pret.materiel} »`)
    }
    if (!idsPersonnes.has(pret.responsable)) {
      throw new SeedInvalide(`Prêt ${pret.id} : responsable inconnu « ${pret.responsable} »`)
    }
    if (['remise_a_valider', 'actif', 'retour_a_valider'].includes(pret.statut)) {
      const deja = ouvertsParMateriel.get(pret.materiel) ?? []
      ouvertsParMateriel.set(pret.materiel, [...deja, pret.id])
    }
  }

  for (const [materielId, ids] of ouvertsParMateriel) {
    if (ids.length > 1) {
      throw new SeedInvalide(`Matériel ${materielId} : ${ids.length} prêts ouverts (${ids.join(', ')})`)
    }
  }

  for (const m of etat.materiels) {
    const aUnPretOuvert = ouvertsParMateriel.has(m.id)
    const devraitEnAvoir = ['emprunte', 'remise_a_valider', 'retour_a_valider'].includes(m.statut)
    if (devraitEnAvoir && !aUnPretOuvert) {
      throw new SeedInvalide(`Matériel ${m.id} : statut « ${m.statut} » sans prêt ouvert`)
    }
    if (!devraitEnAvoir && aUnPretOuvert) {
      throw new SeedInvalide(`Matériel ${m.id} : statut « ${m.statut} » alors qu'un prêt est ouvert`)
    }
  }

  for (const incident of etat.incidents) {
    if (!idsMateriels.has(incident.materiel)) {
      throw new SeedInvalide(`Incident ${incident.id} : matériel inconnu « ${incident.materiel} »`)
    }
    if (!idsPersonnes.has(incident.responsable)) {
      throw new SeedInvalide(`Incident ${incident.id} : responsable inconnu « ${incident.responsable} »`)
    }
  }

  for (const sig of etat.signalements) {
    if (sig.cible.type === 'materiel' && !idsMateriels.has(sig.cible.id)) {
      throw new SeedInvalide(`Signalement ${sig.id} : matériel inconnu « ${sig.cible.id} »`)
    }
    if (sig.cible.type === 'salle' && !etat.salles.some((s) => s.id === sig.cible.id)) {
      throw new SeedInvalide(`Signalement ${sig.id} : salle inconnue « ${sig.cible.id} »`)
    }
  }
}

/** Personas ouvertes par défaut dans le panneau de démo. */
export const PERSONA_PAR_DEFAUT = {
  app: 'ines',
  backOffice: 'lydia',
} as const

/** L'état de départ de la démo, rechargé aussi par « Réinitialiser la démo ». */
export const chargerSeed = (): EtatMDS => analyserSeed(seedBrut as unknown)

/** Version du seed, incluse dans la clé de persistance : un seed modifié réinitialise la démo. */
export const VERSION_SEED = (seedBrut as { meta: { version: number } }).meta.version
