/**
 * A1 · Connexion — `/app/connexion` — nœud Figma `91:711`.
 *
 * Point d'entrée de l'app : tant que personne n'est connecté, la coque amène ici.
 * Logo, photo de la charte, accroche, puis la saisie de l'identifiant MDS
 * (`prenom.nom`, ou l'adresse complète). L'accès est refusé aux comptes de
 * l'équipe, qui ont leur propre espace (R13).
 */
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { selecteurs } from '@/domain'
import { BoutonPrincipalMobile, Champ, Encart, Icone, LogoMDS, ZoneDAction } from '@/design-system'
import photo from '@/assets/photo-connexion-app.jpg'
import { useEtat } from '@/store/hooks'
import { useMDS } from '@/store/useMDS'

export function Connexion() {
  const navigate = useNavigate()
  const etat = useEtat()
  const connecter = useMDS((magasin) => magasin.connecter)
  const [identifiant, setIdentifiant] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)

  const soumettre = (evenement: FormEvent) => {
    evenement.preventDefault()
    const resultat = connecter('app', identifiant)
    if (!resultat.ok || resultat.personne === undefined) {
      setErreur(resultat.msg)
      return
    }
    // Première connexion : la charte passe avant tout le reste (R03).
    const personne = selecteurs.personne(etat, resultat.personne)
    void navigate(personne.charteAcceptee === null ? '/app/charte' : '/app')
  }

  return (
    <form onSubmit={soumettre} className="flex h-full flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-md px-2xl pt-md">
        <LogoMDS hauteur={38} className="self-start" />

        {/* Photo de la charte, cadrée sur les deux étudiants comme dans le Figma. */}
        {/* Hauteur élastique : sur un téléphone réel, l'écran utile est plus court que
            la maquette, et une photo figée pousserait le bouton hors de l'écran. */}
        <img
          src={photo}
          alt="Deux étudiants avec un appareil photo et l’app ouverte sur un téléphone"
          className="max-h-[380px] min-h-[150px] w-full flex-1 rounded-carte-mobile object-cover object-[center_40%]"
        />

        <div className="flex flex-col gap-xs">
          <h1 className="mds-titre-ecran-mobile text-texte-principal">
            Emprunte le matériel de l’école en 30 secondes.
          </h1>
          <p className="mds-texte-petit text-texte-secondaire">
            Studio, PC, casques, jeux… Scanne, emprunte, rends le soir avec une photo.
          </p>
        </div>

        <label className="flex flex-col gap-sm">
          <span className="mds-texte-petit-fort text-texte-secondaire">Identifiant MDS</span>
          <Champ
            etiquette="Identifiant MDS"
            valeur={identifiant}
            onChange={(valeur) => {
              setIdentifiant(valeur)
              setErreur(null)
            }}
            placeholder="prenom.nom"
            icone="Utilisateur"
            pleineLargeur
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
          />
        </label>

        {erreur !== null && (
          <Encart icone="Alerte" ton="rose">
            {erreur}
          </Encart>
        )}
      </div>

      <ZoneDAction>
        <BoutonPrincipalMobile
          libelle="Se connecter avec mon compte école"
          icone="École"
          soumet
          disabled={identifiant.trim() === ''}
        />
        <p className="mds-texte-petit mt-md flex items-center justify-center gap-xs text-texte-tertiaire">
          <Icone nom="Cadenas" taille="xs" />
          Connexion sécurisée MyDigitalSchool
        </p>
      </ZoneDAction>
    </form>
  )
}
