import { Link } from 'react-router'
import { Bouton, type TailleBouton, type TypeBouton } from './Bouton'
import { Icone } from './Icone'
import { NOMS_ICONES } from './icones'

const FICHIER_FIGMA = 'lN2EFZzYHfTuAW9agcHstV'

const lienFigma = (noeud: string) =>
  `https://www.figma.com/design/${FICHIER_FIGMA}/Maquette-MDS?node-id=${noeud.replace(':', '-')}`

/**
 * Une section de la galerie = une section de la page « Composants » du Figma,
 * avec le lien vers son nœud pour comparer capture à capture.
 */
function Section({
  titre,
  noeud,
  description,
  children,
}: {
  titre: string
  noeud: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section
      className="flex flex-col gap-lg rounded-carte bg-surface-carte p-xl ring-1 ring-trait-bordure"
      aria-labelledby={`section-${noeud}`}
    >
      <header className="flex flex-wrap items-baseline gap-md">
        <h2 id={`section-${noeud}`} className="mds-titre-carte text-texte-principal">
          {titre}
        </h2>
        <a
          className="mds-mono-micro text-marque-turquoise-fonce underline"
          href={lienFigma(noeud)}
          target="_blank"
          rel="noreferrer"
        >
          {noeud}
        </a>
        {description && <p className="mds-texte-petit w-full text-texte-secondaire">{description}</p>}
      </header>
      {children}
    </section>
  )
}

const TYPES: TypeBouton[] = ['Principal', 'Secondaire', 'Alerte']
const TAILLES: TailleBouton[] = ['M', 'L']

/**
 * Galerie de tous les composants et de toutes leurs variantes, à comparer section
 * par section avec la page « Composants » du Figma (`40:3`).
 */
export function GalerieDesignSystem() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[1100px] flex-col gap-xl p-2xl">
      <header className="flex flex-col gap-sm">
        <Link className="mds-texte-petit-fort text-marque-turquoise-fonce underline" to="/">
          ← Accueil de la démo
        </Link>
        <h1 className="mds-titre-page text-texte-principal">Design system</h1>
        <p className="mds-texte-corps text-texte-secondaire">
          Chaque section porte le nœud Figma dont elle est la reprise. Les états de survol et d’appui sont
          réels : passez la souris, maintenez le clic.
        </p>
      </header>

      <Section
        titre="Bouton"
        noeud="43:101"
        description="Type Principal / Secondaire / Alerte · Taille M (40 px) / L (52 px) · États Défaut, Survol, Pressé, Désactivé. Le libellé reste sombre sur le turquoise et l’orange, comme dans le Figma."
      >
        <div className="flex flex-col gap-lg">
          {TYPES.map((type) => (
            <div key={type} className="flex flex-col gap-sm">
              <p className="mds-texte-petit-fort text-texte-tertiaire">{type}</p>
              {TAILLES.map((taille) => (
                <div key={taille} className="flex flex-wrap items-center gap-md">
                  <span className="mds-mono-micro w-[28px] text-texte-tertiaire">{taille}</span>
                  <Bouton libelle="Valider" type={type} taille={taille} icone="Coche" />
                  <Bouton libelle="Valider" type={type} taille={taille} icone="Coche" disabled />
                  <Bouton libelle="Sans icône" type={type} taille={taille} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </Section>

      <Section
        titre="Icônes"
        noeud="40:3"
        description={`${NOMS_ICONES.length} icônes, trait 1,5 px sur grille 24, couleur héritée. « Trépied » n’existe pas dans lucide : son tracé est repris du Figma.`}
      >
        <ul className="grid grid-cols-2 gap-md sm:grid-cols-4 lg:grid-cols-6">
          {NOMS_ICONES.map((nom) => (
            <li key={nom} className="flex items-center gap-sm text-texte-secondaire">
              <Icone nom={nom} taille="2xl" />
              <span className="mds-texte-petit truncate">{nom}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section titre="Couleurs de la charte" noeud="40:2">
        <ul className="flex flex-wrap gap-md">
          {[
            ['Anthracite', 'bg-marque-anthracite'],
            ['Turquoise', 'bg-marque-turquoise'],
            ['Turquoise clair', 'bg-marque-turquoise-clair'],
            ['Jaune', 'bg-marque-jaune'],
            ['Orange', 'bg-marque-orange'],
            ['Orange clair', 'bg-marque-orange-clair'],
            ['Bleu ciel', 'bg-marque-bleu-ciel'],
            ['Bleu', 'bg-marque-bleu'],
            ['Bleu action', 'bg-marque-bleu-action'],
            ['Rose', 'bg-marque-rose'],
            ['Rose clair', 'bg-marque-rose-clair'],
          ].map(([nom, classe]) => (
            <li key={nom} className="flex w-[104px] flex-col gap-xs">
              <span className={`block h-3xl w-full rounded-vignette ${classe}`} aria-hidden />
              <span className="mds-texte-petit text-texte-secondaire">{nom}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section titre="Styles de texte" noeud="40:2">
        <div className="flex flex-col gap-sm">
          <p className="mds-titre-page">Titre de page · 30/38 Bricolage</p>
          <p className="mds-titre-ecran-mobile">Titre d’écran mobile · 26/30</p>
          <p className="mds-chiffre-xl">12</p>
          <p className="mds-chiffre-l">28</p>
          <p className="mds-titre-carte">Titre de carte · 18/24 Inter</p>
          <p className="mds-texte-corps">Texte courant · 14/20 Inter</p>
          <p className="mds-texte-corps-fort">Texte courant fort · 14/19 Inter 500</p>
          <p className="mds-texte-petit">Petit texte · 12/16</p>
          <p className="mds-mono-code">MDS-KIT-R10-01 · JetBrains Mono 12/18</p>
          <p className="mds-mono-micro">10:15 · JetBrains Mono 11/16</p>
        </div>
      </Section>
    </main>
  )
}
