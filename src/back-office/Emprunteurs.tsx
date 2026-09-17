/**
 * B7 · Emprunteurs — `/admin/emprunteurs?id=` — nœud Figma `83:2266`.
 *
 * Tableau des comptes (Nom · Profil · Prêts en cours · À rembourser · Statut) et
 * fiche de l'emprunteur sélectionné : identité, statut avec sa raison de blocage
 * et l'échéance de perte, ▶ DEBLOQUER, prêts en cours, historique.
 */
import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { euros, horloge, selecteurs } from '@/domain'
import {
  Avatar,
  BadgeDeStatut,
  Bouton,
  Carte,
  CarteDePret,
  CelluleDouble,
  Champ,
  Encart,
  EnTeteDeCarte,
  EtatVide,
  initialeDe,
  LigneDeTableau,
  LigneDInformation,
  Onglets,
  Pastille,
  Tableau,
  type Colonne,
} from '@/design-system'
import { badgeDePret, iconeDe, teinteDe } from '@/app-mobile/aides'
import { duPar, profilDe } from './aides'
import { useEtat, useUtilisateurBO } from '@/store/hooks'
import { useMDS } from '@/store/useMDS'

const COLONNES: Colonne[] = [
  { libelle: 'Nom' },
  { libelle: 'Profil', largeur: 200 },
  { libelle: 'Prêts en cours', largeur: 120 },
  { libelle: 'À rembourser', largeur: 130, droite: true },
  { libelle: 'Statut', largeur: 170 },
]

type Filtre = 'tous' | 'bloques' | 'rembourser' | 'intervenants'

