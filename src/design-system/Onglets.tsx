/**
 * Composant Figma « Onglet » (`46:76`), posé dans sa piste.
 *
 * Le Figma précise « placer plusieurs instances dans une piste arrondie » : ce composant
 * porte donc la piste (`surface/bouton-doux`) et la liste d'onglets, avec les rôles ARIA
 * attendus. Actif : anthracite plein, libellé inverse, compteur turquoise.
 * Inactif : sans fond, compteur en `texte/tertiaire`, survol en `état/doux-survol`.
 */

export type Onglet<Cle extends string> = {
  cle: Cle
  libelle: string
  /** Compteur affiché à droite du libellé, en chasse fixe. Masqué s'il est absent. */
  compteur?: number
}

type Props<Cle extends string> = {
  /** Nom de la série d'onglets, pour les lecteurs d'écran. */
  etiquette: string
  onglets: Onglet<Cle>[]
  actif: Cle
  onChange: (cle: Cle) => void
  /** Étire la piste sur toute la largeur, comme sur mobile. */
  pleineLargeur?: boolean
  className?: string
}

export function Onglets<Cle extends string>({
  etiquette,
  onglets,
  actif,
  onChange,
  pleineLargeur = false,
  className,
}: Props<Cle>) {
  return (
    <div
      role="tablist"
      aria-label={etiquette}
      className={[
        'inline-flex items-center gap-xs rounded-champ bg-surface-bouton-doux p-xs',
        pleineLargeur ? 'flex w-full' : '',
        className ?? '',
      ].join(' ')}
    >
      {onglets.map(({ cle, libelle, compteur }) => {
        const estActif = cle === actif
        return (
          <button
            key={cle}
            type="button"
            role="tab"
            aria-selected={estActif}
            onClick={() => onChange(cle)}
            className={[
              // Géométrie du Figma : padding 16/10, gap 6, rayon « bouton ».
              'inline-flex items-center justify-center gap-[6px] rounded-bouton px-lg py-[10px]',
              'transition-colors duration-base ease-sortie',
              pleineLargeur ? 'flex-1' : '',
              estActif ? 'bg-marque-anthracite' : 'text-texte-principal hover:bg-etat-doux-survol',
            ].join(' ')}
          >
            <span
              className={[
                'font-texte text-[12px] leading-[16px] font-medium whitespace-nowrap',
                estActif ? 'text-texte-inverse' : 'text-texte-principal',
              ].join(' ')}
            >
              {libelle}
            </span>
            {compteur !== undefined && (
              <span
                className={[
                  'font-mono text-[12px] leading-[18px]',
                  estActif ? 'text-marque-turquoise' : 'text-texte-tertiaire',
                ].join(' ')}
              >
                {compteur}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
