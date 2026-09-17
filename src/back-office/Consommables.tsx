/**
 * B9 · Consommables — `/admin/consommables` — nœud Figma `84:2451`.
 *
 * Bandeau de règle, une Carte de stock par consommable (badge « Sous le seuil » /
 * « OK »), **un seul** bouton global « Enregistrer le comptage » ▶ COMPTAGE, puis
 * l'historique des trois dernières semaines avec l'auteur de chaque comptage.
 */
import { useState } from 'react'
import { horloge, selecteurs } from '@/domain'
import {
  Bouton,
  Carte,
  CarteDeStock,
  CelluleDouble,
  Encart,
  EnTeteDeCarte,
  EtatVide,
  LigneDeTableau,
  Tableau,
  type Colonne,
  type NomIcone,
} from '@/design-system'
import { useEtat, useUtilisateurBO } from '@/store/hooks'
import { useMDS } from '@/store/useMDS'

export function Consommables() {
  const etat = useEtat()
  const utilisateur = useUtilisateurBO()
  const executer = useMDS((magasin) => magasin.executer)

  // Une saisie par consommable, initialisée sur la quantité connue.
  const [saisies, setSaisies] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      etat.consommables.map((consommable) => [consommable.id, String(consommable.quantite)]),
    ),
  )

  const maintenant = etat.horloge.maintenant
  const bas = selecteurs.consommablesBas(etat)
  const historique = etat.comptages.slice(0, 3)

  const colonnes: Colonne[] = [
    { libelle: 'Semaine' },
    ...etat.consommables.map((consommable) => ({ libelle: consommable.nom, largeur: 110, droite: true })),
  ]

  const enregistrer = () => {
    const quantites: Record<string, number> = {}
    for (const consommable of etat.consommables) {
      const valeur = Number(saisies[consommable.id] ?? consommable.quantite)
      quantites[consommable.id] = Number.isFinite(valeur) ? valeur : consommable.quantite
    }
    executer({ type: 'COMPTAGE', par: utilisateur.id, quantites })
  }

  return (
    <div className="flex flex-col gap-lg">
      <Encart icone="Bouclier">
        Comptage rapide chaque lundi · pas de suivi par personne · alerte dans le récap de 8h sous le seuil
      </Encart>

      <Carte>
        <EnTeteDeCarte
          icone="Stylo"
          titre="Consommables"
          sousTitre={
            bas.length === 0
              ? 'Tous les stocks sont au-dessus du seuil'
              : `${bas.length} produit${bas.length > 1 ? 's' : ''} sous le seuil`
          }
          aDroite={<Bouton libelle="Enregistrer le comptage" icone="Coche" onClick={enregistrer} />}
        />
        <div className="grid grid-cols-3 gap-lg px-xl pb-xl">
          {etat.consommables.map((consommable) => (
            <CarteDeStock
              key={consommable.id}
              nom={consommable.nom}
              unite={consommable.unite}
              icone={consommable.icone as NomIcone}
              quantite={consommable.quantite}
              seuil={consommable.seuil}
              dernierComptage={horloge.jourLong(consommable.dernierComptage)}
              saisie={saisies[consommable.id] ?? String(consommable.quantite)}
              onSaisie={(valeur) => setSaisies((precedent) => ({ ...precedent, [consommable.id]: valeur }))}
            />
          ))}
        </div>
      </Carte>

      <Carte>
        <EnTeteDeCarte icone="Historique" titre="Historique des comptages" sousTitre="3 dernières semaines" />
        {historique.length === 0 ? (
          <EtatVide icone="Historique" titre="Aucun comptage" />
        ) : (
          <Tableau etiquette="Historique des comptages" colonnes={colonnes}>
            {historique.map((comptage) => (
              <LigneDeTableau
                key={comptage.le}
                colonnes={colonnes}
                cellules={[
                  <CelluleDouble
                    principal={horloge.jourLongCapitalise(comptage.le)}
                    secondaire={`par ${selecteurs.prenom(selecteurs.personne(etat, comptage.par))}`}
                  />,
                  ...etat.consommables.map((consommable) => (
                    <span key={consommable.id} className="mds-mono-code text-texte-principal">
                      {comptage.quantites[consommable.id] ?? '—'}
                    </span>
                  )),
                ]}
              />
            ))}
          </Tableau>
        )}
        <p className="mds-texte-petit px-xl pb-xl text-texte-tertiaire">
          Dernier comptage enregistré {horloge.quand(historique[0]?.le ?? maintenant, maintenant)}.
        </p>
      </Carte>
    </div>
  )
}
