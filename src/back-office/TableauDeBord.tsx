/**
 * B2 · Tableau de bord — `/admin` — nœud Figma `8:950`.
 *
 * Six cartes : À faire maintenant, En ce moment, Prêts en retard, Signalements
 * ouverts (colonne de gauche), Consommables et Récap de 8h (colonne de droite).
 * Tous les compteurs et tous les libellés sont calculés depuis l'état.
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { euros, horloge, selecteurs, type LigneAFaire } from '@/domain'
import {
  ActionAFaire,
  Avatar,
  BadgeDeStatut,
  Bouton,
  Carte,
  CelluleDouble,
  EnTeteDeCarte,
  EtatVide,
  Icone,
  Indicateur,
  initialeDe,
  LigneDeStock,
  LigneDeTableau,
  Onglets,
  Tableau,
  type Colonne,
  type NomIcone,
  type TeintePictogramme,
  type TonIndicateur,
} from '@/design-system'
import { cibleDuSignalement } from './aides'
import { useEtat, useUtilisateurBO } from '@/store/hooks'
import { useMDS } from '@/store/useMDS'

/** Icône, teinte et destination de chaque ligne de la carte « À faire maintenant ». */
const LIGNES: Record<
  LigneAFaire['cle'],
  { icone: NomIcone; teinte: TeintePictogramme; vers: string; action: string; principale: boolean }
> = {
  validations: {
    icone: 'Liste cochée',
    teinte: 'Turquoise',
    vers: '/admin/validations',
    action: 'Valider',
    principale: true,
  },
  photos: {
    icone: 'Image',
    teinte: 'Bleu',
    vers: '/admin/controle-photo',
    action: 'Contrôler',
    principale: false,
  },
  bloques: {
    icone: 'Cadenas',
    teinte: 'Orange',
    vers: '/admin/emprunteurs',
    action: 'Voir',
    principale: false,
  },
  paiements: {
    icone: 'Portefeuille',
    teinte: 'Rose',
    vers: '/admin/incidents',
    action: 'Enregistrer',
    principale: false,
  },
  signalements: {
    icone: 'Drapeau',
    teinte: 'Neutre',
    vers: '/admin/incidents?onglet=signalements',
    action: 'Traiter',
    principale: false,
  },
}

const COLONNES_SIGNALEMENT: Colonne[] = [
  { libelle: 'Signalement' },
  { libelle: 'Par', largeur: 150 },
  { libelle: 'Quand', largeur: 130 },
  { libelle: 'Photo', largeur: 64 },
  { libelle: ' ', largeur: 56, droite: true },
]

