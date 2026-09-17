/**
 * B12 · Réglages — `/admin/reglages` — nœud Figma `89:3051`.
 *
 * Charte en **un seul bloc** : la ligne de titre, puis les 7 articles numérotés en
 * paragraphes éditables sur place (sans champ de titre visible). Ni ajout ni
 * suppression d'article ; un seul bouton « Enregistrer la charte », désactivé tant
 * que rien n'a changé. Lydia voit le bloc en lecture seule avec le cadenas (R12).
 *
 * Puis Notifications (2 interrupteurs ▶ REGLAGE) et Rôles et accès.
 */
import { useState } from 'react'
import { horloge, selecteurs } from '@/domain'
import {
  Avatar,
  BadgeDeStatut,
  Bouton,
  Carte,
  Encart,
  EnTeteDeCarte,
  Icone,
  initialeDe,
  Interrupteur,
  LigneDeReglage,
} from '@/design-system'
import { useEtat, useUtilisateurBO } from '@/store/hooks'
import { useMDS } from '@/store/useMDS'

export function Reglages() {
  const etat = useEtat()
  const utilisateur = useUtilisateurBO()
  const executer = useMDS((magasin) => magasin.executer)
  const direction = selecteurs.estDirection(utilisateur.role)

  const charte = etat.reglages.charte
  // Les 7 textes en cours d'édition, remis à plat dès que la charte change dans l'état.
  const [textes, setTextes] = useState<Record<string, string>>(() =>
    Object.fromEntries(charte.articles.map((article) => [article.id, article.texte])),
  )

  const modifie = charte.articles.some((article) => (textes[article.id] ?? '') !== article.texte)
  const equipe = etat.personnes.filter((personne) => selecteurs.estEquipe(personne.role))

  const enregistrer = () => {
    const resultat = executer({
      type: 'MODIFIER_CHARTE',
      par: utilisateur.id,
      articles: charte.articles.map((article) => ({
        ...article,
        texte: textes[article.id] ?? article.texte,
      })),
    })
    if (resultat.ok) {
      setTextes(Object.fromEntries(charte.articles.map((article) => [article.id, article.texte])))
    }
  }

  return (
    <div className="flex flex-col gap-lg">
      <Encart icone={direction ? 'Bouclier' : 'Cadenas'}>
        Connectée en tant que {selecteurs.prenom(utilisateur)} ({direction ? 'direction' : 'équipe'}) : la
        charte et les forfaits ne sont modifiables que par elle.
      </Encart>

      <div className="grid grid-cols-[minmax(0,1fr)_400px] gap-lg">
        <Carte>
          <EnTeteDeCarte
            icone="Liste cochée"
            titre="Charte d’utilisation"
            sousTitre={`Acceptée une fois à la première connexion · modifiée le ${horloge.jourLong(etat.reglages.charteModifieeLe)}`}
            aDroite={
              direction ? (
                <Bouton
                  libelle="Enregistrer la charte"
                  icone="Coche"
                  disabled={!modifie}
                  onClick={enregistrer}
                />
              ) : (
                <Bouton
                  libelle="Enregistrer la charte"
                  type="Secondaire"
                  icone="Cadenas"
                  onClick={enregistrer}
                />
              )
            }
          />

          {/* Un seul bloc : la ligne de titre puis les 7 articles numérotés. */}
          <div
            data-testid="bloc-charte"
            className="mx-xl mb-xl flex flex-col gap-md rounded-carte bg-surface-champ p-xl"
          >
            <p className="mds-titre-carte text-texte-principal">{charte.titre}</p>

            {charte.articles.map((article, index) => (
              <div key={article.id} className="flex gap-md">
                <span className="mds-mono-code shrink-0 pt-xs text-texte-tertiaire">{index + 1}.</span>
                {direction ? (
                  <textarea
                    value={textes[article.id] ?? article.texte}
                    onChange={(evenement) =>
                      setTextes((precedent) => ({ ...precedent, [article.id]: evenement.target.value }))
                    }
                    aria-label={`Article ${index + 1} · ${article.titre}`}
                    rows={2}
                    className="mds-texte-corps field-sizing-content w-full resize-none rounded-champ border border-transparent bg-transparent px-sm py-xs text-texte-principal outline-none hover:border-trait-bordure focus-visible:border-marque-turquoise focus-visible:bg-surface-carte"
                  />
                ) : (
                  <p className="mds-texte-corps px-sm py-xs text-texte-principal">{article.texte}</p>
                )}
              </div>
            ))}

            {!direction && (
              <p className="mds-texte-petit flex items-center gap-sm text-texte-tertiaire">
                <Icone nom="Cadenas" taille="sm" />
                Lecture seule : seule Sandrine modifie la charte.
              </p>
            )}
          </div>
        </Carte>

        <div className="flex flex-col gap-lg">
          <Carte>
            <EnTeteDeCarte icone="Cloche" titre="Notifications" sousTitre="Envois automatiques" />
            <LigneDeReglage
              titre="Rappel de 16h30"
              detail="Push et email aux emprunteurs qui ont un prêt en cours"
              interrupteur={
                <Interrupteur
                  etiquette="Rappel de 16h30"
                  active={etat.reglages.rappel1630}
                  onChange={(valeur) =>
                    executer({ type: 'REGLAGE', par: utilisateur.id, cle: 'rappel1630', valeur })
                  }
                />
              }
            />
            <LigneDeReglage
              titre="Récap de 8h"
              detail="Email à Cyrianne, Lydia et Sandrine"
              interrupteur={
                <Interrupteur
                  etiquette="Récap de 8h"
                  active={etat.reglages.recap8h}
                  onChange={(valeur) =>
                    executer({ type: 'REGLAGE', par: utilisateur.id, cle: 'recap8h', valeur })
                  }
                />
              }
            />
          </Carte>

          <Carte>
            <EnTeteDeCarte icone="Bouclier" titre="Rôles et accès" sousTitre="Qui peut quoi" />
            <div className="flex flex-col gap-sm px-xl pb-xl">
              {equipe.map((personne) => (
                <div
                  key={personne.id}
                  className="flex items-center gap-md rounded-vignette bg-surface-champ px-lg py-md"
                >
                  <Avatar
                    initiale={initialeDe(personne.nom)}
                    taille={32}
                    couleur={personne.couleur}
                    titre={personne.nom}
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="mds-texte-corps-fort truncate text-texte-principal">{personne.nom}</p>
                    <p className="mds-texte-petit truncate text-texte-secondaire">{personne.droits ?? ''}</p>
                  </div>
                  <BadgeDeStatut
                    statut={selecteurs.estDirection(personne.role) ? 'Payé' : 'En cours'}
                    libelle={selecteurs.estDirection(personne.role) ? 'Direction' : 'Équipe'}
                    pastille={false}
                  />
                </div>
              ))}
            </div>
          </Carte>
        </div>
      </div>
    </div>
  )
}
