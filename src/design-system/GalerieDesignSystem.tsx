import { useState } from 'react'
import { Link } from 'react-router'
import { Avatar } from './Avatar'
import { BadgeDeStatut } from './BadgeDeStatut'
import { Bouton } from './Bouton'
import { BoutonIcone } from './BoutonIcone'
import { Icone } from './Icone'
import { NOMS_ICONES } from './icones'
import { Pastille } from './Pastille'
import { Pictogramme } from './Pictogramme'
import { PuceDeCategorie } from './PuceDeCategorie'
import { PuceDeComposant } from './PuceDeComposant'
import { STATUTS_BADGE } from './statuts'
import {
  STYLES_BOUTON_ICONE,
  TAILLES_AVATAR,
  TAILLES_BOUTON,
  TEINTES_PICTOGRAMME,
  TYPES_BOUTON,
  type EtatPuce,
} from './variantes'

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

/** Les puces de composant se basculent vraiment, pour voir la transition de 200 ms. */
function DemoPucesDeComposant() {
  const [etats, setEtats] = useState<Record<string, EtatPuce>>({
    'Émetteur + micro cravate': 'Neutre',
    Récepteur: 'Manquant',
  })

  return (
    <div className="flex flex-col gap-md">
      <div className="flex flex-wrap items-center gap-sm">
        <span className="mds-texte-petit w-[92px] text-texte-tertiaire">Lecture seule</span>
        <PuceDeComposant nom="Boîtier Canon R10" etat="Vérifié" />
        <PuceDeComposant nom="Objectif RF 18-150mm" etat="Vérifié" />
      </div>
      <div className="flex flex-wrap items-center gap-sm">
        <span className="mds-texte-petit w-[92px] text-texte-tertiaire">Bascule</span>
        {Object.entries(etats).map(([nom, etat]) => (
          <PuceDeComposant
            key={nom}
            nom={nom}
            etat={etat}
            onBascule={() =>
              setEtats((precedent) => ({
                ...precedent,
                [nom]: precedent[nom] === 'Manquant' ? 'Neutre' : 'Manquant',
              }))
            }
          />
        ))}
      </div>
    </div>
  )
}

