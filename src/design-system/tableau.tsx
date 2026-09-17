/**
 * Tableaux du back-office (section « Tableaux » du Figma).
 *
 * Cellule d'en-tête (61:300) et les lignes de tableau : Inventaire (62:503),
 * Prêts (62:317), Signalement (62:366), Contrôle (62:401), Paiement (62:432),
 * Emprunteur (97:3242), Salle (97:3308), Ligne d'import (97:3351).
 *
 * Toutes partagent la même mécanique de survol et de sélection relevée dans
 * `docs/04` : fond `surface/champ` au survol, rayon 16.
 */
import type { ReactNode } from 'react'

export type Colonne = {
  libelle: string
  /** Aligne la colonne à droite, comme la colonne Forfait du Figma. */
  droite?: boolean
  /** Largeur fixe en pixels, sinon la colonne s'étire. */
  largeur?: number
}

/** En-tête de tableau : une Cellule d'en-tête par colonne. */
export function EnTeteDeTableau({ colonnes }: { colonnes: Colonne[] }) {
  return (
    <div role="row" className="flex items-center gap-md border-b border-trait-grille px-xl pt-sm pb-md">
      {colonnes.map(({ libelle, droite, largeur }) => (
        <span
          key={libelle}
          role="columnheader"
          className={[
            'mds-texte-petit text-texte-tertiaire',
            droite ? 'text-right' : '',
            largeur === undefined ? 'flex-1' : 'shrink-0',
          ].join(' ')}
          style={largeur === undefined ? undefined : { width: largeur }}
        >
          {libelle}
        </span>
      ))}
    </div>
  )
}

/**
 * Une ligne de tableau. Le survol pose `surface/champ` au rayon 16, la sélection
 * ajoute un trait turquoise. `onClick` la rend cliquable, sinon elle reste inerte.
 */
export function LigneDeTableau({
  cellules,
  colonnes,
  onClick,
  selectionnee = false,
  /** Teinte rose du retard : le Figma ne teinte que la valeur et le badge, pas la ligne. */
  className,
}: {
  cellules: ReactNode[]
  colonnes: Colonne[]
  onClick?: () => void
  selectionnee?: boolean
  className?: string
}) {
  const contenu = colonnes.map(({ libelle, droite, largeur }, index) => (
    <span
      key={libelle}
      role="cell"
      className={['min-w-0', droite ? 'text-right' : '', largeur === undefined ? 'flex-1' : 'shrink-0'].join(
        ' ',
      )}
      style={largeur === undefined ? undefined : { width: largeur }}
    >
      {cellules[index]}
    </span>
  ))

  const classes = [
    'flex w-full items-center gap-md rounded-vignette px-xl py-md text-left',
    'transition-colors duration-rapide ease-sortie',
    selectionnee ? 'bg-surface-champ ring-1 ring-marque-turquoise' : '',
    onClick ? 'hover:bg-surface-champ' : '',
    className ?? '',
  ].join(' ')

  if (!onClick) {
    return (
      <div role="row" className={classes}>
        {contenu}
      </div>
    )
  }

  return (
    <button type="button" role="row" onClick={onClick} aria-current={selectionnee} className={classes}>
      {contenu}
    </button>
  )
}

/** Coque d'un tableau : en-tête plus lignes, avec les rôles ARIA attendus. */
export function Tableau({
  etiquette,
  colonnes,
  children,
}: {
  etiquette: string
  colonnes: Colonne[]
  children: ReactNode
}) {
  return (
    <div role="table" aria-label={etiquette} className="flex flex-col">
      <EnTeteDeTableau colonnes={colonnes} />
      <div role="rowgroup" className="flex flex-col py-xs">
        {children}
      </div>
    </div>
  )
}

/** Cellule à deux lignes : valeur principale et précision dessous. */
export function CelluleDouble({
  principal,
  secondaire,
  ton = 'normal',
}: {
  principal: ReactNode
  secondaire?: ReactNode
  /** `retard` teinte la valeur en rose, comme la date d'un prêt en retard. */
  ton?: 'normal' | 'retard' | 'mono'
}) {
  return (
    <span className="flex min-w-0 flex-col">
      <span
        className={[
          ton === 'mono' ? 'mds-mono-code' : 'mds-texte-corps-fort',
          ton === 'retard' ? 'text-marque-rose-fonce' : 'text-texte-principal',
          'truncate',
        ].join(' ')}
      >
        {principal}
      </span>
      {secondaire !== undefined && (
        <span className="mds-texte-petit truncate text-texte-secondaire">{secondaire}</span>
      )}
    </span>
  )
}

/** Ligne d'import (97:3351) : Valide, ou le motif d'erreur nommant la colonne fautive. */
export function LigneDImport({
  cellules,
  colonnes,
  erreur,
}: {
  cellules: ReactNode[]
  colonnes: Colonne[]
  erreur?: string
}) {
  return (
    <LigneDeTableau
      colonnes={colonnes}
      className={erreur ? 'bg-marque-rose-clair' : ''}
      cellules={[
        ...cellules,
        erreur ? (
          <span className="mds-texte-petit text-marque-rose-fonce">{erreur}</span>
        ) : (
          <span className="mds-texte-petit text-marque-turquoise-fonce">Valide</span>
        ),
      ]}
    />
  )
}
