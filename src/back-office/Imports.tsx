/**
 * B11 · Imports Calc — `/admin/imports` — nœud Figma `88:2861`.
 *
 * Pas d'API : l'inventaire et les classes arrivent par fichiers Calc. On accepte un
 * vrai CSV déposé dans la zone, sinon le « fichier exemple » du jeu de démo. L'aperçu
 * contrôle chaque ligne et nomme la colonne fautive ; la ligne en erreur est ignorée.
 */
import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { euros, horloge, selecteurs, type LigneImport } from '@/domain'
import {
  Bouton,
  Carte,
  Encart,
  EnTeteDeCarte,
  EtatVide,
  Icone,
  LigneDImport,
  Pastille,
  PuceDeCategorie,
  Tableau,
  type Colonne,
} from '@/design-system'
import { useEtat, useUtilisateurBO } from '@/store/hooks'
import { useMDS } from '@/store/useMDS'

const COLONNES: Colonne[] = [
  { libelle: 'Nom' },
  { libelle: 'Catégorie', largeur: 130 },
  { libelle: 'Niveau', largeur: 80 },
  { libelle: 'Forfait', largeur: 100, droite: true },
  { libelle: 'Contrôle', largeur: 220 },
]

type Depot = { fichier: string; lignes: LigneImport[]; deposeLe: string }

/**
 * Lecture d'un CSV réel : `nom;catégorie;niveau;lieu;forfait`. Une valeur de niveau
 * absente ou hors 1/2 laisse la ligne en erreur, en nommant sa colonne (comme le Figma).
 */
function lireCsv(texte: string, lieuParDefaut: string): LigneImport[] {
  return texte
    .split(/\r?\n/)
    .map((ligne) => ligne.trim())
    .filter((ligne) => ligne !== '' && !ligne.toLowerCase().startsWith('nom;'))
    .map((ligne) => {
      const [nom = '', categorie = 'cours', niveau = '', lieu = '', forfait = ''] = ligne.split(';')
      const valeurNiveau = niveau.trim() === '1' ? 1 : niveau.trim() === '2' ? 2 : null
      return {
        nom: nom.trim(),
        categorie: categorie.trim(),
        niveau: valeurNiveau,
        lieu: lieu.trim() === '' ? lieuParDefaut : lieu.trim(),
        forfait: Number(forfait) || 0,
        icone: 'Colis',
        ...(valeurNiveau === null ? { erreur: 'Niveau manquant (colonne C)' } : {}),
      }
    })
}

