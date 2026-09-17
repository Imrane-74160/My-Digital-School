/**
 * Éléments de structure : cartes, barre d'état, en-têtes d'écran, titres de section.
 *
 * Plusieurs composants par fichier : la règle de rafraîchissement à chaud n'interdit
 * que de mélanger composants et constantes, pas plusieurs composants entre eux.
 */
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { BoutonIcone } from './BoutonIcone'
import { Icone } from './Icone'
import type { NomIcone } from './icones'

// ─── Carte ───────────────────────────────────────────────────────────────────

/**
 * Carte du design system. Back-office : rayon 36, trait de bordure, pas d'ombre.
 * Mobile : rayon 28, fond blanc (cf. `docs/04-design-system.md`).
 */
export function Carte({
  children,
  mobile = false,
  className,
}: {
  children: ReactNode
  mobile?: boolean
  className?: string
}) {
  return (
    <section
      className={[
        'bg-surface-carte',
        mobile ? 'rounded-carte-mobile' : 'rounded-carte ring-1 ring-trait-bordure',
        className ?? '',
      ].join(' ')}
    >
      {children}
    </section>
  )
}

/** Carte anthracite, pour la carte « À rendre ce soir » de l'accueil mobile. */
export function CarteSombre({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-carte-mobile bg-marque-anthracite ${className ?? ''}`}>{children}</section>
  )
}

// ─── Barre d'état (61:147) ───────────────────────────────────────────────────

/** Barre d'état du téléphone : heure à gauche, réseau et batterie à droite. */
export function BarreDEtat({ heure }: { heure: string }) {
  return (
    <div
      aria-hidden
      className="flex h-[42px] shrink-0 items-center justify-between px-2xl pt-sm text-texte-principal"
    >
      <span className="mds-texte-petit-fort">{heure}</span>
      <span className="flex items-center gap-xs">
        <svg width="18" height="11" viewBox="0 0 18 11" fill="none" aria-hidden>
          <rect x="0" y="7" width="3" height="4" rx="1" fill="currentColor" />
          <rect x="5" y="5" width="3" height="6" rx="1" fill="currentColor" />
          <rect x="10" y="2" width="3" height="9" rx="1" fill="currentColor" />
          <rect x="15" y="0" width="3" height="11" rx="1" fill="currentColor" opacity="0.3" />
        </svg>
        <Icone nom="Batterie" taille="2xl" />
      </span>
    </div>
  )
}

// ─── En-tête d'écran mobile ──────────────────────────────────────────────────

/** En-tête d'un écran mobile : bouton retour ou fermeture, titre, sous-titre. */
export function EnTeteEcranMobile({
  titre,
  sousTitre,
  retour,
  fermer,
  aDroite,
}: {
  titre: string
  sousTitre?: string
  /** Adresse du bouton retour. Absent = pas de bouton. */
  retour?: string
  /** Adresse du bouton fermer, qui remplace le retour. */
  fermer?: string
  aDroite?: ReactNode
}) {
  return (
    <header className="flex items-start gap-md px-lg pt-[10px] pb-md">
      {(retour ?? fermer) && (
        <Link to={(retour ?? fermer)!} aria-label={retour ? 'Retour' : 'Fermer'} className="shrink-0">
          <span className="inline-flex size-[44px] items-center justify-center rounded-rond bg-surface-bouton-doux text-texte-principal">
            <Icone nom={retour ? 'Chevron gauche' : 'Croix'} taille="2xl" />
          </span>
        </Link>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Titre vide : l'écran porte son propre titre plus bas (fiche matériel), pas deux h1. */}
        {titre !== '' && <h1 className="mds-titre-ecran-mobile text-texte-principal">{titre}</h1>}
        {sousTitre && <p className="mds-texte-petit text-texte-secondaire">{sousTitre}</p>}
      </div>
      {aDroite}
    </header>
  )
}

// ─── Titre de section (64:537) ───────────────────────────────────────────────

/** Titre de section mobile, avec un lien ou un compteur en complément. */
export function TitreDeSection({
  titre,
  lien,
  libelleLien,
  compteur,
}: {
  titre: string
  lien?: string
  libelleLien?: string
  compteur?: number
}) {
  return (
    <div className="flex items-baseline justify-between px-lg pt-lg pb-sm">
      <h2 className="mds-titre-carte text-texte-principal">{titre}</h2>
      {lien && libelleLien && (
        <Link className="mds-texte-petit-fort text-marque-turquoise-fonce" to={lien}>
          {libelleLien}
        </Link>
      )}
      {compteur !== undefined && <span className="mds-mono-code text-texte-tertiaire">{compteur}</span>}
    </div>
  )
}

// ─── En-tête de page du back-office (61:274) ─────────────────────────────────

/** En-tête du back-office : logo, retour, titre, fil d'Ariane, actions, compte. */
export function EnTeteDePage({
  titre,
  filDAriane,
  retour,
  compte,
}: {
  titre: string
  /** Segments du fil d'Ariane, ex. « Accueil / Validations sur place ». */
  filDAriane?: string[]
  /** Adresse du bouton retour. Absent sur le tableau de bord. */
  retour?: string
  compte: ReactNode
}) {
  return (
    <header data-testid="en-tete-back-office" className="flex items-center gap-lg px-lg py-md">
      <span className="mds-texte-corps-fort shrink-0 text-marque-anthracite">MyDigitalSchool</span>

      {retour && (
        <Link to={retour} aria-label="Retour au tableau de bord" className="shrink-0">
          <span className="inline-flex size-[40px] items-center justify-center rounded-rond bg-surface-bouton-doux text-texte-principal">
            <Icone nom="Retour" taille="xl" />
          </span>
        </Link>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <h1 className="mds-titre-page truncate text-texte-principal">{titre}</h1>
        {filDAriane && filDAriane.length > 0 && (
          <p className="mds-texte-petit text-texte-tertiaire">{filDAriane.join(' / ')}</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-sm">
        <BoutonIcone icone="Loupe" titre="Rechercher" />
        <BoutonIcone icone="Réglages" titre="Filtres" />
        <BoutonIcone icone="Cloche" titre="Notifications" />
        {compte}
      </div>
    </header>
  )
}

// ─── Visuel de matériel ──────────────────────────────────────────────────────

/**
 * Visuel d'un matériel : pictogramme sur fond rayé, comme le prévoit `docs/04`
 * (« pas de photos, pictogrammes sur fond rayé »). Sert aussi de photo simulée.
 */
export function VisuelMateriel({
  icone,
  hauteur = 190,
  children,
  className,
}: {
  icone: NomIcone
  hauteur?: number
  /** Badges ou boutons superposés au visuel. */
  children?: ReactNode
  className?: string
}) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-carte-mobile ${className ?? ''}`}
      style={{ height: hauteur }}
    >
      {/* Motif de rayures construit sur le token trait/rayure : aucune couleur en dur. */}
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, var(--mds-trait-rayure) 0 1.5px, transparent 1.5px 12px)',
          opacity: 0.55,
        }}
      />
      <span
        aria-hidden
        className="relative inline-flex items-center justify-center rounded-carte-mobile bg-surface-carte text-texte-principal"
        style={{ width: hauteur / 2, height: hauteur / 2 }}
      >
        <Icone nom={icone} pixels={Math.round(hauteur / 4)} />
      </span>
      {children}
    </div>
  )
}

