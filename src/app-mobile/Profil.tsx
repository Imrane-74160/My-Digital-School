/**
 * A10 · Profil — `/app/profil` — nœud Figma `93:942`.
 *
 * Avatar 84 px, nom, classe et rôle, informations, puis les trois actions du compte.
 */
import { useNavigate } from 'react-router'
import { horloge, selecteurs } from '@/domain'
import { ActionDuCompte, Avatar, initialeDe, LigneDInformation, Pastille } from '@/design-system'
import { useEtat, usePersonaApp } from '@/store/hooks'

export function Profil() {
  const navigate = useNavigate()
  const etat = useEtat()
  const persona = usePersonaApp()

  const role = persona.role === 'intervenant' ? 'Intervenant' : 'Élève'
  const classes = persona.classes?.join(', ') ?? persona.classe ?? ''
  const historique = selecteurs.historiqueDe(etat, persona.id)

  return (
    <div className="flex flex-col gap-lg pb-lg">
      <section className="flex flex-col items-center gap-md px-lg pt-xl">
        <Avatar
          initiale={initialeDe(persona.prenom ?? persona.nom)}
          taille={84}
          couleur={persona.couleur}
          titre={persona.nom}
        />
        <h1 className="mds-titre-ecran-mobile text-texte-principal">{persona.nom}</h1>
        <p className="flex items-center gap-sm">
          {classes && <Pastille type="Classe" libelle={classes} />}
          <span className="mds-texte-corps text-texte-secondaire">{role}</span>
        </p>
      </section>

      <div className="mx-lg rounded-carte-mobile bg-surface-carte">
        <LigneDInformation icone="Utilisateur" libelle="Compte" valeur={persona.email ?? '—'} />
        <LigneDInformation
          icone="Historique"
          libelle="Emprunts cette année"
          valeur={`${persona.empruntsAnnee ?? historique.length}`}
        />
        <LigneDInformation
          icone="Bouclier"
          libelle="Charte acceptée le"
          valeur={persona.charteAcceptee ? horloge.jourLong(persona.charteAcceptee) : 'Jamais'}
        />
      </div>

      <div className="flex flex-col gap-md px-lg">
        <ActionDuCompte icone="Bouclier" libelle="Relire la charte" vers="/app/charte?lecture=1" />
        <ActionDuCompte icone="Drapeau" libelle="Signaler un problème" vers="/app/signaler" />
        <ActionDuCompte
          icone="Interdit"
          libelle="Se déconnecter"
          danger
          onClick={() => void navigate('/app/connexion')}
        />
      </div>
    </div>
  )
}
