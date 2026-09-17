/**
 * Cartes et lignes du back-office (section « Cartes BO » du Figma).
 *
 * Indicateur (63:276) · Action à faire (63:319) · Ligne de stock (63:339) ·
 * Carte de stock (98:4006) · Règle (63:346) · Prêt de classe (63:358) ·
 * Ligne de forfait (63:367) · Carte d'incident (63:393) · Ligne de réglage (98:4013) ·
 * Carte photo de retour (63:486) · Carte de validation (63:568).
 */
import type { ReactNode } from 'react'
import { BadgeDeStatut } from './BadgeDeStatut'
import { Bouton } from './Bouton'
import { Icone } from './Icone'
import { Pictogramme } from './Pictogramme'
import type { NomIcone } from './icones'
import type { TeintePictogramme } from './variantes'

// ─── Indicateur (63:276) ─────────────────────────────────────────────────────

export type TonIndicateur = 'Neutre' | 'Retard' | 'Attention'

const TONS_INDICATEUR: Record<TonIndicateur, string> = {
  Neutre: 'bg-surface-champ text-texte-principal',
  Retard: 'bg-marque-rose-clair text-marque-rose-fonce',
  Attention: 'bg-marque-orange-clair text-marque-orange-fonce',
}

/** Une tuile de la carte « En ce moment » : une valeur et son libellé. */
export function Indicateur({
  valeur,
  libelle,
  ton = 'Neutre',
}: {
  valeur: number | string
  libelle: string
  ton?: TonIndicateur
}) {
  return (
    <div
      className={`flex flex-col gap-xs rounded-vignette px-lg py-md ${TONS_INDICATEUR[ton]}`}
      data-ton={ton}
    >
      <span className="mds-chiffre-l">{valeur}</span>
      <span className="mds-texte-petit">{libelle}</span>
    </div>
  )
}

// ─── Action à faire (63:319) ─────────────────────────────────────────────────

/**
 * Une ligne de la carte « À faire maintenant ». L'action est un bouton Principal,
 * un bouton Secondaire, ou la mention verrouillée « Réservé à Sandrine » (R12).
 */
export function ActionAFaire({
  icone,
  teinte = 'Neutre',
  titre,
  detail,
  libelleAction,
  onAction,
  principale = false,
  reserveASandrine = false,
}: {
  icone: NomIcone
  teinte?: TeintePictogramme
  titre: string
  detail: string
  libelleAction: string
  onAction: () => void
  principale?: boolean
  reserveASandrine?: boolean
}) {
  return (
    <div className="flex items-center gap-md border-b border-trait-bordure px-xl py-md last:border-b-0">
      <Pictogramme icone={icone} teinte={teinte} taille={40} />
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="mds-texte-corps-fort truncate text-texte-principal">{titre}</p>
        <p className="mds-texte-petit truncate text-texte-secondaire">{detail}</p>
      </div>
      {reserveASandrine ? (
        <button
          type="button"
          onClick={onAction}
          className="mds-texte-petit inline-flex shrink-0 items-center gap-xs rounded-bouton px-md py-sm text-texte-tertiaire"
        >
          <Icone nom="Cadenas" taille="sm" />
          Réservé à Sandrine
        </button>
      ) : (
        <Bouton
          libelle={libelleAction}
          type={principale ? 'Principal' : 'Secondaire'}
          icone={principale ? 'Coche' : undefined}
          onClick={onAction}
        />
      )}
    </div>
  )
}

// ─── Ligne de stock (63:339) et Carte de stock (98:4006) ─────────────────────

/** Jauge d'un consommable, rayée quand la quantité passe sous le seuil. */
function Jauge({ quantite, seuil }: { quantite: number; seuil: number }) {
  const bas = quantite < seuil
  // La jauge sature à deux fois le seuil, pour rester lisible.
  const part = Math.min(100, Math.round((quantite / Math.max(1, seuil * 2)) * 100))
  return (
    <span className="block h-[8px] w-full overflow-hidden rounded-rond bg-surface-pastille">
      <span
        className={`block h-full rounded-rond ${bas ? '' : 'bg-marque-turquoise'}`}
        style={{
          width: `${Math.max(6, part)}%`,
          ...(bas
            ? {
                backgroundImage:
                  'repeating-linear-gradient(45deg, var(--mds-marque-orange) 0 3px, var(--mds-marque-orange-clair) 3px 6px)',
              }
            : {}),
        }}
      />
    </span>
  )
}

