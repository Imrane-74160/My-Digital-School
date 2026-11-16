/**
 * Coque commune du back-office (`docs/03-ecrans.md`, section B) — 1440 × 839.
 *
 * Barre d'en-tête en haut (logo MyDigitalSchool à gauche du titre de page), puis
 * le rail sombre du Menu principal sous l'en-tête et la zone de contenu à droite.
 * Sur le Tableau de bord : ni retour, ni fil d'Ariane.
 *
 * Sans session ouverte, la coque ne rend rien : elle renvoie vers B1 (R13).
 */
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router'
import { selecteurs } from '@/domain'
import { Avatar, BoutonIcone, EnTeteDePage, initialeDe, LienDeNavigation } from '@/design-system'
import { ECRANS_BO, ficheDuChemin } from './ecrans'
import { useSessionAdmin, useUtilisateurBO } from '@/store/hooks'
import { useMDS } from '@/store/useMDS'

export function CoqueBackOffice() {
  const session = useSessionAdmin()
  if (session === null) return <Navigate to="/admin/connexion" replace />
  return <BackOfficeConnecte />
}

function BackOfficeConnecte() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const utilisateur = useUtilisateurBO()
  const deconnecter = useMDS((magasin) => magasin.deconnecter)
  const fiche = ficheDuChemin(pathname)
  const tableauDeBord = fiche.chemin === ''

  return (
    <div className="flex min-h-dvh min-w-[1280px] flex-col">
      <EnTeteDePage
        titre={fiche.titre}
        {...(tableauDeBord ? {} : { retour: '/admin', filDAriane: ['Accueil', fiche.titre] })}
        compte={
          <span className="flex items-center gap-sm pl-sm">
            <Avatar
              initiale={initialeDe(utilisateur.nom)}
              taille={44}
              couleur={utilisateur.couleur}
              titre={utilisateur.nom}
            />
            <span className="flex flex-col">
              <span className="mds-texte-petit-fort text-texte-principal">{utilisateur.nom}</span>
              <span className="mds-texte-petit text-texte-tertiaire">
                {selecteurs.estDirection(utilisateur.role) ? 'Direction' : 'Équipe'}
              </span>
            </span>
            <BoutonIcone
              icone="Interdit"
              titre="Se déconnecter"
              onClick={() => {
                deconnecter('admin')
                void navigate('/admin/connexion', { replace: true })
              }}
            />
          </span>
        }
      />

      <div className="flex min-h-0 flex-1 gap-lg px-lg pb-lg">
        <nav
          data-testid="menu-principal"
          aria-label="Menu principal"
          className="flex w-[92px] shrink-0 flex-col items-center gap-sm self-start rounded-carte bg-marque-anthracite py-xl"
        >
          {ECRANS_BO.map(({ chemin, titre, icone }) => (
            <LienDeNavigation
              key={titre}
              icone={icone}
              libelle={titre}
              vers={chemin === '' ? '/admin' : `/admin/${chemin}`}
              actif={fiche.chemin === chemin}
            />
          ))}
        </nav>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
