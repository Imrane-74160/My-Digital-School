type Props = {
  /** Code de la fiche dans `docs/03-ecrans.md`, ex. « A3 » ou « B7 ». */
  code: string
  titre: string
  /** Identifiant du nœud Figma, ex. « 28:2 ». */
  noeud: string
}

const FICHIER_FIGMA = 'lN2EFZzYHfTuAW9agcHstV'

/**
 * Écran non encore construit. Présent dès la Phase 0 pour que toutes les routes
 * répondent et que la navigation soit testable de bout en bout.
 */
export function EcranEnChantier({ code, titre, noeud }: Props) {
  const lien = `https://www.figma.com/design/${FICHIER_FIGMA}/Maquette-MDS?node-id=${noeud.replace(':', '-')}`

  return (
    <section className="flex flex-col gap-sm p-2xl" aria-labelledby={`chantier-${code}`}>
      <p className="mds-mono-micro text-texte-tertiaire">{code}</p>
      <h1 id={`chantier-${code}`} className="mds-titre-ecran-mobile text-texte-principal">
        {titre}
      </h1>
      <p className="mds-texte-corps text-texte-secondaire">Écran à construire.</p>
      <a
        className="mds-texte-petit-fort text-marque-turquoise-fonce underline"
        href={lien}
        target="_blank"
        rel="noreferrer"
      >
        Nœud Figma {noeud}
      </a>
    </section>
  )
}
