/**
 * B1 · Se connecter — `/admin/connexion` — nœud Figma `14:950`.
 *
 * Hors de la coque commune : ni menu principal, ni en-tête de page. Une carte
 * blanche centrée sur le fond dégradé, le visuel d'étudiant à droite, le logo
 * dans la carte au-dessus du titre. Aucun champ : la connexion est déléguée au
 * compte choisi dans le panneau de démo.
 */
import { Link } from 'react-router'
import { Avatar, Bouton, Icone, initialeDe, VisuelMateriel } from '@/design-system'
import { useUtilisateurBO } from '@/store/hooks'

export function ConnexionBO() {
  const utilisateur = useUtilisateurBO()

  return (
    <main className="flex min-h-dvh items-center justify-center p-2xl">
      <section className="flex w-full max-w-[1040px] overflow-hidden rounded-carte bg-surface-carte ring-1 ring-trait-bordure">
        <div className="flex min-w-0 flex-1 flex-col gap-xl p-3xl">
          <p className="mds-texte-corps-fort text-marque-anthracite">MyDigitalSchool</p>

          <div className="flex flex-col gap-sm">
            <h1 className="mds-titre-page text-texte-principal">Bon retour parmi nous</h1>
            <p className="mds-texte-corps text-texte-secondaire">
              Connecte-toi avec ton compte MyDigitalSchool pour gérer les prêts
            </p>
          </div>

          <div className="flex items-center gap-md rounded-vignette bg-surface-champ px-lg py-md">
            <Avatar
              initiale={initialeDe(utilisateur.nom)}
              taille={44}
              couleur={utilisateur.couleur}
              titre={utilisateur.nom}
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <p className="mds-texte-corps-fort text-texte-principal">{utilisateur.nom}</p>
              <p className="mds-texte-petit text-texte-secondaire">{utilisateur.email ?? 'Compte MDS'}</p>
            </div>
          </div>

          <Link to="/admin" className="self-start">
            <Bouton libelle="Se connecter avec mon admin" taille="L" icone="Bouclier" />
          </Link>

          <p className="mds-texte-petit flex items-center gap-sm text-texte-tertiaire">
            <Icone nom="Cadenas" taille="sm" />
            Connexion sécurisée MyDigitalSchool
          </p>
        </div>

        <div className="w-[420px] shrink-0 self-stretch p-xl">
          <VisuelMateriel icone="Utilisateur" hauteur={420} className="h-full" />
        </div>
      </section>
    </main>
  )
}
