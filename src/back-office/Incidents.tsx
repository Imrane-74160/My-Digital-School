/**
 * B8 · Incidents & paiements — `/admin/incidents?onglet=` — nœud Figma `27:2`.
 *
 * Onglets À rembourser / Payés / Signalements, une Carte d'incident par forfait dû
 * (Ajuster en baisse seulement, Enregistrer le paiement — réservés à Sandrine, R12),
 * la table « Payés récemment » et le panneau « Forfaits par type ».
 *
 * Arbitrage : sur un type à composants, le crayon n'édite rien sur place — il ouvre
 * B5 sur la première unité du type, défilée sur « Forfait par composant ».
 */
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { euros, horloge, selecteurs } from '@/domain'
import {
  BadgeDeStatut,
  Bouton,
  Carte,
  CarteDIncident,
  CelluleDouble,
  EnTeteDeCarte,
  EtatVide,
  Icone,
  initialeDe,
  LigneDeForfait,
  LigneDeTableau,
  Onglets,
  Tableau,
  type Colonne,
} from '@/design-system'
import { cibleDuSignalement, iconeDuMaterielId } from './aides'
import { useEtat, useUtilisateurBO } from '@/store/hooks'
import { useMDS } from '@/store/useMDS'

const COLONNES_PAIEMENT: Colonne[] = [
  { libelle: 'Incident' },
  { libelle: 'Emprunteur', largeur: 170 },
  { libelle: 'Payé', largeur: 140 },
  { libelle: 'Montant', largeur: 110, droite: true },
]

const COLONNES_SIGNALEMENT: Colonne[] = [
  { libelle: 'Signalement' },
  { libelle: 'Par', largeur: 150 },
  { libelle: 'Quand', largeur: 130 },
  { libelle: 'Photo', largeur: 64 },
  { libelle: ' ', largeur: 56, droite: true },
]

type Onglet = 'rembourser' | 'payes' | 'signalements'

const ONGLETS: Onglet[] = ['rembourser', 'payes', 'signalements']

