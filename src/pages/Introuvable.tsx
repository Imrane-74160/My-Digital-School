import { Link } from 'react-router'

export function Introuvable() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[520px] flex-col justify-center gap-lg p-2xl">
      <h1 className="mds-titre-page text-texte-principal">Page introuvable</h1>
      <p className="mds-texte-corps text-texte-secondaire">
        Cette adresse ne correspond à aucun écran du prototype.
      </p>
      <Link className="mds-bouton-libelle text-marque-turquoise-fonce underline" to="/">
        Revenir à l’accueil de la démo
      </Link>
    </main>
  )
}
