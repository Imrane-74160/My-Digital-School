/**
 * Cartes et lignes de l'app mobile (section « Cartes mobile » du Figma).
 *
 * Carte de prêt (64:408) · Raccourci (64:438) · Ligne de catalogue (64:487) ·
 * Ligne d'information (64:494) · Ligne de montant (64:506) · Case avec libellé (64:520) ·
 * Étape (64:526) · Matériel détecté (98:4066) · Notification (98:4033) ·
 * Action du compte (98:4057).
 */
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { BadgeDeStatut } from './BadgeDeStatut'
import { Bouton } from './Bouton'
import { Icone } from './Icone'
import { Pictogramme } from './Pictogramme'
import type { NomIcone } from './icones'
import type { StatutBadge } from './statuts'
import type { TeintePictogramme } from './variantes'

// ─── Carte de prêt (64:408) ──────────────────────────────────────────────────

/**
 * Une ligne de « Mes prêts ». État `En cours` : vignette, nom, détail et bouton Rendre.
 * État `Demande envoyée` : bordure orange et consigne sous le nom, sans bouton.
 */
export function CarteDePret({
  icone,
  teinte = 'Neutre',
  nom,
  detail,
  statut,
  action,
  consigne,
  alerte = false,
}: {
  icone: NomIcone
  teinte?: TeintePictogramme
  nom: string
  detail: string
  statut: StatutBadge
  /** Bouton d'action à droite, ex. « Rendre ». */
  action?: ReactNode
  /** Consigne affichée sous le nom, ex. « Présente-toi à l'armoire du studio ». */
  consigne?: ReactNode
  /** Encadre la carte en orange, comme l'état « Demande envoyée » du Figma. */
  alerte?: boolean
}) {
  return (
    <article
      className={[
        'flex flex-col gap-md rounded-carte-mobile bg-surface-carte p-md',
        alerte ? 'ring-1 ring-marque-orange' : '',
      ].join(' ')}
    >
      <div className="flex items-center gap-md">
        <Pictogramme icone={icone} teinte={teinte} taille={52} />
        <div className="flex min-w-0 flex-1 flex-col gap-xs">
          <p className="mds-titre-carte text-texte-principal">{nom}</p>
          <span className="flex items-center gap-sm">
            <BadgeDeStatut statut={statut} libelle={detail} />
          </span>
        </div>
        {action}
      </div>
      {consigne}
    </article>
  )
}

// ─── Raccourci (64:438) ──────────────────────────────────────────────────────

/** Tuile de raccourci de l'accueil : « Voir le matériel », « Signaler ». */
export function Raccourci({
  vers,
  icone,
  titre,
  detail,
}: {
  vers: string
  icone: NomIcone
  titre: string
  detail: string
}) {
  return (
    <Link
      to={vers}
      className="flex flex-1 flex-col gap-md rounded-carte-mobile bg-surface-carte p-lg transition-transform duration-appui ease-sortie active:scale-[0.98]"
    >
      <span className="flex items-start justify-between">
        <span className="inline-flex size-[40px] items-center justify-center rounded-rond border border-texte-principal text-texte-principal">
          <Icone nom={icone} taille="xl" />
        </span>
        <Icone nom="Flèche" taille="lg" className="text-texte-tertiaire" />
      </span>
      <span className="flex flex-col">
        <span className="mds-texte-corps-fort text-texte-principal">{titre}</span>
        <span className="mds-texte-petit text-texte-secondaire">{detail}</span>
      </span>
    </Link>
  )
}

// ─── Ligne de catalogue (64:487) ─────────────────────────────────────────────

/**
 * Une ligne du catalogue mobile : un TYPE de matériel, son badge et son mode de remise.
 * Action « Détail » (chevron) ou « Me prévenir » (cloche), selon la disponibilité.
 */
