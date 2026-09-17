/**
 * B6 · Prêts — `/admin/prets` — nœud Figma `26:2`.
 *
 * Onglets En cours / Historique, recherche par matériel ou responsable, tableau
 * à cinq colonnes (Matériel · Responsable · Sorti · Statut · Forfait) et la
 * colonne latérale : Retour du soir et Pour les classes.
 *
 * Le retard ne teinte que la date et le badge, jamais la ligne entière.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { euros, horloge, selecteurs } from '@/domain'
import {
  BadgeDeStatut,
  Carte,
  CelluleDouble,
  Champ,
  EnTeteDeCarte,
  EtatVide,
  Indicateur,
  LigneDeTableau,
  Onglets,
  Pastille,
  PretDeClasse,
  Tableau,
  initialeDe,
  type Colonne,
} from '@/design-system'
import { badgeDePretBO, sortieDuPret } from './aides'
import { useEtat } from '@/store/hooks'

const COLONNES: Colonne[] = [
  { libelle: 'Matériel' },
  { libelle: 'Responsable', largeur: 200 },
  { libelle: 'Sorti', largeur: 140 },
  { libelle: 'Statut', largeur: 160 },
  { libelle: 'Forfait', largeur: 100, droite: true },
]

export function Prets() {
  const etat = useEtat()
  const navigate = useNavigate()
  const [onglet, setOnglet] = useState<'encours' | 'historique'>('encours')
  const [recherche, setRecherche] = useState('')

  const maintenant = etat.horloge.maintenant
  const terme = recherche.trim().toLowerCase()

  const tous =
    onglet === 'encours'
      ? selecteurs.pretsOuverts(etat)
      : etat.prets.filter((pret) => !selecteurs.estOuvert(pret))

  const prets = tous.filter((pret) => {
    if (terme === '') return true
    const materiel = selecteurs.materiel(etat, pret.materiel)
    const responsable = selecteurs.personne(etat, pret.responsable)
    return materiel.nom.toLowerCase().includes(terme) || responsable.nom.toLowerCase().includes(terme)
  })

  const aRendreCeSoir = selecteurs.pretsOuverts(etat).filter((pret) => pret.statut === 'actif').length
  const pretsDeClasse = selecteurs.pretsOuverts(etat).filter((pret) => pret.pourClasse !== null)

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_360px] gap-lg">
      <Carte>
        <EnTeteDeCarte
          icone="Colis"
          titre="Prêts"
          sousTitre={`${prets.length} prêt${prets.length > 1 ? 's' : ''} ${onglet === 'encours' ? 'en cours' : 'dans l’historique'}`}
          aDroite={
            <Onglets
              etiquette="Filtrer les prêts"
              onglets={[
                { cle: 'encours', libelle: 'En cours', compteur: selecteurs.pretsOuverts(etat).length },
                { cle: 'historique', libelle: 'Historique' },
              ]}
              actif={onglet}
              onChange={setOnglet}
            />
          }
        />

        <div className="px-xl pb-md">
          <Champ
            etiquette="Rechercher un prêt"
            valeur={recherche}
            onChange={setRecherche}
            placeholder="Matériel ou responsable"
            icone="Loupe"
          />
        </div>

        {prets.length === 0 ? (
          <EtatVide icone="Colis" titre="Aucun prêt" detail="Change l’onglet ou la recherche." />
        ) : (
          <Tableau etiquette="Prêts" colonnes={COLONNES}>
            {prets.map((pret) => {
              const materiel = selecteurs.materiel(etat, pret.materiel)
              const responsable = selecteurs.personne(etat, pret.responsable)
              const badge = badgeDePretBO(etat, pret)
              const enRetard = selecteurs.estEnRetard(etat, pret)
              return (
                <LigneDeTableau
                  key={pret.id}
                  colonnes={COLONNES}
                  onClick={() => void navigate(`/admin/materiel?id=${materiel.id}`)}
                  cellules={[
                    <CelluleDouble
                      principal={materiel.nom}
                      secondaire={<span className="mds-mono-code">{materiel.qr}</span>}
                    />,
                    <CelluleDouble
                      principal={responsable.nom}
                      {...(pret.pourClasse === null
                        ? { secondaire: responsable.classe ?? '' }
                        : { secondaire: `pour la ${pret.pourClasse}` })}
                    />,
                    <span
                      className={`mds-texte-petit ${enRetard ? 'text-marque-rose-fonce' : 'text-texte-secondaire'}`}
                    >
                      {sortieDuPret(etat, pret)}
                    </span>,
                    <BadgeDeStatut statut={badge.statut} libelle={badge.libelle} />,
                    <span className="mds-mono-code text-texte-principal">{euros(pret.forfait)}</span>,
                  ]}
                />
              )
            })}
          </Tableau>
        )}
      </Carte>

      <div className="flex flex-col gap-lg">
        <Carte>
          <EnTeteDeCarte icone="Lune" titre="Retour du soir" sousTitre="Non rendus avant 18h" />
          <div className="grid grid-cols-2 gap-md px-xl pb-xl">
            <Indicateur valeur={aRendreCeSoir} libelle="À rendre ce soir" />
            <Indicateur
              valeur={horloge.heureRonde(horloge.aHeure(maintenant, etat.horloge.rappel))}
              libelle="Rappel envoyé"
            />
          </div>
          <p className="mds-texte-petit px-xl pb-xl text-texte-tertiaire">
            Le rappel part à {etat.horloge.rappel} aux emprunteurs qui ont encore un prêt en cours (R15).
          </p>
        </Carte>

        <Carte>
          <EnTeteDeCarte
            icone="Utilisateurs"
            titre="Pour les classes"
            sousTitre="Prêts sous responsabilité"
          />
          {pretsDeClasse.length === 0 ? (
            <EtatVide icone="Utilisateurs" titre="Aucun prêt de classe" />
          ) : (
            <div className="flex flex-col gap-sm px-xl pb-xl">
              {pretsDeClasse.map((pret) => {
                const responsable = selecteurs.personne(etat, pret.responsable)
                return (
                  <PretDeClasse
                    key={pret.id}
                    titre={selecteurs.materiel(etat, pret.materiel).nom}
                    responsable={responsable.nom}
                    classe={pret.pourClasse ?? ''}
                    initiale={initialeDe(responsable.nom)}
                    couleur={responsable.couleur}
                  />
                )
              })}
              <p className="mds-texte-petit text-texte-tertiaire">
                L’intervenant reste responsable et seul à pouvoir rendre le matériel (R08, R09).
              </p>
            </div>
          )}
        </Carte>

        <Carte>
          <EnTeteDeCarte icone="Étiquette" titre="Légende" sousTitre="Quatre statuts distincts" />
          <div className="flex flex-col gap-sm px-xl pb-xl">
            <span className="flex items-center gap-sm">
              <BadgeDeStatut statut="En cours" />
              <span className="mds-texte-petit text-texte-secondaire">Sorti, à rendre avant 18h</span>
            </span>
            <span className="flex items-center gap-sm">
              <BadgeDeStatut statut="À valider" />
              <span className="mds-texte-petit text-texte-secondaire">Remise en attente au bureau</span>
            </span>
            <span className="flex items-center gap-sm">
              <BadgeDeStatut statut="À valider" libelle="Retour à valider" />
              <span className="mds-texte-petit text-texte-secondaire">
                Retour déclaré, contrôle sur place
              </span>
            </span>
            <span className="flex items-center gap-sm">
              <BadgeDeStatut statut="En retard" />
              <span className="mds-texte-petit text-texte-secondaire">
                Non rendu à 18h : emprunts bloqués
              </span>
            </span>
            <span className="flex items-center gap-sm pt-xs">
              <Pastille type="Niveau" libelle="R10" />
              <span className="mds-texte-petit text-texte-tertiaire">
                Le blocage se lève dès le retour du matériel.
              </span>
            </span>
          </div>
        </Carte>
      </div>
    </div>
  )
}