export function Imports() {
  const etat = useEtat()
  const utilisateur = useUtilisateurBO()
  const executer = useMDS((magasin) => magasin.executer)
  const champFichier = useRef<HTMLInputElement>(null)

  const exemple = etat.importExemple.inventaire
  const [depot, setDepot] = useState<Depot | null>(null)
  const [classesDeposees, setClassesDeposees] = useState<string[] | null>(null)
  const [termine, setTermine] = useState(false)

  const maintenant = etat.horloge.maintenant
  const lignes = depot?.lignes ?? []
  const valides = lignes.filter((ligne) => ligne.erreur === undefined)
  const erreurs = lignes.length - valides.length

  const deposerExemple = () =>
    setDepot({ fichier: exemple.fichier, lignes: exemple.lignes, deposeLe: exemple.deposeLe })

  return (
    <div className="flex flex-col gap-lg">
      <Encart icone="Import">
        Pas d’API : l’inventaire et les classes arrivent par fichiers Calc (.ods ou .csv). Chaque import est
        vérifié avant d’être appliqué.
      </Encart>

      <Carte>
        <EnTeteDeCarte
          icone="Grille"
          titre="Inventaire"
          sousTitre="Nom · Catégorie · Niveau · Lieu · Forfait"
        />

        <div className="px-xl pb-lg">
          {depot === null ? (
            <div className="flex flex-col items-center gap-md rounded-carte border-2 border-dashed border-trait-fort px-xl py-2xl">
              <Icone nom="Import" pixels={32} />
              <p className="mds-texte-corps text-texte-secondaire">
                Dépose un fichier .ods ou .csv, ou charge le fichier exemple.
              </p>
              <div className="flex gap-sm">
                <Bouton
                  libelle="Choisir un fichier"
                  type="Secondaire"
                  icone="Dossier ouvert"
                  onClick={() => champFichier.current?.click()}
                />
                <Bouton libelle="Fichier exemple" icone="Import" onClick={deposerExemple} />
              </div>
              <input
                ref={champFichier}
                type="file"
                accept=".csv,.ods,text/csv"
                className="hidden"
                aria-label="Fichier d’inventaire"
                onChange={(evenement) => {
                  const fichier = evenement.target.files?.[0]
                  if (!fichier) return
                  // Un .ods est une archive : seul le CSV est réellement lu, sinon on retombe sur l'exemple.
                  if (!fichier.name.toLowerCase().endsWith('.csv')) {
                    deposerExemple()
                    return
                  }
                  void fichier.text().then((texte) =>
                    setDepot({
                      fichier: fichier.name,
                      lignes: lireCsv(texte, etat.lieux[0] ?? 'Bureau de la pédagogie'),
                      deposeLe: maintenant,
                    }),
                  )
                }}
              />
            </div>
          ) : (
            <div className="flex items-center gap-md rounded-vignette bg-surface-champ px-lg py-md">
              <Icone nom="Dossier" taille="xl" />
              <p className="mds-texte-corps min-w-0 flex-1 truncate text-texte-principal">
                {depot.fichier} · {depot.lignes.length} lignes lues · déposé à {horloge.heure(depot.deposeLe)}{' '}
                par {selecteurs.prenom(selecteurs.personne(etat, exemple.deposePar))}
              </p>
              <button
                type="button"
                aria-label="Retirer le fichier"
                onClick={() => {
                  setDepot(null)
                  setTermine(false)
                }}
                className="inline-flex size-[36px] items-center justify-center rounded-rond bg-surface-bouton-doux text-texte-principal"
              >
                <Icone nom="Croix" taille="lg" />
              </button>
            </div>
          )}
        </div>

        {depot !== null && (
          <>
            <Tableau etiquette="Aperçu de l’import" colonnes={COLONNES}>
              {lignes.map((ligne, index) => (
                <LigneDImport
                  key={`${ligne.nom}-${index}`}
                  colonnes={COLONNES}
                  {...(ligne.erreur === undefined ? {} : { erreur: ligne.erreur })}
                  cellules={[
                    <span className="mds-texte-corps-fort truncate text-texte-principal">{ligne.nom}</span>,
                    <span className="mds-texte-petit text-texte-secondaire">
                      {etat.categories[ligne.categorie]?.court ?? ligne.categorie}
                    </span>,
                    <span className="mds-mono-code text-texte-secondaire">
                      {ligne.niveau === null ? '—' : `N${ligne.niveau}`}
                    </span>,
                    <span className="mds-mono-code text-texte-principal">{euros(ligne.forfait)}</span>,
                  ]}
                />
              ))}
            </Tableau>

            <div className="flex flex-wrap items-center gap-sm px-xl pt-md pb-lg">
              <Pastille type="Montant" libelle={`${valides.length} lignes valides`} />
              {erreurs > 0 && (
                <Pastille type="Montant" libelle={`${erreurs} erreur${erreurs > 1 ? 's' : ''}`} />
              )}
              <Bouton
                libelle={`Importer les ${valides.length} lignes valides`}
                icone="Import"
                disabled={valides.length === 0}
                onClick={() => {
                  const resultat = executer({
                    type: 'IMPORT_INVENTAIRE',
                    par: utilisateur.id,
                    lignes: valides,
                  })
                  if (resultat.ok) {
                    setTermine(true)
                    setDepot(null)
                  }
                }}
              />
              <Bouton
                libelle="Annuler"
                type="Secondaire"
                onClick={() => {
                  setDepot(null)
                  setTermine(false)
                }}
              />
            </div>

            {erreurs > 0 && (
              <div className="px-xl pb-xl">
                <Encart icone="Alerte" ton="rose">
                  La ligne en erreur est ignorée : corrigez-la dans Calc puis réimportez.
                </Encart>
              </div>
            )}
          </>
        )}

        {termine && (
          <div className="px-xl pb-xl">
            <Encart icone="Coche" ton="turquoise">
              Import terminé.{' '}
              <Link className="underline" to="/admin/materiel">
                Voir le matériel
              </Link>
            </Encart>
          </div>
        )}
      </Carte>

      <Carte>
        <EnTeteDeCarte icone="Utilisateurs" titre="Liste des classes" sousTitre="Une classe par ligne" />

        <div className="flex flex-wrap gap-sm px-xl pb-md">
          {etat.classes.map((classe) => (
            <Pastille key={classe} type="Classe" libelle={classe} />
          ))}
        </div>

        <div className="flex flex-col gap-md px-xl pb-xl">
          {classesDeposees === null ? (
            <div className="flex items-center gap-md rounded-carte border-2 border-dashed border-trait-fort px-lg py-lg">
              <Icone nom="Import" taille="xl" />
              <p className="mds-texte-petit min-w-0 flex-1 text-texte-secondaire">
                {etat.importExemple.classes.fichier} · {etat.importExemple.classes.classes.length} classes
              </p>
              <Bouton
                libelle="Déposer le fichier"
                type="Secondaire"
                icone="Dossier ouvert"
                onClick={() => setClassesDeposees(etat.importExemple.classes.classes)}
              />
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-sm">
                <p className="mds-texte-petit w-full text-texte-tertiaire">Aperçu</p>
                {classesDeposees.map((classe) => (
                  <PuceDeCategorie key={classe} libelle={classe} active={etat.classes.includes(classe)} />
                ))}
              </div>
              <div className="flex gap-sm">
                <Bouton
                  libelle="Importer les classes"
                  icone="Import"
                  onClick={() => {
                    const resultat = executer({
                      type: 'IMPORT_CLASSES',
                      par: utilisateur.id,
                      classes: classesDeposees,
                    })
                    if (resultat.ok) setClassesDeposees(null)
                  }}
                />
                <Bouton libelle="Annuler" type="Secondaire" onClick={() => setClassesDeposees(null)} />
              </div>
            </>
          )}
        </div>
      </Carte>

      {etat.materiels.length === 0 && <EtatVide icone="Grille" titre="Inventaire vide" />}
    </div>
  )
}
