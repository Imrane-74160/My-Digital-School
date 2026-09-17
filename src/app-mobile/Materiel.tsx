/**
 * A4 · Matériel — `/app/materiel` — nœud Figma `29:2`.
 *
 * Recherche, puces de catégorie, puis une section par catégorie du seed (les vides
 * masquées) avec une ligne par TYPE de matériel. « Me prévenir » s'inscrit sur le type.
 */
import { useState } from 'react'
import { Link } from 'react-router'
import { selecteurs } from '@/domain'
import { Champ, EtatVide, Icone, LigneDeCatalogue, PuceDeCategorie, TitreDeSection } from '@/design-system'
import { badgeDeType, iconeDe, modeDeRemise, sectionsDuCatalogue, teinteDe } from './aides'
import { useEtat, usePersonaApp } from '@/store/hooks'
import { useMDS } from '@/store/useMDS'

export function Materiel() {
  const etat = useEtat()
  const persona = usePersonaApp()
  const executer = useMDS((magasin) => magasin.executer)
  const [recherche, setRecherche] = useState('')
  const [categorie, setCategorie] = useState('tout')

  const sections = sectionsDuCatalogue(etat, persona.role)
  const puces = [
    { cle: 'tout', court: 'Tout' },
    ...sections.map((s) => ({ cle: s.cle, court: etat.categories[s.cle]!.court })),
  ]

  const filtrees = sections
    .filter((section) => categorie === 'tout' || section.cle === categorie)
    .map((section) => ({
      ...section,
      types: section.types.filter((type) =>
        selecteurs.nomDuType(etat, type).toLowerCase().includes(recherche.trim().toLowerCase()),
      ),
    }))
    .filter((section) => section.types.length > 0)

  return (
    <div className="flex flex-col gap-md pb-lg">
      <header className="flex items-start gap-md px-lg pt-[10px]">
        <div className="flex min-w-0 flex-1 flex-col">
          <h1 className="mds-titre-ecran-mobile text-texte-principal">Matériel</h1>
          <p className="mds-texte-petit text-texte-secondaire">Disponibilité en temps réel</p>
        </div>
        <Link to="/app/scanner" aria-label="Scanner un QR" className="shrink-0">
          <span className="inline-flex size-[48px] items-center justify-center rounded-rond bg-marque-turquoise text-texte-principal">
            <Icone nom="Scanner" taille="2xl" />
          </span>
        </Link>
      </header>

      <div className="px-lg">
        <Champ
          etiquette="Rechercher un matériel"
          placeholder="Nom du matériel"
          icone="Loupe"
          valeur={recherche}
          onChange={setRecherche}
          pleineLargeur
        />
      </div>

      <div className="flex gap-sm overflow-x-auto px-lg pb-xs">
        {puces.map(({ cle, court }) => (
          <PuceDeCategorie
            key={cle}
            libelle={court}
            active={categorie === cle}
            onClick={() => setCategorie(cle)}
          />
        ))}
      </div>

      {filtrees.length === 0 ? (
        <EtatVide icone="Loupe" titre="Aucun matériel" detail="Essaie un autre mot ou une autre catégorie." />
      ) : (
        filtrees.map((section) => (
          <section key={section.cle}>
            <TitreDeSection titre={section.titre} />
            <div className="flex flex-col px-lg">
              {section.types.map((type) => {
                const premiere = selecteurs.unitesDuType(etat, type)[0]!
                const badge = badgeDeType(etat, type, persona.id)
                const inscrit = selecteurs.estInscritAuType(etat, type, persona.id)
                return (
                  <LigneDeCatalogue
                    key={type}
                    icone={iconeDe(premiere)}
                    teinte={teinteDe(premiere)}
                    nom={selecteurs.nomDuType(etat, type)}
                    statut={badge.statut}
                    libelleStatut={badge.libelle}
                    modeDeRemise={modeDeRemise(premiere)}
                    {...(badge.unite
                      ? { vers: `/app/materiel/${badge.unite.id}` }
                      : {
                          onPrevenir: () =>
                            executer({ type: 'PREVENEZ_MOI', par: persona.id, typeMateriel: type }),
                          inscrit,
                        })}
                  />
                )
              })}
            </div>
          </section>
        ))
      )}
    </div>
  )
}