/** Ligne de stock compacte, pour la carte Consommables du tableau de bord. */
export function LigneDeStock({ nom, quantite, seuil }: { nom: string; quantite: number; seuil: number }) {
  return (
    <div className="flex flex-col gap-xs px-xl py-sm">
      <div className="flex items-baseline justify-between gap-md">
        <span
          className={`mds-texte-corps-fort ${quantite < seuil ? 'text-marque-orange-fonce' : 'text-texte-principal'}`}
        >
          {nom}
        </span>
        <span className="mds-mono-code text-texte-tertiaire">
          {quantite} · seuil {seuil}
        </span>
      </div>
      <Jauge quantite={quantite} seuil={seuil} />
    </div>
  )
}

/** Carte de stock de l'écran Consommables, avec son badge et son champ de comptage. */
export function CarteDeStock({
  nom,
  unite,
  icone,
  quantite,
  seuil,
  dernierComptage,
  saisie,
  onSaisie,
}: {
  nom: string
  unite: string
  icone: NomIcone
  quantite: number
  seuil: number
  dernierComptage: string
  saisie: string
  onSaisie: (valeur: string) => void
}) {
  const bas = quantite < seuil
  return (
    <article className="flex flex-col gap-md rounded-carte bg-surface-carte p-xl ring-1 ring-trait-bordure">
      <div className="flex items-start gap-md">
        <Pictogramme icone={icone} teinte={bas ? 'Orange' : 'Turquoise'} taille={44} />
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="mds-titre-carte text-texte-principal">{nom}</p>
          <p className="mds-texte-petit text-texte-secondaire">
            {quantite} {unite} en stock
          </p>
        </div>
        <BadgeDeStatut statut={bas ? 'À valider' : 'Disponible'} libelle={bas ? 'Sous le seuil' : 'OK'} />
      </div>

      <div className="flex flex-col gap-xs">
        <div className="flex items-baseline justify-between">
          <span className="mds-texte-petit text-texte-secondaire">Seuil d’alerte</span>
          <span className="mds-mono-code text-texte-secondaire">{seuil}</span>
        </div>
        <Jauge quantite={quantite} seuil={seuil} />
      </div>

      <label className="flex flex-col gap-xs">
        <span className="mds-texte-petit text-texte-secondaire">Comptage de ce lundi</span>
        <input
          type="number"
          min={0}
          value={saisie}
          onChange={(evenement) => onSaisie(evenement.target.value)}
          className="mds-texte-corps h-[44px] rounded-champ border border-trait-bordure bg-surface-carte px-lg text-texte-principal outline-none focus-visible:border-marque-turquoise"
        />
      </label>

      <p className="mds-texte-petit text-texte-tertiaire">Dernier comptage : {dernierComptage}</p>
    </article>
  )
}

// ─── Règle (63:346) ──────────────────────────────────────────────────────────

/** Rappel de règle de la colonne latérale : icône, titre, explication. */
export function Regle({ icone, titre, texte }: { icone: NomIcone; titre: string; texte: string }) {
  return (
    <div className="flex items-start gap-md px-xl py-md">
      <span className="inline-flex size-[36px] shrink-0 items-center justify-center rounded-rond bg-surface-champ text-texte-principal">
        <Icone nom={icone} taille="lg" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="mds-texte-corps-fort text-texte-principal">{titre}</p>
        <p className="mds-texte-petit text-texte-secondaire">{texte}</p>
      </div>
    </div>
  )
}

// ─── Prêt de classe (63:358) ─────────────────────────────────────────────────