// ─── Encart d'information ────────────────────────────────────────────────────

export type TonEncart = 'neutre' | 'turquoise' | 'orange' | 'rose'

const TONS_ENCART: Record<TonEncart, string> = {
  neutre: 'bg-surface-champ text-texte-secondaire',
  turquoise: 'bg-marque-turquoise-clair text-marque-turquoise-fonce',
  orange: 'bg-marque-orange-clair text-marque-orange-fonce',
  rose: 'bg-marque-rose-clair text-marque-rose-fonce',
}

/** Consigne ou message d'état, avec son icône. */
export function Encart({
  icone,
  children,
  ton = 'neutre',
  className,
}: {
  icone: NomIcone
  children: ReactNode
  ton?: TonEncart
  className?: string
}) {
  return (
    <p
      className={[
        'flex items-start gap-sm rounded-carte-mobile px-lg py-md',
        'mds-texte-petit',
        TONS_ENCART[ton],
        className ?? '',
      ].join(' ')}
    >
      <span className="mt-[1px] shrink-0">
        <Icone nom={icone} taille="lg" />
      </span>
      <span className="flex-1">{children}</span>
    </p>
  )
}

// ─── Zone d'action mobile ────────────────────────────────────────────────────

/** Zone d'action en bas d'écran mobile, qui porte le bouton principal. */
export function ZoneDAction({ children }: { children: ReactNode }) {
  return <div className="shrink-0 px-lg pt-xs pb-2xl">{children}</div>
}

// ─── État vide ───────────────────────────────────────────────────────────────

/** État vide d'une liste, construit avec les composants existants. */
export function EtatVide({ icone, titre, detail }: { icone: NomIcone; titre: string; detail?: string }) {
  return (
    <div className="flex flex-col items-center gap-sm px-xl py-3xl text-center">
      <span className="inline-flex size-[56px] items-center justify-center rounded-rond bg-surface-champ text-texte-tertiaire">
        <Icone nom={icone} pixels={28} />
      </span>
      <p className="mds-titre-carte text-texte-principal">{titre}</p>
      {detail && <p className="mds-texte-petit text-texte-secondaire">{detail}</p>}
    </div>
  )
}
