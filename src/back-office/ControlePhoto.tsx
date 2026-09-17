/**
 * B4 · Contrôle photo — `/admin/controle-photo` — nœud Figma `22:2`.
 *
 * Une Carte photo de retour par photo en attente, plus la table « Contrôlées
 * récemment ». La zone photo n'est pas une image : aplat rayé teinté à la couleur
 * de catégorie avec l'icône du matériel, et une puce « {fichier} · {date} ».
 *
 * Puces « Manquant ? » : une par composant pour un kit, une seule puce
 * « Incomplet ou abîmé » sinon — ce second cas vaut le forfait complet (R07).
 */
import { useState } from 'react'
import { euros, forfaitMateriel, horloge, manqueDeclare, selecteurs } from '@/domain'
import {
  BadgeDeStatut,
  Bouton,
  Carte,
  CartePhotoDeRetour,
  CelluleDouble,
  EnTeteDeCarte,
  EtatVide,
  Icone,
  LigneDeTableau,
  PuceDeComposant,
  Tableau,
  VisuelMateriel,
  type Colonne,
} from '@/design-system'
import { iconeDe } from './aides'
import { useEtat, useUtilisateurBO } from '@/store/hooks'
import { useMDS } from '@/store/useMDS'

const COLONNES: Colonne[] = [
  { libelle: 'Matériel' },
  { libelle: 'Rendu par', largeur: 170 },
  { libelle: 'Contrôlée', largeur: 150 },
  { libelle: 'Résultat', largeur: 200, droite: true },
]

