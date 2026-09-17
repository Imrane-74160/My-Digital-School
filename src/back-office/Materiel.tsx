/**
 * B5 · Matériel — `/admin/materiel?id=&ancre=forfait` — nœud Figma `24:3`.
 *
 * Tableau d'inventaire à gauche (avec la ligne de contexte dérivée du statut) et
 * fiche du matériel sélectionné à droite : QR généré depuis le code, action
 * contextuelle, « Forfait par composant » et les deux actions de mise hors prêt.
 *
 * Arbitrage : le total d'un kit s'intitule « Kit complet » et reste **calculé**,
 * jamais saisi. Sandrine édite chaque composant ▶ MODIFIER_FORFAIT{composant},
 * appliqué à tout le type ; Lydia voit les mêmes lignes avec un cadenas (R12).
 */
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { euros, forfaitMateriel, horloge, selecteurs, type Materiel as MaterielType } from '@/domain'
import {
  BadgeDeStatut,
  Bouton,
  Carte,
  CaseACocher,
  CelluleDouble,
  Champ,
  Encart,
  EnTeteDeCarte,
  EtatVide,
  Icone,
  LigneDeTableau,
  ListeDeroulante,
  Onglets,
  Pastille,
  Pictogramme,
  PuceDeCategorie,
  Tableau,
  type Colonne,
} from '@/design-system'
import { badgeDeMateriel, contexteDuMateriel, iconeDe, teinteDe } from './aides'
import { MotifQR } from '@/design-system'
import { useEtat, useUtilisateurBO } from '@/store/hooks'
import { useMDS } from '@/store/useMDS'

const COLONNES: Colonne[] = [
  { libelle: 'Matériel' },
  { libelle: 'Catégorie', largeur: 150 },
  { libelle: 'Niveau', largeur: 80 },
  { libelle: 'Statut', largeur: 200 },
  { libelle: 'Forfait', largeur: 100, droite: true },
]

type Filtre = 'tout' | 'n1' | 'n2' | 'disponibles' | 'sortis' | 'retires'

const FILTRES: { cle: Filtre; libelle: string }[] = [
  { cle: 'tout', libelle: 'Tout' },
  { cle: 'n1', libelle: 'Niveau 1' },
  { cle: 'n2', libelle: 'Niveau 2' },
  { cle: 'disponibles', libelle: 'Disponibles' },
  { cle: 'sortis', libelle: 'Sortis' },
  { cle: 'retires', libelle: 'Retirés' },
]

const RETIRES = ['hors_service', 'anomalie', 'perdu']
const SORTIS = ['emprunte', 'remise_a_valider', 'retour_a_valider']

function garde(materiel: MaterielType, filtre: Filtre): boolean {
  switch (filtre) {
    case 'tout':
      return true
    case 'n1':
      return materiel.niveau === 1
    case 'n2':
      return materiel.niveau === 2
    case 'disponibles':
      return materiel.statut === 'disponible'
    case 'sortis':
      return SORTIS.includes(materiel.statut)
    case 'retires':
      return RETIRES.includes(materiel.statut)
  }
}