export function TableauDeBord() {
  const etat = useEtat()
  const utilisateur = useUtilisateurBO()
  const executer = useMDS((magasin) => magasin.executer)
  const navigate = useNavigate()
  const [filtre, setFiltre] = useState<'ouverts' | 'traites'>('ouverts')

  const maintenant = etat.horloge.maintenant
  const compteurs = selecteurs.compteurs(etat)
  const lignes = selecteurs.lignesAFaire(etat)
  const enRetard = selecteurs.pretsEnRetard(etat)
  const destinataires = selecteurs.destinatairesDuRecap(etat)
  const signalements = etat.signalements.filter((signalement) =>
    filtre === 'ouverts' ? signalement.statut === 'ouvert' : signalement.statut === 'traite',
  )
  const dernierComptage = etat.consommables[0]?.dernierComptage ?? maintenant

  /** Un indicateur reste neutre à zéro ; sinon il prend le ton du Figma. */
  const ton = (valeur: number, retard = false): TonIndicateur =>
    valeur === 0 ? 'Neutre' : retard ? 'Retard' : 'Attention'

  return (
    <div className="flex flex-col gap-lg">
      <div className="grid grid-cols-[minmax(0,1fr)_420px] gap-lg">
        <div className="flex min-w-0 flex-col gap-lg">
          <Carte>
            <EnTeteDeCarte
              icone="Liste cochée"
              titre="À faire maintenant"
              sousTitre={`${lignes.length} action${lignes.length > 1 ? 's' : ''} · mis à jour à ${horloge.heure(maintenant)}`}
            />
            {lignes.length === 0 ? (
              <EtatVide icone="Coche" titre="Tout est traité." detail="Rien ne vous attend." />
            ) : (
              <div className="flex flex-col pb-sm">
                {lignes.map((ligne) => {
                  const style = LIGNES[ligne.cle]
                  return (
                    <ActionAFaire
                      key={ligne.cle}
                      icone={style.icone}
                      teinte={style.teinte}
                      titre={ligne.titre}
                      detail={ligne.detail}
                      libelleAction={style.action}
                      principale={style.principale}
                      reserveASandrine={ligne.reserveASandrine && !selecteurs.estDirection(utilisateur.role)}
                      onAction={() => void navigate(style.vers)}
                    />
                  )
                })}
              </div>
            )}
          </Carte>

          <Carte>
            <EnTeteDeCarte icone="Tableau de bord" titre="En ce moment" sousTitre="État du campus" />
            <div className="grid grid-cols-3 gap-md px-xl pb-xl">
              <Indicateur valeur={compteurs.sortis} libelle="Sortis" />
              <Indicateur
                valeur={compteurs.enRetard}
                libelle="En retard"
                ton={ton(compteurs.enRetard, true)}
              />
              <Indicateur valeur={compteurs.aValider} libelle="À valider" ton={ton(compteurs.aValider)} />
              <Indicateur valeur={compteurs.photos} libelle="Photos" ton={ton(compteurs.photos)} />
              <Indicateur
                valeur={
                  compteurs.aRembourser.nombre === 0
                    ? 0
                    : `${compteurs.aRembourser.nombre} · ${euros(compteurs.aRembourser.montant)}`
                }
                libelle="À rembourser"
                ton={ton(compteurs.aRembourser.nombre, true)}
              />
              <Indicateur valeur={compteurs.stockBas} libelle="Stock bas" ton={ton(compteurs.stockBas)} />
            </div>
          </Carte>

          <Carte>
            <EnTeteDeCarte icone="Horloge" titre="Prêts en retard" sousTitre="Non rendus avant 18h" />
            {enRetard.length === 0 ? (
              <EtatVide icone="Coche" titre="Aucun retard" detail="Tout est rentré avant 18h." />
            ) : (
              <div className="flex flex-col gap-md px-xl pb-xl">
                {enRetard.map((pret) => {
                  const materiel = selecteurs.materiel(etat, pret.materiel)
                  const responsable = selecteurs.personne(etat, pret.responsable)
                  const perte = selecteurs.echeanceDePerte(etat, pret)
                  const fermeture = horloge.aHeure(pret.sortiLe ?? maintenant, etat.horloge.bureau.fermeture)
                  const exempte = selecteurs.estDebloqueeAujourdhui(etat, pret.responsable)
                  return (
                    <article
                      key={pret.id}
                      className="flex items-center gap-md rounded-vignette bg-surface-champ px-lg py-md"
                    >
                      <Avatar
                        initiale={initialeDe(responsable.nom)}
                        taille={44}
                        couleur={responsable.couleur}
                        titre={responsable.nom}
                      />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <p className="mds-texte-corps-fort truncate text-texte-principal">
                          {responsable.nom} · {materiel.nom}
                        </p>
                        <p className="mds-texte-petit text-marque-rose-fonce">
                          {horloge.echeance(fermeture, maintenant)}
                          {perte === null
                            ? ''
                            : ` · perdu ${horloge.echeance(perte, maintenant)} · ${euros(pret.forfait)}`}
                        </p>
                      </div>
                      <BadgeDeStatut
                        statut={exempte ? 'Disponible' : 'Bloqué'}
                        libelle={exempte ? 'Débloqué aujourd’hui' : 'Bloqué'}
                      />
                      <Bouton
                        libelle="Débloquer"
                        type="Secondaire"
                        icone="Cadenas ouvert"
                        onClick={() =>
                          executer({ type: 'DEBLOQUER', par: utilisateur.id, personne: pret.responsable })
                        }
                      />
                    </article>
                  )
                })}
                <p className="mds-texte-petit text-texte-tertiaire">
                  Le blocage se lève dès le retour. Un déblocage manuel ne vaut que pour la journée.
                </p>
              </div>
            )}
          </Carte>
        </div>

        <div className="flex min-w-0 flex-col gap-lg">
          <Carte>
            <EnTeteDeCarte
              icone="Stylo"
              titre="Consommables"
              sousTitre={`Comptage de la semaine · ${horloge.jourLong(dernierComptage)}`}
            />
            <div className="flex flex-col gap-sm pb-md">
              {etat.consommables.map((consommable) => (
                <LigneDeStock
                  key={consommable.id}
                  nom={consommable.nom}
                  quantite={consommable.quantite}
                  seuil={consommable.seuil}
                />
              ))}
            </div>
            <div className="px-xl pb-xl">
              <Link to="/admin/consommables">
                <Bouton libelle="Enregistrer le comptage" type="Secondaire" icone="Liste cochée" />
              </Link>
            </div>
          </Carte>

          <Carte>
            <EnTeteDeCarte icone="Enveloppe" titre="Récap de 8h" sousTitre="Envoyé ce matin à l’équipe" />
            <div className="px-xl pb-lg">
              {etat.recap === null ? (
                <EtatVide icone="Enveloppe" titre="Pas encore envoyé" detail="Le récap part demain à 8h." />
              ) : (
                <pre
                  data-testid="recap-8h"
                  className="mds-mono-code overflow-x-auto rounded-vignette bg-surface-champ p-lg text-texte-principal"
                >
                  {etat.recap.lignes.join('\n')}
                </pre>
              )}
            </div>
            <div className="flex items-center gap-sm px-xl pb-xl">
              <span className="flex">
                {destinataires.map((personne, index) => (
                  <span key={personne.id} className={index === 0 ? '' : '-ml-sm'}>
                    <Avatar
                      initiale={initialeDe(personne.nom)}
                      taille={32}
                      couleur={personne.couleur}
                      titre={personne.nom}
                    />
                  </span>
                ))}
              </span>
              <p className="mds-texte-petit text-texte-secondaire">
                {destinataires.map((personne) => personne.nom).join(', ')}
              </p>
            </div>
          </Carte>
        </div>
      </div>

      <Carte>
        <EnTeteDeCarte
          icone="Drapeau"
          titre="Signalements ouverts"
          sousTitre="Envoyés depuis l’app"
          aDroite={
            <Onglets
              etiquette="Filtrer les signalements"
              onglets={[
                { cle: 'ouverts', libelle: 'Ouverts' },
                { cle: 'traites', libelle: 'Traités' },
              ]}
              actif={filtre}
              onChange={setFiltre}
            />
          }
        />
        {signalements.length === 0 ? (
          <EtatVide icone="Coche" titre="Aucun signalement" />
        ) : (
          <Tableau etiquette="Signalements" colonnes={COLONNES_SIGNALEMENT}>
            {signalements.map((signalement) => (
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
                  signalement.statut === 'ouvert' ? (
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
                    </button>
                  ) : (
                    <BadgeDeStatut statut="Payé" libelle="Traité" pastille={false} />
                  ),
                ]}
              />
            ))}
          </Tableau>
        )}
      </Carte>
    </div>
  )
}
