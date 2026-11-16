import { useEffect } from 'react'
import { RouterProvider } from 'react-router'
import { Bandeau } from './ui/Bandeau'
import { routeur } from './routes'
import { useMDS } from './store/useMDS'

/** Fréquence de synchronisation de l'horloge : assez fin pour les échéances à la minute. */
const PAS_DE_L_HORLOGE = 30_000

export function App() {
  const synchroniser = useMDS((magasin) => magasin.synchroniser)

  // L'horloge du domaine suit celle de la machine, et les échéances franchies s'appliquent
  // seules : rappel de 16h30, fin de journée à 18h, ouverture du lendemain (R10, R11, R15).
  useEffect(() => {
    synchroniser()
    const minuteur = setInterval(synchroniser, PAS_DE_L_HORLOGE)
    const auReveil = () => synchroniser()
    window.addEventListener('focus', auReveil)
    return () => {
      clearInterval(minuteur)
      window.removeEventListener('focus', auReveil)
    }
  }, [synchroniser])

  return (
    <>
      <RouterProvider router={routeur} />
      <Bandeau />
    </>
  )
}
