/**
 * A6 · Rendre — `/app/rendre/:itemId` — nœud Figma `31:2`.
 *
 * Étape 1 « Vérifie le contenu » : une case par composant pour un kit, sinon
 * « Tout le contenu est là » et « Rien n'est abîmé ». Étape 2 « Prends une photo ».
 * Le bouton reste désactivé tant que la photo n'est pas prise (R05). Un composant
 * décoché part en `manquant`.
 */
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import {
  BadgeDeStatut,
  BoutonPrincipalMobile,
  CaseACocher,
  Encart,
  EnTeteEcranMobile,
  Etape,
  Icone,
  Pastille,
  Pictogramme,
  VisuelMateriel,
  ZoneDAction,
} from '@/design-system'
import { iconeDe, teinteDe } from './aides'
import { useEtat, usePersonaApp } from '@/store/hooks'
import { useMDS } from '@/store/useMDS'

export function Rendre() {
  const { itemId } = useParams()
  const navigate = useNavigate()
  const etat = useEtat()
  const persona = usePersonaApp()
  const executer = useMDS((magasin) => magasin.executer)

  const materiel = etat.materiels.find((m) => m.id === itemId)
  const [photoPrise, setPhotoPrise] = useState(false)
  // Toutes les cases sont cochées au départ : décocher signale un manque.
  const [coches, setCoches] = useState<Record<string, boolean>>(() => {
    if (!materiel) return {}
    if (materiel.composants) {
      return Object.fromEntries(materiel.composants.map((composant) => [composant.id, true]))
    }
    return { contenu: true, etat: true }
  })

  if (!materiel) {
    return <EnTeteEcranMobile titre="Matériel introuvable" retour="/app" />
  }

  const decoche = Object.entries(coches).find(([, coche]) => !coche)?.[0]
  const manquant = decoche === 'contenu' || decoche === 'etat' ? 'abime' : decoche

  const valider = () => {
    const resultat = executer({
      type: 'RENDRE',
      par: persona.id,
      materiel: materiel.id,
      photo: photoPrise,
      ...(manquant === undefined ? {} : { manquant }),
    })
    if (resultat.ok) void navigate('/app')
  }

  return (
    <div className="flex min-h-full flex-col">
      <EnTeteEcranMobile titre="Rendre le matériel" retour="/app" />

      <div className="flex flex-1 flex-col gap-sm overflow-y-auto pb-lg">
        <div className="px-lg">
          <div className="flex items-center gap-md rounded-carte-mobile bg-surface-carte p-md">
            <Pictogramme icone={iconeDe(materiel)} teinte={teinteDe(materiel)} taille={52} />
            <div className="flex min-w-0 flex-1 flex-col">
              <p className="mds-titre-carte truncate text-texte-principal">{materiel.nom}</p>
              <p className="mds-texte-petit text-texte-secondaire">{materiel.lieu}</p>
            </div>
            <Pastille type="Niveau" libelle={`N${materiel.niveau}`} />
          </div>
        </div>

        <Etape numero={1} titre="Vérifie le contenu" />
        <div className="flex flex-col gap-md rounded-carte-mobile bg-surface-carte mx-lg p-lg">
          {materiel.composants ? (
            materiel.composants.map((composant) => (
              <CaseACocher
                key={composant.id}
                cochee={coches[composant.id] ?? false}
                onChange={(valeur) => setCoches((p) => ({ ...p, [composant.id]: valeur }))}
                pleineLargeur
                libelle={composant.nom}
              />
            ))
          ) : (
            <>
              <CaseACocher
                cochee={coches['contenu'] ?? false}
                onChange={(valeur) => setCoches((p) => ({ ...p, contenu: valeur }))}
                pleineLargeur
                libelle="Tout le contenu est là"
              />
              <CaseACocher
                cochee={coches['etat'] ?? false}
                onChange={(valeur) => setCoches((p) => ({ ...p, etat: valeur }))}
                pleineLargeur
                libelle="Rien n’est abîmé"
              />
            </>
          )}
        </div>

        <Link
          to="/app/signaler"
          className="mds-texte-petit-fort flex items-center gap-sm px-lg pt-sm text-marque-turquoise-fonce"
        >
          <Icone nom="Drapeau" taille="sm" />
          Un souci ? Signaler un problème
        </Link>

        <Etape numero={2} titre="Prends une photo" />
        <div className="px-lg">
          {photoPrise ? (
            <VisuelMateriel icone={iconeDe(materiel)} hauteur={176}>
              <span className="absolute top-md left-md">
                <BadgeDeStatut statut="Disponible" libelle="Photo prise" />
              </span>
              <button
                type="button"
                onClick={() => setPhotoPrise(false)}
                className="mds-texte-petit-fort absolute right-md bottom-md inline-flex items-center gap-xs rounded-bouton bg-surface-carte px-md py-sm text-texte-principal"
              >
                <Icone nom="Appareil photo" taille="sm" />
                Reprendre
              </button>
            </VisuelMateriel>
          ) : (
            <button
              type="button"
              onClick={() => setPhotoPrise(true)}
              data-testid="prendre-la-photo"
              className="mds-texte-corps-fort flex h-[176px] w-full flex-col items-center justify-center gap-sm rounded-carte-mobile border-2 border-dashed border-trait-fort text-texte-secondaire"
            >
              <Icone nom="Appareil photo" pixels={32} />
              Prendre la photo
            </button>
          )}
        </div>

        <div className="px-lg pt-sm">
          <Encart icone={materiel.niveau === 1 ? 'Utilisateur validé' : 'Image'}>
            {materiel.niveau === 1
              ? 'L’équipe contrôle le matériel avec toi. La photo reste une trace.'
              : 'La photo protège le prochain emprunteur. L’équipe la contrôle plus tard.'}
          </Encart>
        </div>
      </div>

      <ZoneDAction>
        <BoutonPrincipalMobile
          libelle="Valider le retour"
          icone="Coche"
          disabled={!photoPrise}
          onClick={valider}
        />
      </ZoneDAction>
    </div>
  )
}