export function MaterielBO() {
  const etat = useEtat()
  const utilisateur = useUtilisateurBO()
  const executer = useMDS((magasin) => magasin.executer)
  const [parametres, setParametres] = useSearchParams()

  const [recherche, setRecherche] = useState('')
  const [filtre, setFiltre] = useState<Filtre>('tout')
  const [categorie, setCategorie] = useState<string>('toutes')
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)

  const selectionne = parametres.get('id')
  const ancre = parametres.get('ancre')
  const forfaits = useRef<HTMLDivElement>(null)

  // Arrivée depuis B8 avec `&ancre=forfait` : la fiche s'ouvre défilée sur les forfaits.
  useEffect(() => {
    if (ancre === 'forfait') forfaits.current?.scrollIntoView({ block: 'center' })
  }, [ancre, selectionne])

  const terme = recherche.trim().toLowerCase()
  const lignes = etat.materiels.filter((materiel) => {
    if (!garde(materiel, filtre)) return false
    if (categorie !== 'toutes' && materiel.categorie !== categorie) return false
    if (terme === '') return true
    return materiel.nom.toLowerCase().includes(terme) || materiel.qr.toLowerCase().includes(terme)
  })

  const sortis = etat.materiels.filter((materiel) => SORTIS.includes(materiel.statut)).length
  const retires = etat.materiels.filter((materiel) => RETIRES.includes(materiel.statut)).length
  const fiche = etat.materiels.find((materiel) => materiel.id === selectionne)

  const choisir = (id: string) => {
    const suivant = new URLSearchParams(parametres)
    suivant.set('id', id)
    suivant.delete('ancre')
    setParametres(suivant)
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_400px] gap-lg">
      <Carte>
        <EnTeteDeCarte
          icone="Grille"
          titre="Inventaire"
          sousTitre={`${etat.materiels.length} matériels · ${sortis} sortis · ${retires} retirés du prêt`}
          aDroite={
            <Bouton
              libelle="Ajouter un matériel"
              icone="Plus"
              onClick={() => setFormulaireOuvert((precedent) => !precedent)}
            />
          }
        />

        <div className="flex flex-wrap items-center gap-md px-xl pb-md">
          <Champ
            etiquette="Rechercher un matériel"
            valeur={recherche}
            onChange={setRecherche}
            placeholder="Nom ou code QR"
            icone="Loupe"
          />
          <ListeDeroulante
            etiquette="Catégorie"
            valeur={categorie}
            onChange={setCategorie}
            options={[
              { valeur: 'toutes', libelle: 'Toutes les catégories' },
              ...Object.entries(etat.categories).map(([cle, valeur]) => ({
                valeur: cle,
                libelle: valeur.nom,
              })),
            ]}
          />
        </div>

        <div className="px-xl pb-md">
          <Onglets
            etiquette="Filtrer l’inventaire"
            onglets={FILTRES.map(({ cle, libelle }) => ({ cle, libelle }))}
            actif={filtre}
            onChange={setFiltre}
          />
        </div>

        {formulaireOuvert && (
          <div className="px-xl pb-md">
            <FormulaireMateriel
              lieux={etat.lieux}
              categories={Object.entries(etat.categories).map(([cle, valeur]) => ({
                valeur: cle,
                libelle: valeur.nom,
              }))}
              onAnnuler={() => setFormulaireOuvert(false)}
              onAjouter={(donnees) => {
                const resultat = executer({ type: 'AJOUTER_MATERIEL', par: utilisateur.id, donnees })
                if (resultat.ok) setFormulaireOuvert(false)
              }}
            />
          </div>
        )}

        {lignes.length === 0 ? (
          <EtatVide icone="Loupe" titre="Aucun matériel" detail="Change la recherche ou les filtres." />
        ) : (
          <Tableau etiquette="Inventaire" colonnes={COLONNES}>
            {lignes.map((materiel) => {
              const badge = badgeDeMateriel(materiel)
              const contexte = contexteDuMateriel(etat, materiel)
              return (
                <LigneDeTableau
                  key={materiel.id}
                  colonnes={COLONNES}
                  selectionnee={materiel.id === selectionne}
                  onClick={() => choisir(materiel.id)}
                  cellules={[
                    <CelluleDouble
                      principal={materiel.nom}
                      secondaire={<span className="mds-mono-code">{materiel.qr}</span>}
                    />,
                    <span className="mds-texte-petit text-texte-secondaire">
                      {etat.categories[materiel.categorie]?.court ?? materiel.categorie}
                    </span>,
                    <Pastille type="Niveau" libelle={`N${materiel.niveau}`} />,
                    <span className="flex flex-col items-start gap-xs">
                      <BadgeDeStatut statut={badge.statut} libelle={badge.libelle} />
                      {contexte !== undefined && (
                        <span className="mds-texte-petit truncate text-texte-tertiaire">{contexte}</span>
                      )}
                    </span>,
                    <span className="mds-mono-code text-texte-principal">
                      {euros(forfaitMateriel(materiel))}
                    </span>,
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
            icone="Grille"
            titre="Aucune fiche ouverte"
            detail="Choisis un matériel dans le tableau."
          />
        ) : (
          <FicheMaterielBO
            materiel={fiche}
            surForfaits={forfaits}
            onAllerA={(id) => choisir(id)}
            key={fiche.id}
          />
        )}
      </Carte>
    </div>
  )
}

// ─── Fiche du matériel sélectionné ───────────────────────────────────────────

function FicheMaterielBO({
  materiel,
  surForfaits,
  onAllerA,
}: {
  materiel: MaterielType
  surForfaits: React.RefObject<HTMLDivElement | null>
  onAllerA: (id: string) => void
}) {
  const etat = useEtat()
  const utilisateur = useUtilisateurBO()
  const executer = useMDS((magasin) => magasin.executer)
  const direction = selecteurs.estDirection(utilisateur.role)

  const [enEdition, setEnEdition] = useState<string | null>(null)
  const [saisie, setSaisie] = useState('')

  const badge = badgeDeMateriel(materiel)
  const pret = selecteurs.pretOuvertDe(etat, materiel.id)
  const photo = selecteurs.photoEnAttenteDe(etat, materiel.id)
  const enStock = materiel.statut === 'disponible'
  const retire = RETIRES.includes(materiel.statut)
  const autresUnites = selecteurs.unitesDuType(etat, materiel.type)

  const enregistrer = (composant: string | undefined, valeur: string) => {
    const montant = Number(valeur)
    if (!Number.isFinite(montant)) return
    const resultat = executer({
      type: 'MODIFIER_FORFAIT',
      par: utilisateur.id,
      typeMateriel: materiel.type,
      valeur: montant,
      ...(composant === undefined ? {} : { composant }),
    })
    if (resultat.ok) setEnEdition(null)
  }

  return (
    <div className="flex flex-col gap-lg pb-xl">
      <EnTeteDeCarte icone="Étiquette" titre={materiel.nom} sousTitre={materiel.lieu} />

      <div className="flex items-center gap-lg px-xl">
        <span className="rounded-vignette bg-surface-carte p-sm ring-1 ring-trait-bordure">
          <MotifQR code={materiel.qr} taille={132} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-sm">
          <span className="mds-mono-code text-texte-secondaire">{materiel.qr}</span>
          <BadgeDeStatut statut={badge.statut} libelle={badge.libelle} />
          <span className="flex flex-wrap gap-xs">
            <Pastille type="Niveau" libelle={`N${materiel.niveau}`} />
            {materiel.reserveA === 'intervenant' && <Pastille type="Classe" libelle="Intervenants" />}
            <Pastille type="Montant" libelle={`${autresUnites.length} unité(s)`} />
          </span>
          {materiel.note !== undefined && (
            <p className="mds-texte-petit text-texte-tertiaire">{materiel.note}</p>
          )}
        </div>
      </div>

      {pret?.statut === 'remise_a_valider' && (
        <div className="mx-xl flex flex-col gap-sm rounded-vignette bg-marque-orange-clair px-lg py-md">
          <p className="mds-texte-corps-fort text-marque-orange-fonce">À valider sur place</p>
          <p className="mds-texte-petit text-marque-orange-fonce">
            {selecteurs.personne(etat, pret.responsable).nom} attend au bureau depuis{' '}
            {horloge.heure(pret.demandeLe ?? etat.horloge.maintenant)}
          </p>
          <span className="self-start">
            <Bouton
              libelle="Valider la remise"
              icone="Coche"
              onClick={() => executer({ type: 'VALIDER_REMISE', par: utilisateur.id, materiel: materiel.id })}
            />
          </span>
        </div>
      )}

      {pret?.statut === 'retour_a_valider' && (
        <div className="px-xl">
          <Encart icone="Liste cochée" ton="orange">
            Retour déclaré par {selecteurs.personne(etat, pret.responsable).nom} : contrôle sur place depuis
            Validations.
          </Encart>
        </div>
      )}

      {photo !== undefined && (
        <div className="px-xl">
          <Encart icone="Image" ton="turquoise">
            Photo de retour de {selecteurs.personne(etat, photo.responsable).nom} en attente de contrôle.
          </Encart>
        </div>
      )}

      <div ref={surForfaits} className="flex flex-col gap-sm px-xl">
        <p className="mds-texte-petit-fort text-texte-tertiaire">
          {materiel.composants ? 'Forfait par composant' : 'Forfait du matériel'}
        </p>

        {materiel.composants ? (
          <>
            {materiel.composants.map((composant) => (
              <LigneEditable
                key={composant.id}
                libelle={composant.nom}
                montant={composant.forfait}
                direction={direction}
                enEdition={enEdition === composant.id}
                saisie={saisie}
                onSaisie={setSaisie}
                onOuvrir={() => {
                  if (!direction) {
                    // Lydia : le moteur refuse et le toast affiche R12.
                    executer({
                      type: 'MODIFIER_FORFAIT',
                      par: utilisateur.id,
                      typeMateriel: materiel.type,
                      composant: composant.id,
                      valeur: composant.forfait,
                    })
                    return
                  }
                  setEnEdition(composant.id)
                  setSaisie(String(composant.forfait))
                }}
                onEnregistrer={() => enregistrer(composant.id, saisie)}
              />
            ))}
            <div className="flex items-center justify-between rounded-vignette bg-surface-champ px-lg py-md">
              <span className="mds-texte-corps-fort text-texte-principal">Kit complet</span>
              <span className="mds-mono-code text-texte-principal">{euros(forfaitMateriel(materiel))}</span>
            </div>
            <p className="mds-texte-petit text-texte-tertiaire">
              Le total est calculé, jamais saisi. Un changement s’applique à tout le type.
            </p>
          </>
        ) : (
          <LigneEditable
            libelle={materiel.nom}
            montant={forfaitMateriel(materiel)}
            direction={direction}
            enEdition={enEdition === 'unite'}
            saisie={saisie}
            onSaisie={setSaisie}
            onOuvrir={() => {
              if (!direction) {
                executer({
                  type: 'MODIFIER_FORFAIT',
                  par: utilisateur.id,
                  typeMateriel: materiel.type,
                  valeur: forfaitMateriel(materiel),
                })
                return
              }
              setEnEdition('unite')
              setSaisie(String(forfaitMateriel(materiel)))
            }}
            onEnregistrer={() => enregistrer(undefined, saisie)}
          />
        )}
      </div>

      {autresUnites.length > 1 && (
        <div className="flex flex-col gap-xs px-xl">
          <p className="mds-texte-petit-fort text-texte-tertiaire">Autres unités du type</p>
          <div className="flex flex-wrap gap-sm">
            {autresUnites
              .filter((unite) => unite.id !== materiel.id)
              .map((unite) => (
                <PuceDeCategorie
                  key={unite.id}
                  libelle={unite.nom}
                  active={false}
                  onClick={() => onAllerA(unite.id)}
                />
              ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-sm px-xl">
        <Bouton
          libelle="Imprimer l’étiquette"
          type="Secondaire"
          icone="Imprimante"
          onClick={() => window.print()}
        />
        {retire ? (
          <Bouton
            libelle="Remettre en service"
            icone="Rotation"
            onClick={() => executer({ type: 'REMETTRE', par: utilisateur.id, materiel: materiel.id })}
          />
        ) : (
          <Bouton
            libelle="Retirer du prêt"
            type="Alerte"
            icone="Interdit"
            disabled={!enStock}
            onClick={() => executer({ type: 'RETIRER', par: utilisateur.id, materiel: materiel.id })}
          />
        )}
      </div>

      <div className="flex items-center gap-md px-xl">
        <Pictogramme icone={iconeDe(materiel)} teinte={teinteDe(materiel)} taille={40} />
        <p className="mds-texte-petit text-texte-tertiaire">
          {materiel.niveau === 1
            ? 'Niveau 1 : remise et retour validés sur place par l’équipe.'
            : 'Niveau 2 : libre-service, retour avec photo avant 18h.'}
        </p>
      </div>
    </div>
  )
}

/** Une ligne de forfait de la fiche : lecture, cadenas pour l'équipe, saisie pour Sandrine. */
function LigneEditable({
  libelle,
  montant,
  direction,
  enEdition,
  saisie,
  onSaisie,
  onOuvrir,
  onEnregistrer,
}: {
  libelle: string
  montant: number
  direction: boolean
  enEdition: boolean
  saisie: string
  onSaisie: (valeur: string) => void
  onOuvrir: () => void
  onEnregistrer: () => void
}) {
  return (
    <div className="flex items-center gap-md border-b border-trait-bordure py-sm last:border-b-0">
      <span className="mds-texte-corps min-w-0 flex-1 truncate text-texte-principal">{libelle}</span>
      {enEdition ? (
        <>
          <input
            type="number"
            min={0}
            autoFocus
            value={saisie}
            onChange={(evenement) => onSaisie(evenement.target.value)}
            aria-label={`Forfait de ${libelle}`}
            className="mds-mono-code h-[36px] w-[96px] rounded-champ border border-trait-bordure bg-surface-carte px-md text-right text-texte-principal outline-none focus-visible:border-marque-turquoise"
          />
          <Bouton libelle="Enregistrer" icone="Coche" onClick={onEnregistrer} />
        </>
      ) : (
        <>
          <span className="mds-mono-code text-texte-principal">{euros(montant)}</span>
          <button
            type="button"
            onClick={onOuvrir}
            aria-label={`Modifier le forfait de ${libelle}`}
            className="inline-flex size-[36px] shrink-0 items-center justify-center rounded-rond bg-surface-bouton-doux text-texte-principal transition-colors duration-rapide ease-sortie hover:bg-etat-doux-survol"
          >
            <Icone nom={direction ? 'Modifier' : 'Cadenas'} taille="lg" />
          </button>
        </>
      )}
    </div>
  )
}

// ─── Formulaire « Ajouter un matériel » ──────────────────────────────────────

function FormulaireMateriel({
  lieux,
  categories,
  onAjouter,
  onAnnuler,
}: {
  lieux: string[]
  categories: { valeur: string; libelle: string }[]
  onAjouter: (donnees: {
    nom: string
    categorie: string
    niveau: 1 | 2
    lieu: string
    forfait: number
  }) => void
  onAnnuler: () => void
}) {
  const [nom, setNom] = useState('')
  const [categorie, setCategorie] = useState(categories[0]?.valeur ?? 'cours')
  const [lieu, setLieu] = useState(lieux[0] ?? '')
  const [forfait, setForfait] = useState('')
  const [niveau1, setNiveau1] = useState(false)

  const complet = nom.trim() !== '' && Number(forfait) > 0

  return (
    <div className="flex flex-col gap-md rounded-vignette bg-surface-champ p-lg">
      <p className="mds-texte-corps-fort text-texte-principal">Ajouter un matériel</p>
      <div className="flex flex-wrap items-end gap-md">
        <Champ etiquette="Nom" valeur={nom} onChange={setNom} placeholder="Souris Apple #04" />
        <ListeDeroulante
          etiquette="Catégorie"
          valeur={categorie}
          onChange={setCategorie}
          options={categories}
        />
        <ListeDeroulante
          etiquette="Lieu"
          valeur={lieu}
          onChange={setLieu}
          options={lieux.map((valeur) => ({ valeur, libelle: valeur }))}
        />
        <Champ
          etiquette="Forfait en euros"
          valeur={forfait}
          onChange={setForfait}
          placeholder="79"
          icone="Portefeuille"
          className="w-[180px]"
        />
      </div>
      <CaseACocher
        cochee={niveau1}
        onChange={setNiveau1}
        libelle="Niveau 1 · remise et retour validés par l’équipe"
      />
      <div className="flex gap-sm">
        <Bouton
          libelle="Ajouter"
          icone="Plus"
          disabled={!complet}
          onClick={() =>
            onAjouter({
              nom: nom.trim(),
              categorie,
              niveau: niveau1 ? 1 : 2,
              lieu,
              forfait: Number(forfait),
            })
          }
        />
        <Bouton libelle="Annuler" type="Secondaire" onClick={onAnnuler} />
      </div>
    </div>
  )
}
