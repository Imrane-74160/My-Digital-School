/**
 * B3 · Validations sur place — `/admin/validations` — nœud Figma `19:2`.
 *
 * Onglets Tout / Remises / Retours avec leurs compteurs, une Carte de validation
 * par prêt en attente, et la colonne « Niveau 1 » avec ses quatre règles.
 *
 * Remise : lecture seule, un seul bouton (pas de « manquant » à la remise).
 * Retour : puces « Manquant ? » basculables et les **deux** boutons côte à côte.
 */
import { useState } from 'react'
import { euros, horloge, manqueDeclare, selecteurs } from '@/domain'
import {
  Bouton,
  Carte,
  CarteDeValidation,
  EnTeteDeCarte,
  EtatVide,
  Onglets,
  PuceDeComposant,
  Regle,
} from '@/design-system'
import { iconeDe } from './aides'
import { useEtat, useUtilisateurBO } from '@/store/hooks'
import { useMDS } from '@/store/useMDS'

/** Les quatre règles de la colonne latérale, reprises mot pour mot du Figma. */
const REGLES_N1 = [
  {
    icone: 'Utilisateur validé' as const,
    titre: 'L’équipe remet en main propre',
    texte: 'Le matériel de niveau 1 ne sort jamais sans une validation au bureau.',
  },
  {
    icone: 'Liste cochée' as const,
    titre: 'Le contenu se vérifie à deux',
    texte: 'On ouvre le kit avec l’emprunteur, composant par composant.',
  },
  {
    icone: 'Portefeuille' as const,
    titre: 'Un composant manquant vaut son forfait',
    texte: 'Jamais celui du kit complet : c’est la règle R07.',
  },
  {
    icone: 'Horloge' as const,
    titre: 'Une remise non validée s’annule le soir',
    texte: 'À 18h, la demande tombe et le matériel redevient disponible.',
  },
]

type Onglet = 'tout' | 'remises' | 'retours'

export function Validations() {
  const etat = useEtat()
  const utilisateur = useUtilisateurBO()
  const executer = useMDS((magasin) => magasin.executer)
  const [onglet, setOnglet] = useState<Onglet>('tout')
  /** Composants marqués manquants, par matériel : local jusqu'au clic final. */
  const [manquants, setManquants] = useState<Record<string, string | undefined>>({})

  const remises = selecteurs.remisesAValider(etat)
  const retours = selecteurs.retoursAValider(etat)
  const cartes = onglet === 'remises' ? remises : onglet === 'retours' ? retours : [...remises, ...retours]

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_360px] gap-lg">
      <Carte>
        <EnTeteDeCarte
          icone="Liste cochée"
          titre="À valider sur place"
          sousTitre="Niveau 1 · l’équipe vérifie le matériel avec l’emprunteur"
          aDroite={
            <Onglets
              etiquette="Filtrer les validations"
              onglets={[
                { cle: 'tout', libelle: 'Tout', compteur: remises.length + retours.length },
                { cle: 'remises', libelle: 'Remises', compteur: remises.length },
                { cle: 'retours', libelle: 'Retours', compteur: retours.length },
              ]}
              actif={onglet}
              onChange={setOnglet}
            />
          }
        />

        {cartes.length === 0 ? (
          <EtatVide icone="Coche" titre="Tout est traité." detail="Rien ne vous attend." />
        ) : (
          <div className="flex flex-col gap-lg px-xl pb-xl">
            {cartes.map((pret) => {
              const materiel = selecteurs.materiel(etat, pret.materiel)
              const personne = selecteurs.personne(etat, pret.responsable)
              const remise = pret.statut === 'remise_a_valider'
              const manquant = manquants[materiel.id]
              // `manqueDeclare` traite un identifiant hors kit comme « contenu incomplet » (R07).
              const manque = manqueDeclare(materiel, manquant)

              // Ligne d'identité : un prêt de classe remplace « {classe} · attend au bureau ».
              const identite = remise
                ? [
                    selecteurs.prenom(personne),
                    pret.pourClasse
                      ? `pour la ${pret.pourClasse} · responsable du prêt pour sa classe`
                      : `${personne.classe ?? ''} · attend au bureau`,
                    `forfait de ${euros(pret.forfait)} accepté à ${horloge.heure(pret.demandeLe ?? etat.horloge.maintenant)}`,
                  ]
                    .filter((morceau) => morceau !== '')
                    .join(' · ')
                : [
                    personne.nom,
                    pret.pourClasse ? `pour la ${pret.pourClasse}` : (personne.classe ?? ''),
                    'a tout coché dans l’app · vérifiez avant la remise en stock',
                  ]
                    .filter((morceau) => morceau !== '')
                    .join(' · ')

              return (
                <CarteDeValidation
                  key={pret.id}
                  type={remise ? 'Remise' : 'Retour'}
                  icone={iconeDe(materiel)}
                  nom={materiel.nom}
                  identite={identite}
                  puces={
                    materiel.composants ? (
                      materiel.composants.map((element) => (
                        <PuceDeComposant
                          key={element.id}
                          nom={element.nom}
                          etat={remise ? 'Vérifié' : manquant === element.id ? 'Manquant' : 'Neutre'}
                          {...(remise
                            ? {}
                            : {
                                onBascule: () =>
                                  setManquants((precedent) => ({
                                    ...precedent,
                                    [materiel.id]:
                                      precedent[materiel.id] === element.id ? undefined : element.id,
                                  })),
                              })}
                        />
                      ))
                    ) : (
                      <PuceDeComposant
                        nom={remise ? 'Tout le contenu est là, rien d’abîmé' : 'Incomplet ou abîmé'}
                        etat={remise ? 'Vérifié' : manquant === 'tout' ? 'Manquant' : 'Neutre'}
                        {...(remise
                          ? {}
                          : {
                              onBascule: () =>
                                setManquants((precedent) => ({
                                  ...precedent,
                                  [materiel.id]: precedent[materiel.id] === 'tout' ? undefined : 'tout',
                                })),
                            })}
                      />
                    )
                  }
                  actions={
                    remise ? (
                      <Bouton
                        libelle="Valider la remise"
                        icone="Coche"
                        onClick={() =>
                          executer({
                            type: 'VALIDER_REMISE',
                            par: utilisateur.id,
                            materiel: materiel.id,
                          })
                        }
                      />
                    ) : (
                      <>
                        <Bouton
                          libelle="Conforme"
                          icone="Coche"
                          onClick={() =>
                            executer({
                              type: 'VALIDER_RETOUR',
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
                              type: 'VALIDER_RETOUR',
                              par: utilisateur.id,
                              materiel: materiel.id,
                              ...(manquant === undefined ? {} : { manquant }),
                            })
                          }
                        />
                      </>
                    )
                  }
                />
              )
            })}
          </div>
        )}
      </Carte>

      <Carte>
        <EnTeteDeCarte icone="Bouclier" titre="Niveau 1" sousTitre="Ce que dit le règlement" />
        <div className="flex flex-col pb-lg">
          {REGLES_N1.map((regle) => (
            <Regle key={regle.titre} icone={regle.icone} titre={regle.titre} texte={regle.texte} />
          ))}
        </div>
      </Carte>
    </div>
  )
}
