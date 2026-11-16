/**
 * A1 · Connexion — `/app/connexion` — nœud Figma `91:711`.
 *
 * Point d'entrée de l'app : tant que personne n'est connecté, la coque amène ici.
 * On saisit son identifiant MDS (`prenom.nom`, ou l'adresse complète) ; l'accès est
 * refusé aux comptes de l'équipe, qui ont leur propre espace (R13).
 */
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { selecteurs } from '@/domain'
import { BoutonPrincipalMobile, Champ, Encart, Icone, VisuelMateriel, ZoneDAction } from '@/design-system'
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
    <form onSubmit={soumettre} className="flex min-h-full flex-col">
      <div className="flex flex-1 flex-col gap-xl px-2xl pt-2xl">
        <p className="mds-titre-carte text-marque-anthracite">MyDigitalSchool</p>
        <VisuelMateriel icone="Appareil photo" hauteur={200} />

        <div className="flex flex-col gap-sm">
          <h1 className="mds-titre-page text-texte-principal">
            Emprunte le matériel de l’école en 30 secondes.
          </h1>
          <p className="mds-texte-corps text-texte-secondaire">
            Scanne, emprunte, rends le soir avec une photo.
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
          libelle="Se connecter"
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
