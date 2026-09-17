/**
 * B10 · Salles — `/admin/salles` — nœud Figma `87:2645`.
 *
 * Tableau des salles avec le compteur − n + (local jusqu'au clic sur « Valider »
 * ▶ VERIFIER_SALLE), et le panneau « Vérification de {mois} » : jauge d'avancement
 * et liste « À régler » à trois types de cartes — manquant, en trop, et la carte de
 * rapprochement qui apparie les deux.
 */
import { useState } from 'react'
import { horloge, selecteurs } from '@/domain'
import {
  BadgeDeStatut,
  Bouton,
  Carte,
  CelluleDouble,
  Encart,
  EnTeteDeCarte,
  EtatVide,
  Icone,
  LigneDeTableau,
  Onglets,
  Pictogramme,
  Tableau,
  type Colonne,
} from '@/design-system'
import { statutDeSalle } from './aides'
import { useEtat, useUtilisateurBO } from '@/store/hooks'
import { useMDS } from '@/store/useMDS'

const COLONNES: Colonne[] = [
  { libelle: 'Salle' },
  { libelle: 'Ventilateurs présents', largeur: 230 },
  { libelle: 'Vérifiée le', largeur: 150 },
  { libelle: 'Statut', largeur: 150 },
  { libelle: ' ', largeur: 120, droite: true },
]

/** Ligne secondaire sous le nom de la salle, à trois variantes. */
function contexteDeSalle(
  etat: ReturnType<typeof useEtat>,
  salle: { id: string; presents: number; attendus: number },
): string {
  const signalement = selecteurs
    .signalementsOuverts(etat)
    .find((element) => element.cible.type === 'salle' && element.cible.id === salle.id)
  if (signalement) {
    const par = selecteurs.prenom(selecteurs.personne(etat, signalement.par))
    return `Signalé par ${par} · ${horloge.quand(signalement.le, etat.horloge.maintenant)}`
  }
  if (salle.presents > salle.attendus) return 'Un ventilateur en trop'
  return 'Aucun signalement'
}

