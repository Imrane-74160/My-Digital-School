/**
 * A2 · Charte — `/app/charte` — nœud Figma `91:838`.
 *
 * Les 7 articles de `reglages.charte`, rendus en numéro, titre court et texte long.
 * La case est obligatoire avant « Continuer » (R03). Depuis le Profil, le même écran
 * s'ouvre en lecture seule, sans case ni bouton.
 */
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { BoutonPrincipalMobile, CaseACocher, EnTeteEcranMobile, ZoneDAction } from '@/design-system'
import { useEtat, usePersonaApp } from '@/store/hooks'
import { useMDS } from '@/store/useMDS'

export function Charte() {
  const navigate = useNavigate()
  const [parametres] = useSearchParams()
  const lectureSeule = parametres.get('lecture') === '1'
  const etat = useEtat()
  const persona = usePersonaApp()
  const executer = useMDS((magasin) => magasin.executer)
  const [acceptee, setAcceptee] = useState(false)

  const { charte } = etat.reglages

  const continuer = () => {
    const resultat = executer({ type: 'ACCEPTER_CHARTE', par: persona.id })
    if (resultat.ok) void navigate('/app')
  }

  return (
    <div className="flex min-h-full flex-col">
      {lectureSeule ? (
        <EnTeteEcranMobile titre="La charte" sousTitre={charte.titre} retour="/app/profil" />
      ) : (
        <EnTeteEcranMobile titre="La charte" sousTitre="À lire une fois, avant ton premier emprunt." />
      )}

      <div className="flex-1 overflow-y-auto px-lg pb-lg">
        <div className="flex flex-col gap-lg rounded-carte-mobile bg-surface-carte p-lg">
          {charte.articles.map((article, index) => (
            <article key={article.id} className="flex gap-md">
              <span className="mds-mono-micro inline-flex size-[22px] shrink-0 items-center justify-center rounded-rond bg-surface-champ text-texte-secondaire">
                {index + 1}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-xs">
                <p className="mds-texte-petit-fort text-texte-principal">{article.titre}</p>
                <p className="mds-texte-corps text-texte-secondaire">{article.texte}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      {!lectureSeule && (
        <ZoneDAction>
          <div className="mb-md">
            <CaseACocher
              cochee={acceptee}
              onChange={setAcceptee}
              pleineLargeur
              libelle="J’ai lu la charte et j’accepte ses conditions."
            />
          </div>
          <BoutonPrincipalMobile libelle="Continuer" icone="Coche" disabled={!acceptee} onClick={continuer} />
        </ZoneDAction>
      )}
    </div>
  )
}
