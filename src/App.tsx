import { RouterProvider } from 'react-router'
import { PanneauDemo } from './demo/PanneauDemo'
import { Toast } from './demo/Toast'
import { routeur } from './routes'

export function App() {
  return (
    <>
      <RouterProvider router={routeur} />
      {/* Hors produit : le panneau de démo et le toast de résultat. */}
      <PanneauDemo />
      <Toast />
    </>
  )
}