/** Les puces de catégorie de l'écran Matériel, avec une sélection réelle. */
function DemoPucesDeCategorie() {
  const [active, setActive] = useState('Tout')
  const categories = ['Tout', 'Studio', 'Informatique', 'Cours', 'Jeux', 'Boîtes']

  return (
    <div className="flex flex-wrap gap-sm">
      {categories.map((nom) => (
        <PuceDeCategorie key={nom} libelle={nom} active={active === nom} onClick={() => setActive(nom)} />
      ))}
    </div>
  )
}

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
          {TYPES_BOUTON.map((type) => (
            <div key={type} className="flex flex-col gap-sm">
              <p className="mds-texte-petit-fort text-texte-tertiaire">{type}</p>
              {TAILLES_BOUTON.map((taille) => (
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
        titre="Bouton icône"
        noeud="44:89"
        description="Bouton rond à icône seule. Styles Doux, Contour, Surface, Plein · 36 à 56 px. L’icône reste sombre dans les quatre styles, turquoise compris."
      >
        <div className="flex flex-col gap-md">
          {STYLES_BOUTON_ICONE.map((style) => (
            <div key={style} className="flex flex-wrap items-center gap-md">
              <span className="mds-texte-petit w-[92px] text-texte-tertiaire">{style}</span>
              {([36, 40, 48, 56] as const).map((taille) => (
                <BoutonIcone
                  key={taille}
                  icone="Plus d'options"
                  titre={`Plus d’options · ${style} ${taille}`}
                  style={style}
                  taille={taille}
                />
              ))}
              <BoutonIcone icone="Plus d'options" titre="Désactivé" style={style} disabled />
            </div>
          ))}
        </div>
      </Section>

      <Section
        titre="Badge de statut"
        noeud="45:89"
        description="Les huit statuts du prototype, en cinq familles de couleur. Le libellé est libre : un badge garde sa couleur avec « 3 disponibles » ou « Réemprunté par Tom »."
      >
        <div className="flex flex-col gap-md">
          <div className="flex flex-wrap gap-sm">
            {STATUTS_BADGE.map((statut) => (
              <BadgeDeStatut key={statut} statut={statut} />
            ))}
          </div>
          <div className="flex flex-wrap gap-sm">
            {STATUTS_BADGE.map((statut) => (
              <BadgeDeStatut key={statut} statut={statut} pastille={false} />
            ))}
          </div>
          <div className="flex flex-wrap gap-sm">
            <BadgeDeStatut statut="Disponible" libelle="3 disponibles" />
            <BadgeDeStatut statut="En cours" libelle="Réemprunté par Tom" />
            <BadgeDeStatut statut="À valider" libelle="Ta demande" />
            <BadgeDeStatut statut="Incident" libelle="Incident · 45 €" />
          </div>
        </div>
      </Section>

      <Section
        titre="Pastille"
        noeud="45:96"
        description="Information courte en chasse fixe : Niveau, Classe (prêt pour la classe), Montant."
      >
        <div className="flex flex-wrap items-center gap-sm">
          <Pastille type="Niveau" libelle="N1" />
          <Pastille type="Niveau" libelle="N2" />
          <Pastille type="Classe" libelle="B3" />
          <Pastille type="Classe" libelle="M1" />
          <Pastille type="Montant" libelle="Forfait 25 €" />
          <Pastille type="Montant" libelle="Forfait 1 130 €" />
        </div>
      </Section>

      <Section
        titre="Avatar"
        noeud="45:110"
        description="Initiale sur la couleur de la personne. Les tailles 22 à 48 écrivent en Inter Medium ; la taille 84 de l’écran Profil passe en Bricolage Grotesque 28/32."
      >
        <div className="flex flex-wrap items-end gap-lg">
          {TAILLES_AVATAR.map((taille) => (
            <div key={taille} className="flex flex-col items-center gap-xs">
              <Avatar initiale="I" taille={taille} couleur="#0E76B6" titre="Inès Martin" />
              <span className="mds-mono-micro text-texte-tertiaire">{taille}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-sm">
          {[
            ['I', '#0E76B6'],
            ['T', '#662483'],
            ['L', '#B35C1E'],
            ['Y', '#2B6F77'],
            ['S', '#8A3B6B'],
            ['C', '#C8558A'],
            ['L', '#D06A32'],
            ['S', '#3C3C3B'],
          ].map(([initiale, couleur], index) => (
            <Avatar key={index} initiale={initiale!} taille={32} couleur={couleur!} />
          ))}
        </div>
      </Section>

      <Section
        titre="Pictogramme"
        noeud="59:150"
        description="Vignette (carré, rayon 14) ou pictogramme (rond), 32 à 56 px. Seul le fond est teinté : l’icône reste sombre sur les sept teintes."
      >
        <div className="flex flex-col gap-md">
          {(['Carré', 'Rond'] as const).map((forme) => (
            <div key={forme} className="flex flex-wrap items-center gap-md">
              <span className="mds-texte-petit w-[92px] text-texte-tertiaire">{forme}</span>
              {TEINTES_PICTOGRAMME.map((teinte) => (
                <Pictogramme key={teinte} icone="Coche" forme={forme} teinte={teinte} />
              ))}
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-md">
            <span className="mds-texte-petit w-[92px] text-texte-tertiaire">Tailles</span>
            {([32, 40, 44, 48, 56] as const).map((taille) => (
              <Pictogramme key={taille} icone="Appareil photo" teinte="Turquoise" taille={taille} />
            ))}
          </div>
        </div>
      </Section>

      <Section
        titre="Puce de composant"
        noeud="45:130"
        description="Vérifié, Neutre, Manquant. « Survol » est le survol de Neutre. Les puces de bascule sont cliquables ; celles de la carte de validation d’une remise ne le sont pas."
      >
        <DemoPucesDeComposant />
      </Section>

      <Section
        titre="Puce de catégorie"
        noeud="61:132"
        description="Filtre de l’écran Matériel. Active en anthracite plein ; « Pressée » est l’appui d’Inactive."
      >
        <DemoPucesDeCategorie />
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