/** Tuile d'un prêt de classe : matériels regroupés, responsable et badge de classe. */
export function PretDeClasse({
  titre,
  responsable,
  classe,
  initiale,
  couleur,
}: {
  titre: string
  responsable: string
  classe: string
  initiale: string
  couleur: string
}) {
  return (
    <div className="flex items-center gap-md rounded-vignette bg-surface-champ px-lg py-md">
      <span
        aria-hidden
        className="mds-texte-petit-fort inline-flex size-[32px] shrink-0 items-center justify-center rounded-rond text-texte-inverse"
        style={{ backgroundColor: couleur }}
      >
        {initiale}
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="mds-texte-corps-fort truncate text-texte-principal">{titre}</p>
        <p className="mds-texte-petit truncate text-texte-secondaire">{responsable}</p>
      </div>
      <span className="mds-mono-micro shrink-0 rounded-pastille bg-marque-anthracite px-[7px] py-[2px] text-texte-inverse">
        {classe}
      </span>
    </div>
  )
}

// ─── Ligne de forfait (63:367) ───────────────────────────────────────────────

/**
 * Une ligne de « Forfaits par type ». Un type à composants affiche son total calculé
 * et son crayon ouvre la fiche matériel ; un type simple s'édite sur place.
 */
export function LigneDeForfait({
  nom,
  montant,
  kit,
  onModifier,
  verrouille,
}: {
  nom: string
  montant: string
  /** Type à composants : le total est calculé, jamais saisi. */
  kit: boolean
  onModifier: () => void
  /** Vrai pour Lydia : le crayon reste visible et le clic affiche le refus R12. */
  verrouille: boolean
}) {
  return (
    <div className="flex items-center gap-md border-b border-trait-bordure px-xl py-md last:border-b-0">
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="mds-texte-corps-fort truncate text-texte-principal">{nom}</p>
        {kit && <p className="mds-texte-petit text-texte-tertiaire">Somme des composants</p>}
      </div>
      <span className="mds-mono-code shrink-0 text-texte-principal">{montant}</span>
      <button
        type="button"
        onClick={onModifier}
        aria-label={kit ? `Modifier les forfaits des composants de ${nom}` : `Modifier le forfait de ${nom}`}
        className="inline-flex size-[36px] shrink-0 items-center justify-center rounded-rond bg-surface-bouton-doux text-texte-principal transition-colors duration-rapide ease-sortie hover:bg-etat-doux-survol"
      >
        <Icone nom={verrouille ? 'Cadenas' : 'Modifier'} taille="lg" />
      </button>
    </div>
  )
}

// ─── Carte d'incident (63:393) ───────────────────────────────────────────────

