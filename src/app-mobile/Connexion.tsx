/**
 * A1 · Connexion — `/app/connexion` — nœud Figma `91:711`.
 *
 * Logo, visuel, accroche, bouton unique. Le clic connecte la persona choisie dans le
 * panneau de démo, puis mène à la Charte si elle n'a jamais été acceptée, sinon à l'accueil.
 */
import { useNavigate } from 'react-router'
import { BoutonPrincipalMobile, Icone, VisuelMateriel, ZoneDAction } from '@/design-system'
import { usePersonaApp } from '@/store/hooks'

export function Connexion() {
  const navigate = useNavigate()
  const persona = usePersonaApp()

  const seConnecter = () => {
    void navigate(persona.charteAcceptee ? '/app' : '/app/charte')
  }

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex flex-1 flex-col gap-2xl px-2xl pt-2xl">
        <p className="mds-titre-carte text-marque-anthracite">MyDigitalSchool</p>
        <VisuelMateriel icone="Appareil photo" hauteur={300} />
        <div className="flex flex-col gap-md">
          <h1 className="mds-titre-page text-texte-principal">
            Emprunte le matériel de l’école en 30 secondes.
          </h1>
          <p className="mds-texte-corps text-texte-secondaire">
            Scanne, emprunte, rends le soir avec une photo.
          </p>
        </div>
      </div>

      <ZoneDAction>
        <BoutonPrincipalMobile
          libelle="Se connecter avec mon compte école"
          icone="École"
          onClick={seConnecter}
        />
        <p className="mds-texte-petit mt-md flex items-center justify-center gap-xs text-texte-tertiaire">
          <Icone nom="Cadenas" taille="xs" />
          Connexion sécurisée MyDigitalSchool
        </p>
      </ZoneDAction>
    </div>
  )
}