export function LigneDeCatalogue({
  icone,
  teinte = 'Neutre',
  nom,
  statut,
  libelleStatut,
  modeDeRemise,
  vers,
  onPrevenir,
  inscrit = false,
}: {
  icone: NomIcone
  teinte?: TeintePictogramme
  nom: string
  statut: StatutBadge
  libelleStatut?: string
  modeDeRemise: string
  /** Adresse de la fiche. Absent = le type n'a aucune unité disponible. */
  vers?: string
  /** Inscription « Me prévenir ». Affiche la cloche à la place du chevron. */
  onPrevenir?: () => void
  inscrit?: boolean
}) {
  const contenu = (
    <>
      <Pictogramme icone={icone} teinte={teinte} taille={44} />
      <span className="flex min-w-0 flex-1 flex-col gap-xs">
        <span className="mds-texte-corps-fort truncate text-texte-principal">{nom}</span>
        <span className="flex items-center gap-sm">
          <BadgeDeStatut statut={statut} libelle={libelleStatut} />
          <span className="mds-texte-petit truncate text-texte-secondaire">{modeDeRemise}</span>
        </span>
      </span>
    </>
  )

  if (vers) {
    return (
      <Link
        to={vers}
        className="flex items-center gap-md rounded-carte-mobile p-md transition-colors duration-appui ease-sortie active:bg-surface-champ"
      >
        {contenu}
        <Icone nom="Chevron droit" taille="lg" className="shrink-0 text-texte-tertiaire" />
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-md rounded-carte-mobile p-md">
      {contenu}
      {onPrevenir && (
        <button
          type="button"
          onClick={onPrevenir}
          aria-pressed={inscrit}
          aria-label={inscrit ? `Tu seras prévenu(e) pour ${nom}` : `Me prévenir pour ${nom}`}
          className={[
            'inline-flex size-[40px] shrink-0 items-center justify-center rounded-rond',
            'transition-colors duration-rapide ease-sortie',
            inscrit
              ? 'bg-marque-turquoise-clair text-marque-turquoise-fonce'
              : 'bg-surface-bouton-doux text-texte-principal',
          ].join(' ')}
        >
          <Icone nom="Cloche" taille="xl" />
        </button>
      )}
    </div>
  )
}

// ─── Ligne d'information (64:494) ────────────────────────────────────────────

/** Une ligne « libellé → valeur » des blocs d'information. */
export function LigneDInformation({
  icone,
  libelle,
  valeur,
}: {
  icone: NomIcone
  libelle: string
  valeur: ReactNode
}) {
  return (
    <div className="flex items-center gap-md border-b border-trait-bordure px-lg py-md last:border-b-0">
      <Icone nom={icone} taille="lg" className="shrink-0 text-texte-tertiaire" />
      <span className="mds-texte-petit flex-1 text-texte-secondaire">{libelle}</span>
      <span className="mds-texte-corps-fort text-right text-texte-principal">{valeur}</span>
    </div>
  )
}

// ─── Ligne de montant (64:506) ───────────────────────────────────────────────

/** Ligne de forfait de la feuille Emprunter. Fond Sombre pour le total. */
export function LigneDeMontant({
  libelle,
  precision,
  montant,
  sombre = false,
}: {
  libelle: string
  precision?: string
  montant: string
  sombre?: boolean
}) {
  return (
    <div
      className={[
        'flex items-center justify-between gap-md rounded-carte-mobile px-lg py-md',
        sombre ? 'bg-marque-anthracite text-texte-inverse' : 'bg-surface-champ text-texte-principal',
      ].join(' ')}
    >
      <span className="flex min-w-0 flex-col">
        <span className="mds-texte-corps-fort">{libelle}</span>
        {precision && (
          <span className={`mds-texte-petit ${sombre ? 'opacity-70' : 'text-texte-secondaire'}`}>
            {precision}
          </span>
        )}
      </span>
      <span className={sombre ? 'mds-chiffre-l' : 'mds-texte-corps-fort'}>{montant}</span>
    </div>
  )
}

/** Une ligne de composant dans le détail du forfait. */
export function LigneDeComposant({ nom, montant }: { nom: string; montant: string }) {
  return (
    <div className="flex items-center justify-between gap-md px-lg">
      <span className="mds-texte-petit truncate text-texte-secondaire">{nom}</span>
      <span className="mds-mono-code shrink-0 text-texte-secondaire">{montant}</span>
    </div>
  )
}

// ─── Étape (64:526) ──────────────────────────────────────────────────────────

/** Titre d'étape de l'écran Rendre : « Étape 1 · Vérifie le contenu ». */
export function Etape({ numero, titre }: { numero: number; titre: string }) {
  return (
    <div className="flex items-center gap-sm px-lg pt-lg pb-sm">
      <span className="mds-mono-micro inline-flex size-[22px] items-center justify-center rounded-rond bg-marque-anthracite text-texte-inverse">
        {numero}
      </span>
      <span className="mds-texte-corps-fort text-texte-principal">{titre}</span>
    </div>
  )
}

// ─── Matériel détecté (98:4066) ──────────────────────────────────────────────

/** Ligne de la feuille « À proximité » du scanner. */
export function MaterielDetecte({
  icone,
  teinte = 'Neutre',
  nom,
  statut,
  libelleStatut,
  vers,
}: {
  icone: NomIcone
  teinte?: TeintePictogramme
  nom: string
  statut: StatutBadge
  libelleStatut?: string
  vers: string
}) {
  return (
    <Link
      to={vers}
      className="flex items-center gap-md rounded-carte-mobile bg-surface-carte p-md transition-colors duration-appui ease-sortie active:bg-surface-champ"
    >
      <Pictogramme icone={icone} teinte={teinte} taille={40} />
      <span className="flex min-w-0 flex-1 flex-col gap-xs">
        <span className="mds-texte-corps-fort truncate text-texte-principal">{nom}</span>
        <BadgeDeStatut statut={statut} libelle={libelleStatut} />
      </span>
      <Icone nom="Chevron droit" taille="lg" className="shrink-0 text-texte-tertiaire" />
    </Link>
  )
}

// ─── Notification (98:4033) ──────────────────────────────────────────────────

/** Une notification de l'écran Alertes. Non lue : fond teinté et pastille. */
export function LigneDeNotification({
  icone,
  texte,
  heure,
  regle,
  lue,
}: {
  icone: NomIcone
  texte: string
  heure: string
  regle?: string
  lue: boolean
}) {
  return (
    <article
      className={[
        'flex items-start gap-md rounded-carte-mobile p-md',
        lue ? 'bg-surface-carte' : 'bg-marque-turquoise-clair',
      ].join(' ')}
    >
      <span
        className={[
          'inline-flex size-[40px] shrink-0 items-center justify-center rounded-rond',
          lue ? 'bg-surface-champ text-texte-secondaire' : 'bg-surface-carte text-marque-turquoise-fonce',
        ].join(' ')}
      >
        <Icone nom={icone} taille="xl" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-xs">
        <span className="mds-texte-corps text-texte-principal">{texte}</span>
        <span className="flex items-center gap-sm">
          <span className="mds-mono-micro text-texte-tertiaire">{heure}</span>
          {regle && <span className="mds-mono-micro text-texte-tertiaire">· {regle}</span>}
        </span>
      </span>
      {!lue && (
        <span
          aria-label="Non lue"
          className="mt-[6px] size-[8px] shrink-0 rounded-rond bg-marque-turquoise"
        />
      )}
    </article>
  )
}

// ─── Action du compte (98:4057) ──────────────────────────────────────────────

/** Ligne d'action du Profil. Type Danger pour « Se déconnecter ». */
export function ActionDuCompte({
  icone,
  libelle,
  onClick,
  vers,
  danger = false,
}: {
  icone: NomIcone
  libelle: string
  onClick?: () => void
  vers?: string
  danger?: boolean
}) {
  const classes = [
    'flex w-full items-center gap-md rounded-carte-mobile bg-surface-carte p-lg',
    'transition-colors duration-appui ease-sortie active:bg-surface-champ',
    danger ? 'text-marque-rose-fonce' : 'text-texte-principal',
  ].join(' ')

  const contenu = (
    <>
      <span
        className={[
          'inline-flex size-[40px] shrink-0 items-center justify-center rounded-rond',
          danger ? 'bg-marque-rose-clair' : 'bg-surface-champ',
        ].join(' ')}
      >
        <Icone nom={icone} taille="xl" />
      </span>
      <span className="mds-texte-corps-fort flex-1 text-left">{libelle}</span>
      {!danger && <Icone nom="Chevron droit" taille="lg" className="text-texte-tertiaire" />}
    </>
  )

  if (vers) {
    return (
      <Link to={vers} className={classes}>
        {contenu}
      </Link>
    )
  }
  return (
    <button type="button" onClick={onClick} className={classes}>
      {contenu}
    </button>
  )
}

// ─── Bouton d'action pleine largeur ──────────────────────────────────────────

/** Le bouton principal d'un écran mobile, en taille L pleine largeur. */
export function BoutonPrincipalMobile({
  libelle,
  onClick,
  disabled,
  icone,
  type = 'Principal',
}: {
  libelle: string
  onClick?: () => void
  disabled?: boolean
  icone?: NomIcone
  type?: 'Principal' | 'Secondaire' | 'Alerte'
}) {
  return (
    <Bouton
      libelle={libelle}
      type={type}
      taille="L"
      pleineLargeur
      {...(icone === undefined ? {} : { icone })}
      {...(onClick === undefined ? {} : { onClick })}
      {...(disabled === undefined ? {} : { disabled })}
    />
  )
}
