/**
 * Panneau de démo (hors produit, cf. `docs/03-ecrans.md` section C).
 *
 * Bouton flottant en bas à gauche, raccourci clavier « D ». Permet de changer de
 * persona, d'avancer l'horloge simulée, d'annuler la dernière action et de
 * réinitialiser la démo. Le toast de résultat vit dans `Toast.tsx`.
 */
import { useEffect, useState } from 'react'
import { horloge, selecteurs } from '@/domain'
import { Bouton, Icone } from '@/design-system'
import { useMDS } from '@/store/useMDS'

const PERSONAS_APP = ['ines', 'tom', 'lea', 'yanis', 'sarah', 'noah', 'diallo', 'roche'] as const
const UTILISATEURS_BO = ['lydia', 'cyrianne', 'sandrine'] as const

/**
 * En mode « Côte à côte », les deux surfaces vivent dans des cadres : le panneau
 * reste celui de la page parente, sinon il apparaîtrait trois fois.
 */
const dansUnCadre = () => typeof window !== 'undefined' && window.self !== window.top

export function PanneauDemo() {
  const [ouvert, setOuvert] = useState(false)
  const etat = useMDS((magasin) => magasin.etat)
  const personaApp = useMDS((magasin) => magasin.personaApp)
  const utilisateurBO = useMDS((magasin) => magasin.utilisateurBO)
  const choisirPersonaApp = useMDS((magasin) => magasin.choisirPersonaApp)
  const choisirUtilisateurBO = useMDS((magasin) => magasin.choisirUtilisateurBO)
  const executer = useMDS((magasin) => magasin.executer)
  const annuler = useMDS((magasin) => magasin.annuler)
  const reinitialiser = useMDS((magasin) => magasin.reinitialiser)
  const historique = useMDS((magasin) => magasin.historique.length)

  // Touche « D » pour ouvrir, ⌘Z / Ctrl+Z pour annuler.
  useEffect(() => {
    const surTouche = (evenement: KeyboardEvent) => {
      const cible = evenement.target as HTMLElement | null
      const dansUnChamp =
        cible?.tagName === 'INPUT' || cible?.tagName === 'TEXTAREA' || cible?.isContentEditable
      if (dansUnChamp) return

      if (evenement.key === 'd' || evenement.key === 'D') {
        setOuvert((precedent) => !precedent)
      }
      if ((evenement.metaKey || evenement.ctrlKey) && evenement.key === 'z') {
        evenement.preventDefault()
        annuler()
      }
    }
    window.addEventListener('keydown', surTouche)
    return () => window.removeEventListener('keydown', surTouche)
  }, [annuler])

  const maintenant = etat.horloge.maintenant
  const nom = (id: string) => selecteurs.prenom(selecteurs.personne(etat, id))

  if (dansUnCadre()) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setOuvert((precedent) => !precedent)}
        aria-expanded={ouvert}
        data-testid="bouton-demo"
        className="fixed bottom-[118px] left-lg z-50 inline-flex items-center gap-sm rounded-bouton bg-marque-anthracite px-lg py-md text-texte-inverse shadow-elevation min-[500px]:bottom-lg"
      >
        <Icone nom="Réglages" taille="lg" />
        <span className="mds-bouton-libelle">Démo</span>
        <span className="mds-mono-micro opacity-60">D</span>
      </button>

      {ouvert && (
        <aside
          data-testid="panneau-demo"
          aria-label="Panneau de démo"
          className="fixed bottom-[182px] left-lg z-50 flex max-h-[70dvh] w-[320px] min-[500px]:bottom-[76px] min-[500px]:max-h-[80dvh] flex-col gap-lg overflow-y-auto rounded-carte bg-surface-carte p-xl shadow-elevation ring-1 ring-trait-bordure"
        >
          <header className="flex items-start justify-between gap-md">
            <div className="flex flex-col">
              <p className="mds-titre-carte text-texte-principal">Démo</p>
              <p className="mds-mono-micro text-texte-tertiaire">
                {horloge.jourLongCapitalise(maintenant)} · {horloge.heure(maintenant)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOuvert(false)}
              aria-label="Fermer le panneau de démo"
              className="inline-flex size-[32px] items-center justify-center rounded-rond bg-surface-bouton-doux text-texte-principal"
            >
              <Icone nom="Croix" taille="lg" />
            </button>
          </header>

          <section className="flex flex-col gap-sm">
            <p className="mds-texte-petit-fort text-texte-tertiaire">Persona de l’app</p>
            <div className="flex flex-wrap gap-xs">
              {PERSONAS_APP.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => choisirPersonaApp(id)}
                  aria-pressed={personaApp === id}
                  className={[
                    'mds-texte-petit rounded-bouton px-md py-xs',
                    personaApp === id
                      ? 'bg-marque-anthracite text-texte-inverse'
                      : 'bg-surface-bouton-doux text-texte-principal',
                  ].join(' ')}
                >
                  {nom(id)}
                </button>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-sm">
            <p className="mds-texte-petit-fort text-texte-tertiaire">Utilisateur du back-office</p>
            <div className="flex flex-wrap gap-xs">
              {UTILISATEURS_BO.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => choisirUtilisateurBO(id)}
                  aria-pressed={utilisateurBO === id}
                  className={[
                    'mds-texte-petit rounded-bouton px-md py-xs',
                    utilisateurBO === id
                      ? 'bg-marque-anthracite text-texte-inverse'
                      : 'bg-surface-bouton-doux text-texte-principal',
                  ].join(' ')}
                >
                  {nom(id)}
                </button>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-sm">
            <p className="mds-texte-petit-fort text-texte-tertiaire">Horloge</p>
            <div className="flex flex-col gap-xs">
              <Bouton
                libelle="Aller à 16h30"
                type="Secondaire"
                icone="Horloge"
                onClick={() => executer({ type: 'ALLER_A_16H30' })}
              />
              <Bouton
                libelle="Fin de journée · 18h"
                type="Secondaire"
                icone="Lune"
                onClick={() => executer({ type: 'FIN_DE_JOURNEE' })}
              />
              <Bouton
                libelle="Lendemain · 8h"
                type="Secondaire"
                icone="École"
                onClick={() => executer({ type: 'LENDEMAIN' })}
              />
            </div>
          </section>

          <section className="flex flex-col gap-xs">
            <p className="mds-texte-petit-fort text-texte-tertiaire">Rejouer</p>
            <Bouton
              libelle={`Annuler${historique > 0 ? ` (${historique})` : ''}`}
              type="Secondaire"
              icone="Retour"
              disabled={historique === 0}
              onClick={() => annuler()}
            />
            <Bouton
              libelle="Réinitialiser la démo"
              type="Alerte"
              icone="Rotation"
              onClick={() => reinitialiser()}
            />
          </section>
        </aside>
      )}
    </>
  )
}