/** Carte d'un forfait dû : montant, emprunteur, motif, et les deux actions de Sandrine. */
export function CarteDIncident({
  icone,
  montant,
  montantInitial,
  ajustePar,
  emprunteur,
  initiale,
  couleur,
  materiel,
  motif,
  onAjuster,
  onPayer,
  verrouille,
}: {
  icone: NomIcone
  montant: string
  montantInitial?: string
  ajustePar?: string
  emprunteur: string
  initiale: string
  couleur: string
  materiel: string
  motif: string
  onAjuster: () => void
  onPayer: () => void
  /** Vrai pour l'équipe : les deux boutons montrent le cadenas et refusent (R12). */
  verrouille: boolean
}) {
  return (
    <article className="flex flex-col gap-md rounded-carte bg-surface-carte p-xl ring-1 ring-trait-bordure">
      <div className="flex items-start gap-md">
        <Pictogramme icone={icone} teinte="Rose" taille={44} />
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="mds-chiffre-l text-texte-principal">{montant}</p>
          {montantInitial && ajustePar && (
            <p className="mds-texte-petit text-texte-secondaire">
              {montantInitial} ajusté par {ajustePar}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-sm">
        <span
          aria-hidden
          className="mds-texte-petit-fort inline-flex size-[28px] shrink-0 items-center justify-center rounded-rond text-texte-inverse"
          style={{ backgroundColor: couleur }}
        >
          {initiale}
        </span>
        <p className="mds-texte-corps-fort truncate text-texte-principal">
          {emprunteur} · {materiel}
        </p>
      </div>

      <p className="mds-texte-petit text-texte-secondaire">{motif}</p>

      <div className="flex flex-wrap gap-sm">
        <Bouton
          libelle="Ajuster"
          type="Secondaire"
          icone={verrouille ? 'Cadenas' : 'Modifier'}
          onClick={onAjuster}
        />
        <Bouton
          libelle="Enregistrer le paiement"
          type={verrouille ? 'Secondaire' : 'Principal'}
          icone={verrouille ? 'Cadenas' : 'Portefeuille'}
          onClick={onPayer}
        />
      </div>
    </article>
  )
}

// ─── Ligne de réglage (98:4013) ──────────────────────────────────────────────

/** Une ligne de la carte Notifications : titre, canal, interrupteur. */
export function LigneDeReglage({
  titre,
  detail,
  interrupteur,
}: {
  titre: string
  detail: string
  interrupteur: ReactNode
}) {
  return (
    <div className="flex items-center gap-md border-b border-trait-bordure px-xl py-lg last:border-b-0">
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="mds-texte-corps-fort text-texte-principal">{titre}</p>
        <p className="mds-texte-petit text-texte-secondaire">{detail}</p>
      </div>
      {interrupteur}
    </div>
  )
}

// ─── Carte de validation (63:568) ────────────────────────────────────────────

/** Carte de validation d'une remise ou d'un retour. Type Retour : encadrée en orange. */
export function CarteDeValidation({
  type,
  icone,
  nom,
  identite,
  puces,
  actions,
}: {
  type: 'Remise' | 'Retour'
  icone: NomIcone
  nom: string
  identite: string
  /** Puces de composants, en lecture seule pour une remise. */
  puces: ReactNode
  actions: ReactNode
}) {
  const retour = type === 'Retour'
  return (
    <article
      className={[
        'flex flex-col gap-md rounded-carte bg-surface-carte p-xl',
        retour ? 'ring-1 ring-marque-orange' : 'ring-1 ring-trait-bordure',
      ].join(' ')}
    >
      <div className="flex items-start gap-md">
        <Pictogramme icone={icone} teinte={retour ? 'Orange' : 'Turquoise'} taille={48} />
        <div className="flex min-w-0 flex-1 flex-col gap-xs">
          <span className="flex flex-wrap items-center gap-sm">
            <BadgeDeStatut statut={retour ? 'À valider' : 'À valider'} libelle={type} />
            <span className="mds-titre-carte truncate text-texte-principal">{nom}</span>
            <span className="mds-mono-micro rounded-pastille bg-surface-pastille px-[7px] py-[2px] text-texte-secondaire">
              N1
            </span>
          </span>
          <p className="mds-texte-petit text-texte-secondaire">{identite}</p>
        </div>
      </div>

      <div className="flex flex-col gap-sm">
        <p className="mds-texte-petit text-texte-tertiaire">{retour ? 'Manquant ?' : 'Contenu vérifié'}</p>
        <div className="flex flex-wrap gap-sm">{puces}</div>
      </div>

      <div className="flex flex-wrap gap-sm">{actions}</div>
    </article>
  )
}

// ─── Carte photo de retour (63:486) ──────────────────────────────────────────

/** Carte d'une photo de retour à contrôler. */
export function CartePhotoDeRetour({
  visuel,
  nom,
  forfait,
  rendu,
  declaration,
  reempruntePar,
  puces,
  actions,
}: {
  visuel: ReactNode
  nom: string
  forfait: string
  rendu: string
  declaration: string
  reempruntePar?: string
  puces: ReactNode
  actions: ReactNode
}) {
  return (
    <article className="flex flex-col gap-md rounded-carte bg-surface-carte p-xl ring-1 ring-trait-bordure">
      {visuel}

      <div className="flex flex-wrap items-center gap-sm">
        <span className="mds-titre-carte truncate text-texte-principal">{nom}</span>
        <span className="mds-mono-micro rounded-pastille bg-surface-pastille px-[7px] py-[2px] text-texte-secondaire">
          N2
        </span>
        <span className="mds-mono-micro rounded-pastille bg-surface-pastille px-[7px] py-[2px] text-texte-secondaire">
          Forfait {forfait}
        </span>
        {reempruntePar && <BadgeDeStatut statut="En cours" libelle={`Réemprunté par ${reempruntePar}`} />}
      </div>

      <p className="mds-texte-petit text-texte-secondaire">
        Rendu par {rendu} · {declaration}
      </p>

      <div className="flex flex-col gap-sm">
        <p className="mds-texte-petit text-texte-tertiaire">Manquant ?</p>
        <div className="flex flex-wrap gap-sm">{puces}</div>
      </div>

      <div className="flex flex-wrap gap-sm">{actions}</div>
    </article>
  )
}
