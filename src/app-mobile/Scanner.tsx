/**
 * A7 · Scanner — `/app/scanner` — nœud Figma `92:757`.
 *
 * Plein écran, sans barre de navigation. Viseur animé, puis la feuille « À proximité » :
 * d'abord les prêts ouverts de la persona, puis les matériels disponibles du bureau
 * pour compléter, 3 lignes au maximum (arbitrage E3).
 */
import { horloge, selecteurs } from '@/domain'
import { EnTeteEcranMobile, Icone, MaterielDetecte } from '@/design-system'
import { iconeDe, teinteDe } from './aides'
import { useEtat, usePersonaApp } from '@/store/hooks'

const MAXIMUM_LIGNES = 3

export function Scanner() {
  const etat = useEtat()
  const persona = usePersonaApp()

  const ouverts = selecteurs.pretsEnCoursDe(etat, persona.id).map((pret) => {
    const materiel = selecteurs.materiel(etat, pret.materiel)
    const chezToi = pret.statut === 'actif'
    return {
      materiel,
      statut: chezToi ? ('En cours' as const) : ('À valider' as const),
      libelle: chezToi ? 'Chez toi' : pret.statut === 'remise_a_valider' ? 'Demandé' : 'Vérification',
      vers: chezToi ? `/app/rendre/${materiel.id}` : `/app/materiel/${materiel.id}`,
    }
  })

  const duBureau = etat.materiels
    .filter((materiel) => materiel.statut === 'disponible' && materiel.lieu.includes('Bureau'))
    .filter((materiel) => !ouverts.some((ligne) => ligne.materiel.id === materiel.id))
    .slice(0, Math.max(0, MAXIMUM_LIGNES - ouverts.length))
    .map((materiel) => ({
      materiel,
      statut: 'Disponible' as const,
      libelle: 'Disponible',
      vers: `/app/materiel/${materiel.id}`,
    }))

  const lignes = [...ouverts, ...duBureau].slice(0, MAXIMUM_LIGNES)

  return (
    <div className="flex min-h-full flex-col">
      <EnTeteEcranMobile titre="Scanner" fermer="/app" />

      <div className="flex flex-1 items-center justify-center px-lg">
        <div className="relative flex size-[240px] items-center justify-center">
          {/* Quatre coins et la ligne de lecture, comme le viseur du Figma. */}
          {(
            [
              'top-0 left-0 border-t-2 border-l-2 rounded-tl-vignette',
              'top-0 right-0 border-t-2 border-r-2 rounded-tr-vignette',
              'bottom-0 left-0 border-b-2 border-l-2 rounded-bl-vignette',
              'bottom-0 right-0 border-b-2 border-r-2 rounded-br-vignette',
            ] as const
          ).map((coin) => (
            <span key={coin} aria-hidden className={`absolute size-[26px] border-marque-turquoise ${coin}`} />
          ))}
          <span
            aria-hidden
            className="size-[120px] rounded-vignette bg-surface-carte/70"
            style={{
              backgroundImage:
                'repeating-conic-gradient(var(--mds-texte-principal) 0% 25%, var(--mds-surface-carte) 0% 50%)',
              backgroundSize: '14px 14px',
              filter: 'blur(1px)',
            }}
          />
          <span
            aria-hidden
            data-testid="ligne-de-lecture"
            className="absolute left-[20px] h-[2px] w-[200px] bg-marque-turquoise"
            style={{ animation: 'lecture 2.4s var(--mds-easing-sortie) infinite' }}
          />
        </div>
      </div>

      <p className="mds-texte-corps flex items-center justify-center gap-sm px-2xl pb-xl text-center text-texte-secondaire">
        <Icone nom="Scanner" taille="md" />
        Approche le QR collé sur le matériel.
      </p>

      <section className="rounded-t-carte bg-surface-champ p-lg">
        <span aria-hidden className="mx-auto mb-md block h-[5px] w-[40px] rounded-rond bg-trait-grille" />
        <div className="mb-md flex items-baseline justify-between">
          <h2 className="mds-texte-corps-fort text-texte-principal">QR détectés à proximité</h2>
          <span className="mds-mono-code text-texte-tertiaire">{lignes.length}</span>
        </div>
        <div className="flex flex-col gap-sm">
          {lignes.map(({ materiel, statut, libelle, vers }) => (
            <MaterielDetecte
              key={materiel.id}
              icone={iconeDe(materiel)}
              teinte={teinteDe(materiel)}
              nom={materiel.nom}
              statut={statut}
              libelleStatut={libelle}
              vers={vers}
            />
          ))}
        </div>
        <p className="mds-mono-micro mt-md text-center text-texte-tertiaire">
          {horloge.heure(etat.horloge.maintenant)} · scanner simulé
        </p>
      </section>
    </div>
  )
}
