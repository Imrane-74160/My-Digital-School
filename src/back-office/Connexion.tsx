/**
 * B1 · Se connecter — `/admin/connexion` — nœud Figma `14:950`.
 *
 * Hors de la coque commune : ni menu principal, ni en-tête de page. La photo de la
 * charte occupe tout l'écran, et la carte blanche est centrée dessus, logo en haut.
 * L'accès est réservé à l'équipe pédagogique et à la direction (R13).
 */
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { Bouton, Champ, Encart, Icone, LogoMDS } from '@/design-system'
import photo from '@/assets/photo-connexion-admin.jpg'
import { useMDS } from '@/store/useMDS'

export function ConnexionBO() {
  const navigate = useNavigate()
  const connecter = useMDS((magasin) => magasin.connecter)
  const [identifiant, setIdentifiant] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)

  const soumettre = (evenement: FormEvent) => {
    evenement.preventDefault()
    const resultat = connecter('admin', identifiant)
    if (!resultat.ok) {
      setErreur(resultat.msg)
      return
    }
    void navigate('/admin')
  }

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden p-2xl">
      <img src={photo} alt="" aria-hidden className="absolute inset-0 size-full object-cover" />

      <form
        onSubmit={soumettre}
        className="relative flex w-full max-w-[520px] flex-col items-center gap-lg rounded-carte bg-surface-carte p-3xl shadow-elevation"
      >
        <LogoMDS hauteur={52} />

        <div className="flex flex-col items-center gap-xs text-center">
          <h1 className="mds-titre-page text-texte-principal">Bon retour parmi nous</h1>
          <p className="mds-texte-petit text-texte-secondaire">
            Connecte-toi avec ton compte MyDigitalSchool pour gérer les prêts
          </p>
        </div>

        <label className="flex w-full flex-col gap-sm">
          <span className="mds-texte-petit-fort text-texte-secondaire">Identifiant MDS</span>
          <Champ
            etiquette="Identifiant MDS"
            valeur={identifiant}
            onChange={(valeur) => {
              setIdentifiant(valeur)
              setErreur(null)
            }}
            placeholder="prenom"
            icone="Utilisateur"
            pleineLargeur
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
          />
        </label>

        {erreur !== null && (
          <Encart icone="Alerte" ton="rose" className="w-full">
            {erreur}
          </Encart>
        )}

        <Bouton
          libelle="Se connecter avec mon admin"
          taille="L"
          icone="Bouclier"
          soumet
          pleineLargeur
          disabled={identifiant.trim() === ''}
        />

        <p className="mds-texte-petit flex items-center gap-sm text-texte-tertiaire">
          <Icone nom="Cadenas" taille="sm" />
          Connexion sécurisée MyDigitalSchool
        </p>
      </form>
    </main>
  )
}
