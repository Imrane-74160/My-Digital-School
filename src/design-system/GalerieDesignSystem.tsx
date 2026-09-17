import { Link } from 'react-router'

/**
 * Galerie de tous les composants et de toutes leurs variantes, à comparer section
 * par section avec la page « Composants » du Figma (`40:3`). Remplie en Phase 2.
 */
export function GalerieDesignSystem() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[1100px] flex-col gap-xl p-2xl">
      <Link className="mds-texte-petit-fort text-marque-turquoise-fonce underline" to="/">
        ← Accueil de la démo
      </Link>
      <h1 className="mds-titre-page text-texte-principal">Design system</h1>
      <p className="mds-texte-corps text-texte-secondaire">
        Galerie des composants et de leurs variantes · construite en Phase 2, comparée à la page Composants du
        Figma.
      </p>
      <section className="rounded-carte bg-surface-carte p-xl ring-1 ring-trait-bordure">
        <h2 className="mds-titre-carte mb-lg text-texte-principal">Couleurs de la charte</h2>
        <ul className="flex flex-wrap gap-md">
          {[
            ['Anthracite', 'bg-marque-anthracite'],
            ['Turquoise', 'bg-marque-turquoise'],
            ['Jaune', 'bg-marque-jaune'],
            ['Orange', 'bg-marque-orange'],
            ['Bleu ciel', 'bg-marque-bleu-ciel'],
            ['Bleu', 'bg-marque-bleu'],
            ['Rose', 'bg-marque-rose'],
          ].map(([nom, classe]) => (
            <li key={nom} className="flex flex-col gap-xs">
              <span className={`block size-3xl rounded-vignette ${classe}`} aria-hidden />
              <span className="mds-texte-petit text-texte-secondaire">{nom}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-carte bg-surface-carte p-xl ring-1 ring-trait-bordure">
        <h2 className="mds-titre-carte mb-lg text-texte-principal">Styles de texte</h2>
        <p className="mds-titre-page">Titre de page · Bricolage Grotesque</p>
        <p className="mds-titre-ecran-mobile">Titre d’écran mobile · Bricolage Grotesque</p>
        <p className="mds-chiffre-xl">12</p>
        <p className="mds-texte-corps">Texte courant · Inter</p>
        <p className="mds-mono-code">MDS-KIT-R10-01 · JetBrains Mono</p>
      </section>
    </main>
  )
}