export function SallesBO() {
  const etat = useEtat()
  const utilisateur = useUtilisateurBO()
  const executer = useMDS((magasin) => magasin.executer)
  const [filtre, setFiltre] = useState<'toutes' | 'regler'>('toutes')
  const [compteurs, setCompteurs] = useState<Record<string, number>>({})

  const maintenant = etat.horloge.maintenant
  const aRegler = selecteurs.sallesARegler(etat)
  const salles = filtre === 'regler' ? aRegler : etat.salles
  const conformes = etat.salles.length - aRegler.length
  const avancement = Math.round((conformes / Math.max(1, etat.salles.length)) * 100)

  const manquantes = aRegler.filter((salle) => salle.presents < salle.attendus)
  const enTrop = aRegler.filter((salle) => salle.presents > salle.attendus)
  // Carte de rapprochement : un manque et un surplus s'expliquent souvent l'un par l'autre.
  const rapprochement =
    manquantes[0] !== undefined && enTrop[0] !== undefined
      ? { manque: manquantes[0].id, trop: enTrop[0].id }
      : null

  const valeur = (salle: { id: string; presents: number }) => compteurs[salle.id] ?? salle.presents

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_380px] gap-lg">
      <Carte>
        <EnTeteDeCarte
          icone="Ventilateur"
          titre="Salles"
          sousTitre={`${etat.salles.length} salles · ${aRegler.length} à régler`}
          aDroite={
            <Onglets
              etiquette="Filtrer les salles"
              onglets={[
                { cle: 'toutes', libelle: 'Toutes' },
                { cle: 'regler', libelle: 'À régler', compteur: aRegler.length },
              ]}
              actif={filtre}
              onChange={setFiltre}
            />
          }
        />

        {salles.length === 0 ? (
          <EtatVide icone="Coche" titre="Tout est en ordre" detail="Aucun écart à régler." />
        ) : (
          <Tableau etiquette="Salles" colonnes={COLONNES}>
            {salles.map((salle) => {
              const presents = valeur(salle)
              const badge = statutDeSalle(presents, salle.attendus)
              return (
                <LigneDeTableau
                  key={salle.id}
                  colonnes={COLONNES}
                  cellules={[
                    <CelluleDouble
                      principal={`Salle ${salle.id}`}
                      secondaire={contexteDeSalle(etat, salle)}
                    />,
                    <span className="flex items-center gap-sm">
                      <button
                        type="button"
                        aria-label={`Un ventilateur en moins en salle ${salle.id}`}
                        onClick={() =>
                          setCompteurs((precedent) => ({
                            ...precedent,
                            [salle.id]: Math.max(0, presents - 1),
                          }))
                        }
                        className="inline-flex size-[36px] items-center justify-center rounded-rond bg-surface-bouton-doux text-texte-principal transition-colors duration-rapide ease-sortie hover:bg-etat-doux-survol"
                      >
                        <Icone nom="Moins" taille="lg" />
                      </button>
                      <span className="mds-mono-code w-[24px] text-center text-texte-principal">
                        {presents}
                      </span>
                      <button
                        type="button"
                        aria-label={`Un ventilateur en plus en salle ${salle.id}`}
                        onClick={() =>
                          setCompteurs((precedent) => ({ ...precedent, [salle.id]: presents + 1 }))
                        }
                        className="inline-flex size-[36px] items-center justify-center rounded-rond bg-surface-bouton-doux text-texte-principal transition-colors duration-rapide ease-sortie hover:bg-etat-doux-survol"
                      >
                        <Icone nom="Plus" taille="lg" />
                      </button>
                      <span className="mds-texte-petit text-texte-tertiaire">
                        / {salle.attendus} attendus
                      </span>
                    </span>,
                    <span className="mds-texte-petit text-texte-secondaire">
                      {horloge.quand(salle.verifieeLe, maintenant)}
                    </span>,
                    <BadgeDeStatut statut={badge.statut} libelle={badge.libelle} />,
                    <Bouton
                      libelle="Valider"
                      type="Secondaire"
                      icone="Coche"
                      onClick={() => {
                        const resultat = executer({
                          type: 'VERIFIER_SALLE',
                          par: utilisateur.id,
                          salle: salle.id,
                          presents,
                        })
                        if (resultat.ok) {
                          setCompteurs((precedent) => {
                            const suivant = { ...precedent }
                            delete suivant[salle.id]
                            return suivant
                          })
                        }
                      }}
                    />,
                  ]}
                />
              )
            })}
          </Tableau>
        )}

        <p className="mds-texte-petit px-xl pb-xl text-texte-tertiaire">
          Ajustez le nombre de ventilateurs trouvés, puis validez la salle. Un écart reste visible jusqu’à la
          prochaine vérification.
        </p>
      </Carte>

      <Carte>
        <EnTeteDeCarte
          icone="Liste cochée"
          titre={`Vérification de ${horloge.moisLong(maintenant)}`}
          sousTitre={`Prochaine : ${horloge.jourLong(horloge.ajouterJours(maintenant, 30))}`}
        />

        <div className="flex flex-col gap-sm px-xl pb-lg">
          <div className="flex items-baseline justify-between">
            <span className="mds-texte-petit text-texte-secondaire">Avancement</span>
            <span className="mds-mono-code text-texte-principal">{avancement} %</span>
          </div>
          <span className="block h-[8px] w-full overflow-hidden rounded-rond bg-surface-pastille">
            <span
              className="block h-full rounded-rond bg-marque-turquoise"
              style={{ width: `${avancement}%` }}
            />
          </span>
          <p className="mds-texte-petit text-texte-tertiaire">
            {conformes} salle{conformes > 1 ? 's' : ''} sur {etat.salles.length} sans écart.
          </p>
        </div>

        <div className="flex flex-col gap-sm px-xl pb-xl">
          <p className="mds-texte-petit-fort text-texte-tertiaire">À régler</p>

          {aRegler.length === 0 ? (
            <Encart icone="Coche" ton="turquoise">
              Aucun écart : toutes les salles ont le compte attendu.
            </Encart>
          ) : (
            <>
              {manquantes.map((salle) => (
                <article
                  key={salle.id}
                  className="flex items-center gap-md rounded-vignette bg-marque-rose-clair px-lg py-md"
                >
                  <Pictogramme icone="Ventilateur" teinte="Rose" taille={40} />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="mds-texte-corps-fort text-marque-rose-fonce">Salle {salle.id}</p>
                    <p className="mds-texte-petit text-marque-rose-fonce">
                      {salle.attendus - salle.presents} ventilateur
                      {salle.attendus - salle.presents > 1 ? 's' : ''} manquant
                      {salle.attendus - salle.presents > 1 ? 's' : ''}
                    </p>
                  </div>
                </article>
              ))}

              {enTrop.map((salle) => (
                <article
                  key={salle.id}
                  className="flex items-center gap-md rounded-vignette bg-marque-orange-clair px-lg py-md"
                >
                  <Pictogramme icone="Ventilateur" teinte="Orange" taille={40} />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="mds-texte-corps-fort text-marque-orange-fonce">Salle {salle.id}</p>
                    <p className="mds-texte-petit text-marque-orange-fonce">
                      {salle.presents - salle.attendus} ventilateur
                      {salle.presents - salle.attendus > 1 ? 's' : ''} en trop
                    </p>
                  </div>
                </article>
              ))}

              {rapprochement !== null && (
                <article className="flex items-center gap-md rounded-vignette bg-surface-champ px-lg py-md">
                  <Pictogramme icone="Échange" teinte="Turquoise" taille={40} />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="mds-texte-corps-fort text-texte-principal">
                      Salle {rapprochement.trop} → salle {rapprochement.manque}
                    </p>
                    <p className="mds-texte-petit text-texte-secondaire">
                      Le ventilateur en trop vient sans doute de la {rapprochement.manque}
                    </p>
                  </div>
                </article>
              )}
            </>
          )}
        </div>
      </Carte>
    </div>
  )
}
