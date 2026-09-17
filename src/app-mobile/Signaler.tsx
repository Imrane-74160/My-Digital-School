/**
 * A8 · Signaler — `/app/signaler` — nœud Figma `92:874`.
 *
 * « Sur quoi ? » (mes prêts, salles, autres matériels), « Quel problème ? » (5 types),
 * détails et photo facultatifs. Le bouton reste désactivé sans type choisi.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { CATEGORIES_SIGNALEMENT, selecteurs, type CategorieSignalement } from '@/domain'
import {
  BoutonPrincipalMobile,
  EnTeteEcranMobile,
  Icone,
  ListeDeroulante,
  PuceDeCategorie,
  ZoneDAction,
} from '@/design-system'
import { useEtat, usePersonaApp } from '@/store/hooks'
import { useMDS } from '@/store/useMDS'

export function Signaler() {
  const navigate = useNavigate()
  const etat = useEtat()
  const persona = usePersonaApp()
  const executer = useMDS((magasin) => magasin.executer)

  const [categorie, setCategorie] = useState<CategorieSignalement | null>(null)
  const [texte, setTexte] = useState('')
  const [photo, setPhoto] = useState(false)

  // Mes prêts d'abord, puis les salles, puis les autres matériels.
  const cibles = [
    ...selecteurs.pretsEnCoursDe(etat, persona.id).map((pret) => {
      const materiel = selecteurs.materiel(etat, pret.materiel)
      return { valeur: `materiel:${materiel.id}`, libelle: `${materiel.nom} (mon prêt)` }
    }),
    ...etat.salles.map((salle) => ({ valeur: `salle:${salle.id}`, libelle: `Salle ${salle.id}` })),
    ...etat.materiels
      .filter((materiel) => materiel.statut !== 'emprunte')
      .slice(0, 12)
      .map((materiel) => ({ valeur: `materiel:${materiel.id}`, libelle: materiel.nom })),
  ]
  const [cible, setCible] = useState(cibles[0]?.valeur ?? '')

  const envoyer = () => {
    if (!categorie) return
    const [type, id] = cible.split(':') as ['materiel' | 'salle', string]
    const resultat = executer({
      type: 'SIGNALER',
      par: persona.id,
      cible: type === 'salle' ? { type: 'salle', id } : { type: 'materiel', id },
      categorie,
      texte,
      photo,
    })
    if (resultat.ok) void navigate('/app')
  }

  return (
    <div className="flex min-h-full flex-col">
      <EnTeteEcranMobile titre="Signaler" sousTitre="L’équipe est prévenue tout de suite." retour="/app" />

      <div className="flex flex-1 flex-col gap-xl overflow-y-auto px-lg pb-lg">
        <section className="flex flex-col gap-sm">
          <p className="mds-texte-corps-fort text-texte-principal">Sur quoi ?</p>
          <ListeDeroulante
            etiquette="Cible du signalement"
            options={cibles}
            valeur={cible}
            onChange={setCible}
          />
        </section>

        <section className="flex flex-col gap-sm">
          <p className="mds-texte-corps-fort text-texte-principal">Quel problème ?</p>
          <div className="flex flex-wrap gap-sm">
            {CATEGORIES_SIGNALEMENT.map((valeur) => (
              <PuceDeCategorie
                key={valeur}
                libelle={valeur}
                active={categorie === valeur}
                onClick={() => setCategorie(valeur)}
              />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-sm">
          <label className="mds-texte-corps-fort text-texte-principal" htmlFor="details">
            Détails (facultatif)
          </label>
          <textarea
            id="details"
            value={texte}
            onChange={(evenement) => setTexte(evenement.target.value)}
            rows={4}
            placeholder="Décris le problème en quelques mots."
            className="mds-texte-corps rounded-carte-mobile border border-trait-bordure bg-surface-carte p-lg text-texte-principal outline-none placeholder:text-texte-tertiaire focus-visible:border-marque-turquoise"
          />
        </section>

        <button
          type="button"
          onClick={() => setPhoto((precedent) => !precedent)}
          aria-pressed={photo}
          className={[
            'flex items-center gap-md rounded-carte-mobile p-lg text-left',
            photo ? 'bg-marque-turquoise-clair' : 'bg-surface-carte',
          ].join(' ')}
        >
          <span
            className={[
              'inline-flex size-[40px] shrink-0 items-center justify-center rounded-rond',
              photo
                ? 'bg-surface-carte text-marque-turquoise-fonce'
                : 'bg-surface-champ text-texte-principal',
            ].join(' ')}
          >
            <Icone nom={photo ? 'Coche' : 'Appareil photo'} taille="xl" />
          </span>
          <span className="flex flex-col">
            <span className="mds-texte-corps-fort text-texte-principal">
              {photo ? 'Photo jointe' : 'Ajouter une photo'}
            </span>
            <span className="mds-texte-petit text-texte-secondaire">Facultatif · photo simulée</span>
          </span>
        </button>
      </div>

      <ZoneDAction>
        <BoutonPrincipalMobile
          libelle="Envoyer le signalement"
          icone="Drapeau"
          disabled={categorie === null}
          onClick={envoyer}
        />
      </ZoneDAction>
    </div>
  )
}