export function ControlePhoto() {
  const etat = useEtat()
  const utilisateur = useUtilisateurBO()
  const executer = useMDS((magasin) => magasin.executer)
  const [manquants, setManquants] = useState<Record<string, string | undefined>>({})
  const [agrandie, setAgrandie] = useState<string | null>(null)

  const maintenant = etat.horloge.maintenant
  const enAttente = selecteurs.photosAControler(etat)
  const controlees = etat.photosDeRetour
    .filter((photo) => photo.statut !== 'a_controler')
    .sort((a, b) => ((a.controleLe ?? '') < (b.controleLe ?? '') ? 1 : -1))

  const photoAgrandie = etat.photosDeRetour.find((photo) => photo.id === agrandie)

  return (
    <div className="flex flex-col gap-lg">
      <Carte>
        <EnTeteDeCarte
          icone="Image"
          titre="Photos de retour à contrôler"
          sousTitre={`Niveau 2 · ${enAttente.length} photo${enAttente.length > 1 ? 's' : ''} en attente`}
        />
        {enAttente.length === 0 ? (
          <EtatVide icone="Coche" titre="Tout est traité." detail="Rien ne vous attend." />
        ) : (
          <div className="grid grid-cols-2 gap-lg px-xl pb-xl">
            {enAttente.map((photo) => {
              const materiel = selecteurs.materiel(etat, photo.materiel)
              const responsable = selecteurs.personne(etat, photo.responsable)
              const manquant = manquants[photo.id]
              const manque = manqueDeclare(materiel, manquant)

              return (
                <CartePhotoDeRetour
                  key={photo.id}
                  nom={materiel.nom}
                  forfait={euros(forfaitMateriel(materiel))}
                  rendu={responsable.nom}
                  declaration={photo.declaration ?? 'Rien à signaler'}
                  {...(photo.reempruntePar === undefined
                    ? {}
                    : {
                        reempruntePar: selecteurs.prenom(selecteurs.personne(etat, photo.reempruntePar)),
                      })}
                  visuel={
                    <VisuelMateriel icone={iconeDe(materiel)} hauteur={200}>
                      <span className="mds-mono-micro absolute bottom-md left-md rounded-pastille bg-surface-carte px-[7px] py-[2px] text-texte-secondaire">
                        {photo.fichier ?? 'photo.jpg'} · {horloge.quand(photo.prisLe, maintenant)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setAgrandie(photo.id)}
                        aria-label={`Agrandir la photo de ${materiel.nom}`}
                        className="absolute top-md right-md inline-flex size-[36px] items-center justify-center rounded-rond bg-surface-carte text-texte-principal"
                      >
                        <Icone nom="Agrandir" taille="lg" />
                      </button>
                    </VisuelMateriel>
                  }
                  puces={
                    materiel.composants ? (
                      materiel.composants.map((composant) => (
                        <PuceDeComposant
                          key={composant.id}
                          nom={composant.nom}
                          etat={manquant === composant.id ? 'Manquant' : 'Neutre'}
                          onBascule={() =>
                            setManquants((precedent) => ({
                              ...precedent,
                              [photo.id]: precedent[photo.id] === composant.id ? undefined : composant.id,
                            }))
                          }
                        />
                      ))
                    ) : (
                      <PuceDeComposant
                        nom="Incomplet ou abîmé"
                        etat={manquant === 'tout' ? 'Manquant' : 'Neutre'}
                        onBascule={() =>
                          setManquants((precedent) => ({
                            ...precedent,
                            [photo.id]: precedent[photo.id] === 'tout' ? undefined : 'tout',
                          }))
                        }
                      />
                    )
                  }
                  actions={
                    <>
                      <Bouton
                        libelle="Photo conforme"
                        icone="Coche"
                        onClick={() =>
                          executer({
                            type: 'CONTROLER_PHOTO',
                            par: utilisateur.id,
                            materiel: materiel.id,
                          })
                        }
                      />
                      <Bouton
                        libelle={`Créer l’incident${manque === null ? '' : ` · ${euros(manque.montant)}`}`}
                        type="Alerte"
                        icone="Alerte"
                        disabled={manquant === undefined}
                        onClick={() =>
                          executer({
                            type: 'CONTROLER_PHOTO',
                            par: utilisateur.id,
                            materiel: materiel.id,
                            ...(manquant === undefined ? {} : { manquant }),
                          })
                        }
                      />
                    </>
                  }
                />
              )
            })}
          </div>
        )}
      </Carte>

      <Carte>
        <EnTeteDeCarte icone="Historique" titre="Contrôlées récemment" sousTitre="Photos déjà traitées" />
        {controlees.length === 0 ? (
          <EtatVide icone="Image" titre="Aucune photo contrôlée" />
        ) : (
          <Tableau etiquette="Photos contrôlées" colonnes={COLONNES}>
            {controlees.map((photo) => {
              const materiel = selecteurs.materiel(etat, photo.materiel)
              const incident = etat.incidents.find((element) => element.id === photo.incident)
              return (
                <LigneDeTableau
                  key={photo.id}
                  colonnes={COLONNES}
                  cellules={[
                    <CelluleDouble principal={materiel.nom} secondaire={photo.fichier ?? 'photo.jpg'} />,
                    <span className="mds-texte-petit text-texte-secondaire">
                      {selecteurs.personne(etat, photo.responsable).nom}
                    </span>,
                    <span className="mds-texte-petit text-texte-secondaire">
                      {photo.controleLe === undefined ? '—' : horloge.quand(photo.controleLe, maintenant)}
                    </span>,
                    photo.statut === 'conforme' ? (
                      <BadgeDeStatut statut="Disponible" libelle="Conforme" />
                    ) : (
                      <BadgeDeStatut
                        statut="Incident"
                        libelle={`Incident${incident ? ` · ${euros(incident.montant)}` : ''}`}
                      />
                    ),
                  ]}
                />
              )
            })}
          </Tableau>
        )}
      </Carte>

      {photoAgrandie && (
        <div
          role="dialog"
          aria-label="Photo de retour"
          className="fixed inset-0 z-40 flex items-center justify-center bg-marque-anthracite/70 p-3xl"
        >
          <div className="flex w-full max-w-[720px] flex-col gap-md rounded-carte bg-surface-carte p-xl">
            <div className="flex items-center gap-md">
              <p className="mds-titre-carte flex-1 text-texte-principal">
                {selecteurs.materiel(etat, photoAgrandie.materiel).nom}
              </p>
              <button
                type="button"
                onClick={() => setAgrandie(null)}
                aria-label="Fermer la visionneuse"
                className="inline-flex size-[36px] items-center justify-center rounded-rond bg-surface-bouton-doux text-texte-principal"
              >
                <Icone nom="Croix" taille="lg" />
              </button>
            </div>
            <VisuelMateriel
              icone={iconeDe(selecteurs.materiel(etat, photoAgrandie.materiel))}
              hauteur={420}
            />
            <p className="mds-texte-petit text-texte-secondaire">
              {photoAgrandie.fichier ?? 'photo.jpg'} · prise à {horloge.heure(photoAgrandie.prisLe)} ·{' '}
              {photoAgrandie.declaration ?? 'Rien à signaler'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