export function Emprunteurs() {
  const etat = useEtat()
  const utilisateur = useUtilisateurBO()
  const executer = useMDS((magasin) => magasin.executer)
  const [parametres, setParametres] = useSearchParams()
  const [recherche, setRecherche] = useState('')
  const [filtre, setFiltre] = useState<Filtre>('tous')

  const maintenant = etat.horloge.maintenant
  const emprunteurs = etat.personnes.filter((personne) => !selecteurs.estEquipe(personne.role))
  const bloques = selecteurs.personnesBloquees(etat)
  const aRembourser = new Set(selecteurs.incidentsARembourser(etat).map((incident) => incident.responsable))

  const terme = recherche.trim().toLowerCase()
  const lignes = emprunteurs.filter((personne) => {
    if (filtre === 'bloques' && !bloques.some((bloque) => bloque.id === personne.id)) return false
    if (filtre === 'rembourser' && !aRembourser.has(personne.id)) return false
    if (filtre === 'intervenants' && personne.role !== 'intervenant') return false
    if (terme === '') return true
    return (
      personne.nom.toLowerCase().includes(terme) || profilDe(etat, personne.id).toLowerCase().includes(terme)
    )
  })

  const selectionne = parametres.get('id')
  const fiche = emprunteurs.find((personne) => personne.id === selectionne)

  const choisir = (id: string) => {
    const suivant = new URLSearchParams(parametres)
    suivant.set('id', id)
    setParametres(suivant)
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_400px] gap-lg">
      <Carte>
        <EnTeteDeCarte
          icone="Utilisateurs"
          titre="Emprunteurs"
          sousTitre={`${emprunteurs.length} comptes · ${bloques.length} bloqué${bloques.length > 1 ? 's' : ''} · ${aRembourser.size} forfait${aRembourser.size > 1 ? 's' : ''} à rembourser`}
          aDroite={
            <Onglets
              etiquette="Filtrer les emprunteurs"
              onglets={[
                { cle: 'tous', libelle: 'Tous' },
                { cle: 'bloques', libelle: 'Bloqués', compteur: bloques.length },
                { cle: 'rembourser', libelle: 'À rembourser', compteur: aRembourser.size },
                { cle: 'intervenants', libelle: 'Intervenants' },
              ]}
              actif={filtre}
              onChange={setFiltre}
            />
          }
        />

        <div className="px-xl pb-md">
          <Champ
            etiquette="Rechercher un emprunteur"
            valeur={recherche}
            onChange={setRecherche}
            placeholder="Nom ou classe"
            icone="Loupe"
          />
        </div>

        {lignes.length === 0 ? (
          <EtatVide icone="Utilisateurs" titre="Aucun compte" detail="Change la recherche ou le filtre." />
        ) : (
          <Tableau etiquette="Emprunteurs" colonnes={COLONNES}>
            {lignes.map((personne) => {
              const ouverts = selecteurs.pretsEnCoursDe(etat, personne.id).length
              const raison = selecteurs.raisonDeBlocage(etat, personne.id)
              const du = duPar(etat, personne.id)
              return (
                <LigneDeTableau
                  key={personne.id}
                  colonnes={COLONNES}
                  selectionnee={personne.id === selectionne}
                  onClick={() => choisir(personne.id)}
                  cellules={[
                    <span className="flex min-w-0 items-center gap-sm">
                      <Avatar
                        initiale={initialeDe(selecteurs.prenom(personne))}
                        taille={32}
                        couleur={personne.couleur}
                        titre={personne.nom}
                      />
                      <span className="mds-texte-corps-fort truncate text-texte-principal">
                        {personne.nom}
                      </span>
                    </span>,
                    <span className="mds-texte-petit text-texte-secondaire">
                      {profilDe(etat, personne.id)}
                    </span>,
                    <span className="mds-mono-code text-texte-principal">{ouverts}</span>,
                    <span
                      className={`mds-mono-code ${du === '–' ? 'text-texte-tertiaire' : 'text-marque-rose-fonce'}`}
                    >
                      {du}
                    </span>,
                    raison === null ? (
                      personne.charteAcceptee === null ? (
                        <BadgeDeStatut statut="Retiré" libelle="Charte non acceptée" />
                      ) : (
                        <BadgeDeStatut statut="Disponible" libelle="Actif" />
                      )
                    ) : (
                      <BadgeDeStatut statut="Bloqué" libelle="Bloqué" />
                    ),
                  ]}
                />
              )
            })}
          </Tableau>
        )}
      </Carte>

      <Carte>
        {fiche === undefined ? (
          <EtatVide
            icone="Utilisateur"
            titre="Aucune fiche ouverte"
            detail="Choisis un compte dans le tableau."
          />
        ) : (
          <div className="flex flex-col gap-lg pb-xl">
            <div className="flex items-center gap-md px-xl pt-xl">
              <Avatar
                initiale={initialeDe(selecteurs.prenom(fiche))}
                taille={48}
                couleur={fiche.couleur}
                titre={fiche.nom}
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="mds-titre-carte truncate text-texte-principal">{fiche.nom}</p>
                <p className="mds-texte-petit text-texte-secondaire">{profilDe(etat, fiche.id)}</p>
              </div>
              {fiche.charteAcceptee === null && (
                <BadgeDeStatut statut="Retiré" libelle="Charte non acceptée" />
              )}
            </div>

            <div className="mx-xl rounded-vignette bg-surface-carte ring-1 ring-trait-bordure">
              <LigneDInformation
                icone="Enveloppe"
                libelle="Adresse"
                valeur={fiche.email ?? 'Non renseignée'}
              />
              <LigneDInformation
                icone="Historique"
                libelle="Emprunts cette année"
                valeur={String(fiche.empruntsAnnee ?? 0)}
              />
              <LigneDInformation icone="Portefeuille" libelle="À rembourser" valeur={duPar(etat, fiche.id)} />
            </div>

            <div className="flex flex-col gap-sm px-xl">
              <StatutDeLEmprunteur
                id={fiche.id}
                onDebloquer={() => executer({ type: 'DEBLOQUER', par: utilisateur.id, personne: fiche.id })}
              />
            </div>

            <div className="flex flex-col gap-sm px-xl">
              <p className="mds-texte-petit-fort text-texte-tertiaire">Prêts en cours</p>
              {selecteurs.pretsEnCoursDe(etat, fiche.id).length === 0 ? (
                <p className="mds-texte-petit text-texte-secondaire">Aucun prêt en cours.</p>
              ) : (
                selecteurs.pretsEnCoursDe(etat, fiche.id).map((pret) => {
                  const materiel = selecteurs.materiel(etat, pret.materiel)
                  const badge = badgeDePret(etat, pret)
                  return (
                    <CarteDePret
                      key={pret.id}
                      icone={iconeDe(materiel)}
                      teinte={teinteDe(materiel)}
                      nom={materiel.nom}
                      detail={badge.libelle}
                      statut={badge.statut}
                      alerte={badge.alerte}
                    />
                  )
                })
              )}
            </div>

            <div className="flex flex-col gap-sm px-xl">
              <p className="mds-texte-petit-fort text-texte-tertiaire">Historique</p>
              {selecteurs.historiqueDe(etat, fiche.id).length === 0 ? (
                <p className="mds-texte-petit text-texte-secondaire">Rien pour le moment.</p>
              ) : (
                selecteurs
                  .historiqueDe(etat, fiche.id)
                  .slice(0, 6)
                  .map((pret) => (
                    <div
                      key={pret.id}
                      className="flex items-center gap-md rounded-vignette bg-surface-champ px-lg py-sm"
                    >
                      <CelluleDouble
                        principal={selecteurs.materiel(etat, pret.materiel).nom}
                        secondaire={
                          pret.renduLe === undefined
                            ? pret.statut === 'perdu'
                              ? 'Déclaré perdu'
                              : 'Annulé'
                            : `Rendu ${horloge.quand(pret.renduLe, maintenant)}`
                        }
                      />
                      <Pastille type="Montant" libelle={euros(pret.forfait)} />
                    </div>
                  ))
              )}
            </div>
          </div>
        )}
      </Carte>
    </div>
  )
}

/** Bloc de statut de la fiche : bloqué avec sa raison, débloqué du jour, ou actif. */
function StatutDeLEmprunteur({ id, onDebloquer }: { id: string; onDebloquer: () => void }) {
  const etat = useEtat()
  const raison = selecteurs.raisonDeBlocage(etat, id)
  const exempte = selecteurs.estDebloqueeAujourdhui(etat, id)

  if (raison !== null) {
    const pret = selecteurs.pretsEnRetard(etat).find((element) => element.responsable === id)
    const perte = pret === undefined ? null : selecteurs.echeanceDePerte(etat, pret)
    return (
      <>
        <Encart icone="Cadenas" ton="rose">
          {raison}. Le blocage se lève dès le retour du matériel.
          {perte === null ? '' : ` Perte déclarée ${horloge.echeance(perte, etat.horloge.maintenant)}.`}
        </Encart>
        <Bouton
          libelle="Débloquer pour la journée"
          type="Secondaire"
          icone="Cadenas ouvert"
          onClick={onDebloquer}
        />
      </>
    )
  }

  if (exempte) {
    return (
      <Encart icone="Cadenas ouvert" ton="orange">
        Débloqué aujourd’hui par l’équipe. Le déblocage ne vaut que pour la journée (R16).
      </Encart>
    )
  }

  return (
    <Encart icone="Coche" ton="turquoise">
      Compte actif, aucun blocage en cours.
    </Encart>
  )
}
