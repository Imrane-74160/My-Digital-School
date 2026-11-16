/**
 * B1 · Se connecter — `/admin/connexion` — nœud Figma `14:950`.
 *
 * Hors de la coque commune : ni menu principal, ni en-tête de page. Une carte blanche
 * centrée sur le fond dégradé, le visuel à droite, le logo dans la carte au-dessus du
 * titre. L'accès est réservé à l'équipe pédagogique et à la direction (R13).
 */
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { Bouton, Champ, Encart, Icone, VisuelMateriel } from '@/design-system'
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
    <main className="flex min-h-dvh items-center justify-center p-2xl">
      <section className="flex w-full max-w-[1040px] overflow-hidden rounded-carte bg-surface-carte ring-1 ring-trait-bordure">
        <form onSubmit={soumettre} className="flex min-w-0 flex-1 flex-col gap-xl p-3xl">
          <p className="mds-texte-corps-fort text-marque-anthracite">MyDigitalSchool</p>

          <div className="flex flex-col gap-sm">
            <h1 className="mds-titre-page text-texte-principal">Bon retour parmi nous</h1>
            <p className="mds-texte-corps text-texte-secondaire">
              Connecte-toi avec ton compte MyDigitalSchool pour gérer les prêts
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
              placeholder="prenom"
              icone="Utilisateur"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
            />
          </label>

          {erreur !== null && (
            <Encart icone="Alerte" ton="rose" className="max-w-[420px]">
              {erreur}
            </Encart>
          )}

          <span className="self-start">
            <Bouton
              libelle="Se connecter"
              taille="L"
              icone="Bouclier"
              soumet
              disabled={identifiant.trim() === ''}
            />
          </span>

          <p className="mds-texte-petit flex items-center gap-sm text-texte-tertiaire">
            <Icone nom="Cadenas" taille="sm" />
            Connexion sécurisée MyDigitalSchool
          </p>
        </form>

        <div className="w-[420px] shrink-0 self-stretch p-xl">
          <VisuelMateriel icone="Utilisateur" hauteur={420} className="h-full" />
        </div>
      </section>
    </main>
  )
}