export function Incidents() {
  const etat = useEtat()
  const utilisateur = useUtilisateurBO()
  const executer = useMDS((magasin) => magasin.executer)
  const navigate = useNavigate()
  const [parametres, setParametres] = useSearchParams()

  const demande = parametres.get('onglet')
  const onglet: Onglet = ONGLETS.includes(demande as Onglet) ? (demande as Onglet) : 'rembourser'

  const [enAjustement, setEnAjustement] = useState<string | null>(null)
  const [saisie, setSaisie] = useState('')

  const maintenant = etat.horloge.maintenant
  const direction = selecteurs.estDirection(utilisateur.role)
  const dus = selecteurs.incidentsARembourser(etat)
  const payes = etat.incidents
    .filter((incident) => incident.statut === 'rembourse')
    .sort((a, b) => ((a.payeLe ?? '') < (b.payeLe ?? '') ? 1 : -1))
  const ouverts = selecteurs.signalementsOuverts(etat)

  const choisirOnglet = (cle: Onglet) => {
    const suivant = new URLSearchParams(parametres)
    suivant.set('onglet', cle)
    setParametres(suivant)
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_400px] gap-lg">
      <div className="flex min-w-0 flex-col gap-lg">
        <Carte>
          <EnTeteDeCarte
            icone="Portefeuille"
            titre="Incidents & paiements"
            sousTitre={
              dus.length === 0
                ? 'Aucun forfait dû'
                : `${dus.length} forfait${dus.length > 1 ? 's' : ''} dû${dus.length > 1 ? 's' : ''} · ${euros(dus.reduce((somme, incident) => somme + incident.montant, 0))}`
            }
            aDroite={
              <Onglets
                etiquette="Filtrer les incidents"
                onglets={[
                  { cle: 'rembourser', libelle: 'À rembourser', compteur: dus.length },
                  { cle: 'payes', libelle: 'Payés', compteur: payes.length },
                  { cle: 'signalements', libelle: 'Signalements', compteur: ouverts.length },
                ]}
                actif={onglet}
                onChange={choisirOnglet}
              />
            }
          />

          {onglet === 'rembourser' &&
            (dus.length === 0 ? (
              <EtatVide icone="Coche" titre="Aucun forfait dû" detail="Tout est réglé." />
            ) : (
              <div className="grid grid-cols-2 gap-lg px-xl pb-xl">
                {dus.map((incident) => {
                  const responsable = selecteurs.personne(etat, incident.responsable)
                  return (
                    <div key={incident.id} className="flex flex-col gap-sm">
                      <CarteDIncident
                        icone={iconeDuMaterielId(etat, incident.materiel)}
                        montant={euros(incident.montant)}
                        {...(incident.montantInitial === undefined
                          ? {}
                          : { montantInitial: euros(incident.montantInitial) })}
                        {...(incident.ajustePar === undefined
                          ? {}
                          : {
                              ajustePar: selecteurs.prenom(selecteurs.personne(etat, incident.ajustePar)),
                            })}
                        emprunteur={responsable.nom}
                        initiale={initialeDe(selecteurs.prenom(responsable))}
                        couleur={responsable.couleur}
                        materiel={selecteurs.materiel(etat, incident.materiel).nom}
                        motif={`${incident.motif} · ouvert ${horloge.quand(incident.creeLe, maintenant)}`}
                        verrouille={!direction}
                        onAjuster={() => {
                          if (!direction) {
                            // Lydia : le moteur refuse, le toast affiche R12.
                            executer({
                              type: 'AJUSTER_MONTANT',
                              par: utilisateur.id,
                              incident: incident.id,
                              valeur: incident.montant,
                            })
                            return
                          }
                          setEnAjustement(enAjustement === incident.id ? null : incident.id)
                          setSaisie(String(incident.montant))
                        }}
                        onPayer={() =>
                          executer({
                            type: 'REMBOURSEMENT',
                            par: utilisateur.id,
                            incident: incident.id,
                          })
                        }
                      />

                      {enAjustement === incident.id && (
                        <div className="flex items-center gap-sm rounded-vignette bg-surface-champ px-lg py-md">
                          <label className="mds-texte-petit flex-1 text-texte-secondaire">
                            Nouveau montant (baisse seulement)
                            <input
                              type="number"
                              min={0}
                              max={incident.montant}
                              autoFocus
                              value={saisie}
                              onChange={(evenement) => setSaisie(evenement.target.value)}
                              className="mds-mono-code mt-xs block h-[36px] w-[110px] rounded-champ border border-trait-bordure bg-surface-carte px-md text-right text-texte-principal outline-none focus-visible:border-marque-turquoise"
                            />
                          </label>
                          <Bouton
                            libelle="Ajuster"
                            icone="Coche"
                            onClick={() => {
                              const valeur = Number(saisie)
                              if (!Number.isFinite(valeur)) return
                              const resultat = executer({
                                type: 'AJUSTER_MONTANT',
                                par: utilisateur.id,
                                incident: incident.id,
                                valeur,
                              })
                              if (resultat.ok) setEnAjustement(null)
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}

          {onglet === 'payes' &&
            (payes.length === 0 ? (
              <EtatVide icone="Reçu" titre="Aucun paiement" detail="Rien n’a encore été encaissé." />
            ) : (
              <Tableau etiquette="Paiements" colonnes={COLONNES_PAIEMENT}>
                {payes.map((incident) => (
                  <LigneDeTableau
                    key={incident.id}
                    colonnes={COLONNES_PAIEMENT}
                    cellules={[
                      <CelluleDouble
                        principal={selecteurs.materiel(etat, incident.materiel).nom}
                        secondaire={incident.motif}
                      />,
                      <span className="mds-texte-petit text-texte-secondaire">
                        {selecteurs.personne(etat, incident.responsable).nom}
                      </span>,
                      <span className="mds-texte-petit text-texte-secondaire">
                        {incident.payeLe === undefined ? '—' : horloge.quand(incident.payeLe, maintenant)}
                      </span>,
                      <span className="flex items-center justify-end gap-sm">
                        <span className="mds-mono-code text-texte-principal">{euros(incident.montant)}</span>
                        <BadgeDeStatut statut="Payé" pastille={false} />
                      </span>,
                    ]}
                  />
                ))}
              </Tableau>
            ))}

          {onglet === 'signalements' &&
            (ouverts.length === 0 ? (
              <EtatVide icone="Coche" titre="Aucun signalement ouvert" />
            ) : (
              <Tableau etiquette="Signalements" colonnes={COLONNES_SIGNALEMENT}>
                {ouverts.map((signalement) => (
                  <LigneDeTableau
                    key={signalement.id}
                    colonnes={COLONNES_SIGNALEMENT}
                    {...(signalement.cible.type === 'salle'
                      ? { onClick: () => void navigate('/admin/salles') }
                      : {})}
                    cellules={[
                      <CelluleDouble
                        principal={`${signalement.categorie} · ${cibleDuSignalement(etat, signalement.cible)}`}
                        secondaire={signalement.texte}
                      />,
                      <span className="mds-texte-petit text-texte-secondaire">
                        {selecteurs.prenom(selecteurs.personne(etat, signalement.par))}
                      </span>,
                      <span className="mds-texte-petit text-texte-secondaire">
                        {horloge.quand(signalement.le, maintenant)}
                      </span>,
                      signalement.photo ? (
                        <span className="inline-flex text-texte-secondaire">
                          <Icone nom="Image" taille="lg" titre="Photo jointe" />
                        </span>
                      ) : null,
                      <button
                        type="button"
                        aria-label={`Traiter le signalement ${signalement.id}`}
                        onClick={() =>
                          executer({
                            type: 'TRAITER_SIGNALEMENT',
                            par: utilisateur.id,
                            signalement: signalement.id,
                          })
                        }
                        className="inline-flex size-[36px] items-center justify-center rounded-rond bg-surface-bouton-doux text-texte-principal transition-colors duration-rapide ease-sortie hover:bg-etat-doux-survol"
                      >
                        <Icone nom="Coche" taille="lg" />
                      </button>,
                    ]}
                  />
                ))}
              </Tableau>
            ))}
        </Carte>
      </div>

      <ForfaitsParType />
    </div>
  )
}

// ─── Panneau « Forfaits par type » ───────────────────────────────────────────

function ForfaitsParType() {
  const etat = useEtat()
  const utilisateur = useUtilisateurBO()
  const executer = useMDS((magasin) => magasin.executer)
  const navigate = useNavigate()
  const direction = selecteurs.estDirection(utilisateur.role)

  const [enEdition, setEnEdition] = useState<string | null>(null)
  const [saisie, setSaisie] = useState('')

  return (
    <Carte>
      <EnTeteDeCarte
        icone="Étiquette"
        titre="Forfaits par type"
        sousTitre="Un changement vaut pour tout le type"
      />
      <div className="flex flex-col pb-md">
        {selecteurs.forfaitsParType(etat).map(({ type, nom, forfait }) => {
          const premiere = selecteurs.unitesDuType(etat, type)[0]
          const kit = premiere?.composants !== undefined

          if (enEdition === type) {
            return (
              <div
                key={type}
                className="flex items-center gap-md border-b border-trait-bordure px-xl py-md last:border-b-0"
              >
                <span className="mds-texte-corps-fort min-w-0 flex-1 truncate text-texte-principal">
                  {nom}
                </span>
                <input
                  type="number"
                  min={0}
                  autoFocus
                  value={saisie}
                  onChange={(evenement) => setSaisie(evenement.target.value)}
                  aria-label={`Forfait de ${nom}`}
                  className="mds-mono-code h-[36px] w-[96px] rounded-champ border border-trait-bordure bg-surface-carte px-md text-right text-texte-principal outline-none focus-visible:border-marque-turquoise"
                />
                <Bouton
                  libelle="Enregistrer"
                  icone="Coche"
                  onClick={() => {
                    const valeur = Number(saisie)
                    if (!Number.isFinite(valeur)) return
                    const resultat = executer({
                      type: 'MODIFIER_FORFAIT',
                      par: utilisateur.id,
                      typeMateriel: type,
                      valeur,
                    })
                    if (resultat.ok) setEnEdition(null)
                  }}
                />
              </div>
            )
          }

          return (
            <LigneDeForfait
              key={type}
              nom={nom}
              montant={euros(forfait)}
              kit={kit}
              verrouille={!direction}
              onModifier={() => {
                // Type à composants : le crayon ouvre la fiche, il n'édite jamais le total.
                if (kit && premiere) {
                  void navigate(`/admin/materiel?id=${premiere.id}&ancre=forfait`)
                  return
                }
                if (!direction) {
                  executer({
                    type: 'MODIFIER_FORFAIT',
                    par: utilisateur.id,
                    typeMateriel: type,
                    valeur: forfait,
                  })
                  return
                }
                setEnEdition(type)
                setSaisie(String(forfait))
              }}
            />
          )
        })}
      </div>
      <p className="mds-texte-petit px-xl pb-xl text-texte-tertiaire">
        Le total d’un kit est la somme de ses composants : il se modifie composant par composant, depuis la
        fiche du matériel (R07, R12).
      </p>
    </Carte>
  )
}
