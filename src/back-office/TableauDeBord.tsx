/**
 * B2 · Tableau de bord — `/admin` — nœud Figma `8:950`.
 *
 * Six cartes : À faire maintenant, En ce moment, Prêts en retard, Signalements
 * ouverts, Consommables, Récap de 8h. Tous les compteurs et tous les libellés sont
 * calculés depuis l'état.
 *
 * Deux ajouts par rapport au Figma, notés dans `docs/03-ecrans.md` :
 * - « À faire maintenant » est ordonnée par **urgence calculée** (`selecteurs.lignesAFaire`),
 *   et non dans un ordre figé : la ligne de tête change avec la situation.
 * - La disposition est **personnalisable** : un défaut par rôle, puis chaque compte
 *   range ses cartes (ordre, colonne, masquage). Le mode « Personnaliser » se ferme
 *   et l'écran redevient exactement celui du Figma.
 */
import { useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router'
import { euros, horloge, selecteurs } from '@/domain'
import {
  ActionAFaire,
  Avatar,
  BadgeDeStatut,
  Bouton,
  BoutonIcone,
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
import {
  basculerVisibilite,
  changerDeColonne,
  CLES_CARTES,
  deplacer,
  dispositionParDefaut,
  estParDefaut,
  normaliser,
  poser,
  zoneDe,
  type CleCarte,
  type Disposition,
  type ZoneCarte,
} from '@/store/disposition'
import { useEtat, useUtilisateurBO } from '@/store/hooks'
import { useMDS } from '@/store/useMDS'

/** Icône, teinte et destination de chaque ligne de la carte « À faire maintenant ». */
const LIGNES: Record<
  selecteurs.LigneAFaire['cle'],
  { icone: NomIcone; teinte: TeintePictogramme; vers: string; action: string }
> = {
  validations: { icone: 'Liste cochée', teinte: 'Turquoise', vers: '/admin/validations', action: 'Valider' },
  photos: { icone: 'Image', teinte: 'Bleu', vers: '/admin/controle-photo', action: 'Contrôler' },
  bloques: { icone: 'Cadenas', teinte: 'Orange', vers: '/admin/emprunteurs', action: 'Voir' },
  paiements: { icone: 'Portefeuille', teinte: 'Rose', vers: '/admin/incidents', action: 'Enregistrer' },
  signalements: {
    icone: 'Drapeau',
    teinte: 'Neutre',
    vers: '/admin/incidents?onglet=signalements',
    action: 'Traiter',
  },
}

const COLONNES_SIGNALEMENT: Colonne[] = [
  { libelle: 'Signalement' },
  { libelle: 'Par', largeur: 150 },
  { libelle: 'Quand', largeur: 130 },
  { libelle: 'Photo', largeur: 64 },
  { libelle: ' ', largeur: 56, droite: true },
]

/** Nom de chaque carte, tel qu'il apparaît dans la barre de personnalisation. */
const NOMS: Record<CleCarte, string> = {
  afaire: 'À faire maintenant',
  enCeMoment: 'En ce moment',
  retards: 'Prêts en retard',
  signalements: 'Signalements ouverts',
  consommables: 'Consommables',
  recap: 'Récap de 8h',
}

// ─── Les six cartes ──────────────────────────────────────────────────────────

function CarteAFaire() {
  const etat = useEtat()
  const utilisateur = useUtilisateurBO()
  const navigate = useNavigate()
  const lignes = selecteurs.lignesAFaire(etat, utilisateur.role)

  return (
    <Carte>
      <EnTeteDeCarte
        icone="Liste cochée"
        titre="À faire maintenant"
        sousTitre={`${lignes.length} action${lignes.length > 1 ? 's' : ''} · par urgence · mis à jour à ${horloge.heure(etat.horloge.maintenant)}`}
      />
      {lignes.length === 0 ? (
        <EtatVide icone="Coche" titre="Tout est traité." detail="Rien ne vous attend." />
      ) : (
        <div className="flex flex-col pb-sm">
          {lignes.map((ligne, rang) => {
            const style = LIGNES[ligne.cle]
            const verrouillee = ligne.reserveASandrine && !selecteurs.estDirection(utilisateur.role)
            return (
              <ActionAFaire
                key={ligne.cle}
                cle={ligne.cle}
                icone={style.icone}
                teinte={style.teinte}
                titre={ligne.titre}
                detail={ligne.detail}
                raison={ligne.pourquoi}
                libelleAction={style.action}
                principale={rang === 0 && !verrouillee}
                reserveASandrine={verrouillee}
                onAction={() => void navigate(style.vers)}
              />
            )
          })}
        </div>
      )}
    </Carte>
  )
}

function CarteEnCeMoment() {
  const etat = useEtat()
  const compteurs = selecteurs.compteurs(etat)

  /** Un indicateur reste neutre à zéro ; sinon il prend le ton du Figma. */
  const ton = (valeur: number, retard = false): TonIndicateur =>
    valeur === 0 ? 'Neutre' : retard ? 'Retard' : 'Attention'

  return (
    <Carte>
      <EnTeteDeCarte icone="Tableau de bord" titre="En ce moment" sousTitre="État du campus" />
      <div className="grid grid-cols-3 gap-md px-xl pb-xl">
        <Indicateur valeur={compteurs.sortis} libelle="Sortis" />
        <Indicateur valeur={compteurs.enRetard} libelle="En retard" ton={ton(compteurs.enRetard, true)} />
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
  )
}

function CarteRetards() {
  const etat = useEtat()
  const utilisateur = useUtilisateurBO()
  const executer = useMDS((magasin) => magasin.executer)
  const maintenant = etat.horloge.maintenant
  const enRetard = selecteurs.pretsEnRetard(etat)

  return (
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
  )
}

function CarteConsommables() {
  const etat = useEtat()
  const dernierComptage = etat.consommables[0]?.dernierComptage ?? etat.horloge.maintenant

  return (
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
  )
}

function CarteRecap() {
  const etat = useEtat()
  const destinataires = selecteurs.destinatairesDuRecap(etat)

  return (
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
  )
}

function CarteSignalements() {
  const etat = useEtat()
  const utilisateur = useUtilisateurBO()
  const executer = useMDS((magasin) => magasin.executer)
  const navigate = useNavigate()
  const [filtre, setFiltre] = useState<'ouverts' | 'traites'>('ouverts')

  const signalements = etat.signalements.filter((signalement) =>
    filtre === 'ouverts' ? signalement.statut === 'ouvert' : signalement.statut === 'traite',
  )

  return (
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
                  {horloge.quand(signalement.le, etat.horloge.maintenant)}
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
  )
}

const CARTES: Record<CleCarte, () => ReactNode> = {
  afaire: CarteAFaire,
  enCeMoment: CarteEnCeMoment,
  retards: CarteRetards,
  signalements: CarteSignalements,
  consommables: CarteConsommables,
  recap: CarteRecap,
}

// ─── Personnalisation ────────────────────────────────────────────────────────

/**
 * Enveloppe d'une carte en mode « Personnaliser ».
 *
 * Deux façons de ranger, pour ne pas dépendre de la souris : on glisse la carte par sa
 * poignée, ou on la déplace aux boutons (flèches pour l'ordre, chevrons pour la colonne,
 * œil pour masquer). Les boutons portent leur intitulé complet, lu par les lecteurs
 * d'écran.
 */
function CarteRangeable({
  cle,
  zone,
  position,
  total,
  surDeplacer,
  surColonne,
  surMasquer,
  surGlisser,
  surDeposer,
  glissee,
  children,
}: {
  cle: CleCarte
  zone: ZoneCarte
  position: number
  total: number
  surDeplacer: (sens: -1 | 1) => void
  surColonne: () => void
  surMasquer: () => void
  surGlisser: () => void
  surDeposer: () => void
  glissee: boolean
  children: ReactNode
}) {
  const [survolee, setSurvolee] = useState(false)

  return (
    <section
      aria-label={`${NOMS[cle]} · ${zone === 'principale' ? 'colonne principale' : 'colonne latérale'}, position ${position + 1} sur ${total}`}
      draggable
      onDragStart={surGlisser}
      onDragEnd={() => setSurvolee(false)}
      onDragOver={(evenement) => {
        evenement.preventDefault()
        setSurvolee(true)
      }}
      onDragLeave={() => setSurvolee(false)}
      onDrop={(evenement) => {
        evenement.preventDefault()
        setSurvolee(false)
        surDeposer()
      }}
      className={[
        'flex flex-col gap-sm rounded-carte p-sm ring-1 ring-trait-bordure',
        'transition-[box-shadow,opacity] duration-rapide ease-sortie',
        glissee ? 'opacity-50' : '',
        survolee && !glissee ? 'ring-2 ring-marque-turquoise' : '',
      ].join(' ')}
    >
      <div className="flex items-center gap-xs px-sm">
        <span className="cursor-grab text-texte-tertiaire" aria-hidden>
          <Icone nom="Poignée" taille="lg" />
        </span>
        <p className="mds-texte-petit-fort flex-1 truncate text-texte-secondaire">{NOMS[cle]}</p>
        <BoutonIcone
          icone="Chevron haut"
          titre={`Monter ${NOMS[cle]}`}
          taille={36}
          disabled={position === 0}
          onClick={() => surDeplacer(-1)}
        />
        <BoutonIcone
          icone="Chevron bas"
          titre={`Descendre ${NOMS[cle]}`}
          taille={36}
          disabled={position === total - 1}
          onClick={() => surDeplacer(1)}
        />
        <BoutonIcone
          icone={zone === 'principale' ? 'Chevron droit' : 'Chevron gauche'}
          titre={
            zone === 'principale'
              ? `Envoyer ${NOMS[cle]} dans la colonne latérale`
              : `Ramener ${NOMS[cle]} dans la colonne principale`
          }
          taille={36}
          onClick={surColonne}
        />
        <BoutonIcone icone="Œil barré" titre={`Masquer ${NOMS[cle]}`} taille={36} onClick={surMasquer} />
      </div>
      <div className="pointer-events-none select-none">{children}</div>
    </section>
  )
}

export function TableauDeBord() {
  const utilisateur = useUtilisateurBO()
  const stockee = useMDS((magasin) => magasin.dispositions[utilisateur.id])
  const definirDisposition = useMDS((magasin) => magasin.definirDisposition)
  const [personnalise, setPersonnalise] = useState(false)
  const [glissee, setGlissee] = useState<CleCarte | null>(null)

  const disposition = useMemo(() => normaliser(stockee, utilisateur.role), [stockee, utilisateur.role])
  const auDefaut = estParDefaut(disposition, utilisateur.role)

  const appliquer = (suivante: Disposition) => definirDisposition(utilisateur.id, suivante)

  /** Dépose la carte glissée juste avant celle qu'on vise. */
  const deposerSur = (zone: ZoneCarte, index: number) => {
    if (glissee === null) return
    appliquer(poser(disposition, glissee, zone, index))
    setGlissee(null)
  }

  const colonne = (zone: ZoneCarte) => {
    const cartes = disposition[zone]
    return (
      <div
        className="flex min-w-0 flex-col gap-lg"
        {...(personnalise
          ? {
              onDragOver: (evenement: React.DragEvent) => evenement.preventDefault(),
              onDrop: () => deposerSur(zone, cartes.length),
            }
          : {})}
      >
        {cartes.map((cle, index) => {
          const Composant = CARTES[cle]
          if (!personnalise) return <Composant key={cle} />
          return (
            <CarteRangeable
              key={cle}
              cle={cle}
              zone={zone}
              position={index}
              total={cartes.length}
              glissee={glissee === cle}
              surGlisser={() => setGlissee(cle)}
              surDeposer={() => deposerSur(zone, index)}
              surDeplacer={(sens) => appliquer(deplacer(disposition, cle, sens))}
              surColonne={() => appliquer(changerDeColonne(disposition, cle))}
              surMasquer={() => appliquer(basculerVisibilite(disposition, cle, utilisateur.role))}
            >
              <Composant />
            </CarteRangeable>
          )
        })}
        {personnalise && cartes.length === 0 && (
          <p className="mds-texte-petit rounded-carte border border-dashed border-trait-bordure p-xl text-center text-texte-tertiaire">
            Colonne vide · dépose une carte ici
          </p>
        )}
      </div>
    )
  }

  const masquees = CLES_CARTES.filter((cle) => zoneDe(disposition, cle) === 'masquee')

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-wrap items-center gap-sm">
        <p className="mds-texte-petit flex-1 text-texte-tertiaire">
          {personnalise
            ? 'Range tes cartes : glisse-les par la poignée, ou utilise les flèches.'
            : masquees.length === 0
              ? `Disposition ${auDefaut ? 'par défaut' : 'personnalisée'} · ${utilisateur.role === 'direction' ? 'direction' : 'équipe pédagogique'}`
              : `${masquees.length} carte${masquees.length > 1 ? 's' : ''} masquée${masquees.length > 1 ? 's' : ''} · ${masquees.map((cle) => NOMS[cle]).join(', ')}`}
        </p>
        {personnalise && !auDefaut && (
          <Bouton
            libelle="Rétablir le défaut"
            type="Secondaire"
            icone="Rotation"
            onClick={() => appliquer(dispositionParDefaut(utilisateur.role))}
          />
        )}
        <Bouton
          libelle={personnalise ? 'Terminer' : 'Personnaliser'}
          type={personnalise ? 'Principal' : 'Secondaire'}
          icone={personnalise ? 'Coche' : 'Réglages'}
          onClick={() => {
            setPersonnalise(!personnalise)
            setGlissee(null)
          }}
        />
      </div>

      {personnalise && masquees.length > 0 && (
        <div className="flex flex-wrap items-center gap-sm rounded-carte bg-surface-carte p-lg ring-1 ring-trait-bordure">
          <p className="mds-texte-petit-fort text-texte-secondaire">Cartes masquées</p>
          {masquees.map((cle) => (
            <Bouton
              key={cle}
              libelle={NOMS[cle]}
              type="Secondaire"
              icone="Œil"
              onClick={() => appliquer(basculerVisibilite(disposition, cle, utilisateur.role))}
            />
          ))}
        </div>
      )}

      <div
        data-testid="grille-tableau-de-bord"
        className={[
          'grid items-start gap-lg',
          disposition.cote.length === 0 && !personnalise ? 'grid-cols-1' : 'grid-cols-[minmax(0,1fr)_420px]',
        ].join(' ')}
      >
        {colonne('principale')}
        {colonne('cote')}
      </div>
    </div>
  )
}
