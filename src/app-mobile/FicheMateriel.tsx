/**
 * A5 · Fiche matériel et feuille Emprunter — `/app/materiel/:itemId` — nœud Figma `30:2`.
 *
 * Fiche : retour, fil d'Ariane, visuel, nom, badges, informations (2 lignes : où le
 * trouver, retour — le forfait vit dans la feuille). CTA contextuel selon l'état.
 * Feuille : forfait total et par composant, case d'acceptation obligatoire (R03),
 * contrôle « Pour moi / Pour ma classe » pour un intervenant (R09).
 */
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { euros, forfaitMateriel, horloge, selecteurs } from '@/domain'
import {
  BadgeDeStatut,
  BoutonPrincipalMobile,
  CaseACocher,
  EnTeteEcranMobile,
  Encart,
  LigneDeComposant,
  LigneDeMontant,
  LigneDInformation,
  Pastille,
  PuceDeCategorie,
  VisuelMateriel,
} from '@/design-system'
import { badgeDeType, iconeDe } from './aides'
import { useEtat, usePersonaApp } from '@/store/hooks'
import { useMDS } from '@/store/useMDS'

export function FicheMateriel() {
  const { itemId } = useParams()
  const navigate = useNavigate()
  const etat = useEtat()
  const persona = usePersonaApp()
  const executer = useMDS((magasin) => magasin.executer)

  const [feuilleOuverte, setFeuilleOuverte] = useState(false)
  const [forfaitAccepte, setForfaitAccepte] = useState(false)
  const [pourClasse, setPourClasse] = useState<string | null>(null)

  const materiel = etat.materiels.find((m) => m.id === itemId)
  if (!materiel) {
    return <EnTeteEcranMobile titre="Matériel introuvable" retour="/app/materiel" />
  }

  const forfait = forfaitMateriel(materiel)
  const pretOuvert = selecteurs.pretOuvertDe(etat, materiel.id)
  const chezMoi = pretOuvert?.responsable === persona.id
  const badge = badgeDeType(etat, materiel.type, persona.id)
  const bureauOuvert = horloge.estBureauOuvert(etat.horloge)
  const estIntervenant = persona.role === 'intervenant'

  const emprunter = () => {
    const resultat = executer({
      type: 'EMPRUNTER',
      par: persona.id,
      materiel: materiel.id,
      forfaitAccepte,
      ...(pourClasse === null ? {} : { pourClasse }),
    })
    if (resultat.ok) {
      setFeuilleOuverte(false)
      setForfaitAccepte(false)
      void navigate('/app')
    }
  }

  return (
    <div className="relative flex min-h-full flex-col">
      <EnTeteEcranMobile titre="" retour="/app/materiel" />
      <p className="mds-texte-petit -mt-lg px-lg pb-md text-texte-tertiaire">
        Matériel / {etat.categories[materiel.categorie]?.court ?? ''}
      </p>

      <div className="flex flex-1 flex-col gap-lg px-lg pb-2xl">
        <VisuelMateriel icone={iconeDe(materiel)} hauteur={190} />

        <div className="flex flex-col gap-sm">
          <h1 className="mds-titre-ecran-mobile text-texte-principal">{materiel.nom}</h1>
          <div className="flex flex-wrap items-center gap-sm">
            <BadgeDeStatut statut={badge.statut} libelle={badge.libelle} />
            <Pastille
              type="Niveau"
              libelle={materiel.niveau === 1 ? 'N1 · remise par l’équipe' : 'N2 · libre-service'}
            />
            {materiel.reserveA && <Pastille type="Classe" libelle="Intervenants" />}
          </div>
        </div>

        <div className="rounded-carte-mobile bg-surface-carte">
          <LigneDInformation icone="Repère" libelle="Où le trouver" valeur={materiel.lieu} />
          <LigneDInformation
            icone="Échange"
            libelle="Retour"
            valeur={materiel.niveau === 1 ? 'Sur place avec l’équipe' : 'Avec une photo, avant 18h'}
          />
        </div>
      </div>

      <div className="shrink-0 px-lg pb-2xl">
        {chezMoi && pretOuvert?.statut === 'actif' ? (
          <Link to={`/app/rendre/${materiel.id}`}>
            <BoutonPrincipalMobile libelle="Rendre ce matériel" icone="Échange" />
          </Link>
        ) : chezMoi ? (
          <Encart icone="Repère" ton="orange">
            Présente-toi {selecteurs.auLieu(materiel.lieu)} : l’équipe vérifie le matériel avec toi.
          </Encart>
        ) : ['anomalie', 'hors_service', 'perdu'].includes(materiel.statut) ? (
          <BoutonPrincipalMobile libelle="Momentanément retiré du prêt" disabled />
        ) : materiel.statut !== 'disponible' ? (
          <BoutonPrincipalMobile
            libelle={
              selecteurs.estInscritAuType(etat, materiel.type, persona.id)
                ? 'Tu seras prévenu(e)'
                : 'Me prévenir à son retour'
            }
            type="Secondaire"
            icone="Cloche"
            onClick={() => executer({ type: 'PREVENEZ_MOI', par: persona.id, typeMateriel: materiel.type })}
          />
        ) : !bureauOuvert ? (
          <BoutonPrincipalMobile libelle="Bureau fermé · réouverture à 8h" disabled />
        ) : (
          <BoutonPrincipalMobile
            libelle={materiel.niveau === 1 ? 'Demander la remise' : 'Emprunter'}
            icone="Colis"
            onClick={() => setFeuilleOuverte(true)}
          />
        )}
      </div>

      {feuilleOuverte && (
        <>
          <button
            type="button"
            aria-label="Fermer la feuille"
            onClick={() => setFeuilleOuverte(false)}
            className="absolute inset-0 z-10 bg-marque-anthracite/50"
          />
          <section
            role="dialog"
            aria-label="Emprunter"
            data-testid="feuille-emprunter"
            className="absolute inset-x-0 bottom-0 z-20 flex flex-col gap-lg rounded-t-carte bg-surface-carte p-xl"
            style={{ animation: 'monter var(--mds-duree-lent) var(--mds-easing-feuille)' }}
          >
            <span aria-hidden className="mx-auto h-[5px] w-[40px] rounded-rond bg-trait-grille" />

            <div className="flex flex-col gap-xs">
              <p className="mds-titre-carte text-texte-principal">{materiel.nom}</p>
              <p className="mds-texte-petit text-texte-secondaire">{materiel.lieu}</p>
            </div>

            <div className="flex flex-col gap-sm">
              <LigneDeMontant
                libelle="Forfait en cas de perte"
                precision={materiel.composants ? 'Somme des composants' : 'Forfait du matériel'}
                montant={euros(forfait)}
                sombre
              />
              {materiel.composants?.map((composant) => (
                <LigneDeComposant key={composant.id} nom={composant.nom} montant={euros(composant.forfait)} />
              ))}
            </div>

            {estIntervenant && (
              <div className="flex flex-col gap-sm">
                <div className="flex gap-sm">
                  <PuceDeCategorie
                    libelle="Pour moi"
                    active={pourClasse === null}
                    onClick={() => setPourClasse(null)}
                  />
                  {selecteurs.classesProposees(etat).map((classe) => (
                    <PuceDeCategorie
                      key={classe}
                      libelle={`Pour la ${classe}`}
                      active={pourClasse === classe}
                      onClick={() => setPourClasse(classe)}
                    />
                  ))}
                </div>
                <p className="mds-texte-petit text-texte-secondaire">
                  Tu seras responsable du matériel et seul à pouvoir le rendre.
                </p>
              </div>
            )}

            <CaseACocher
              cochee={forfaitAccepte}
              onChange={setForfaitAccepte}
              pleineLargeur
              libelle={`J’accepte le forfait de ${euros(forfait)} en cas de perte ou de casse.`}
            />

            <Encart icone={materiel.niveau === 1 ? 'Utilisateur validé' : 'Image'}>
              {materiel.niveau === 1
                ? 'L’équipe vérifie le matériel avec toi à la remise et au retour.'
                : 'Tu rends le matériel ce soir avant 18h, avec une photo.'}
            </Encart>

            <BoutonPrincipalMobile
              libelle={materiel.niveau === 1 ? 'Demander la remise' : 'Emprunter'}
              icone="Coche"
              disabled={!forfaitAccepte}
              onClick={emprunter}
            />
          </section>
        </>
      )}
    </div>
  )
}
