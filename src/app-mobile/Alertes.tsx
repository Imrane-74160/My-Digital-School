/**
 * A9 · Alertes — `/app/alertes` — nœud Figma `93:809`.
 *
 * Onglets Notifications / Historique. Les notifications sont groupées par jour, chaque
 * titre de groupe portant son propre compteur. Ouvrir l'écran marque tout comme lu.
 */
import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { horloge, selecteurs, type Notification } from '@/domain'
import {
  BadgeDeStatut,
  EnTeteEcranMobile,
  EtatVide,
  LigneDeNotification,
  Onglets,
  Pictogramme,
  TitreDeSection,
} from '@/design-system'
import { iconeDe, teinteDe } from './aides'
import { useEtat, usePersonaApp } from '@/store/hooks'
import { useMDS } from '@/store/useMDS'
import type { NomIcone } from '@/design-system'

export function Alertes() {
  const [parametres, setParametres] = useSearchParams()
  const onglet = parametres.get('onglet') === 'historique' ? 'historique' : 'notifications'
  const etat = useEtat()
  const persona = usePersonaApp()
  const marquerLues = useMDS((magasin) => magasin.marquerNotificationsLues)

  const miennes = useMemo(
    () => etat.notifications.filter((notification) => notification.pour.includes(persona.id)),
    [etat.notifications, persona.id],
  )
  const nonLues = miennes.filter((notification) => !notification.lue).length

  // Ouvrir l'écran marque tout comme lu.
  useEffect(() => {
    if (onglet === 'notifications' && nonLues > 0) marquerLues(persona.id)
  }, [onglet, nonLues, marquerLues, persona.id])

  const groupes = useMemo(() => {
    const parJour = new Map<string, Notification[]>()
    for (const notification of miennes) {
      const jour = horloge.jourDe(notification.le)
      parJour.set(jour, [...(parJour.get(jour) ?? []), notification])
    }
    return [...parJour.entries()].sort((a, b) => b[0].localeCompare(a[0]))
  }, [miennes])

  const historique = selecteurs.historiqueDe(etat, persona.id)

  return (
    <div className="flex flex-col gap-md pb-lg">
      <EnTeteEcranMobile titre="Alertes" sousTitre="Rappels, validations et retours" />

      <div className="px-lg">
        <Onglets
          etiquette="Alertes"
          pleineLargeur
          actif={onglet}
          onChange={(cle) => setParametres(cle === 'historique' ? { onglet: 'historique' } : {})}
          onglets={[
            { cle: 'notifications', libelle: 'Notifications', compteur: miennes.length },
            { cle: 'historique', libelle: 'Historique', compteur: historique.length },
          ]}
        />
      </div>

      {onglet === 'notifications' ? (
        miennes.length === 0 ? (
          <EtatVide icone="Cloche" titre="Aucune alerte" detail="Tout est à jour." />
        ) : (
          groupes.map(([jour, liste]) => (
            <section key={jour}>
              <TitreDeSection
                titre={
                  horloge.jourRelatif(`${jour}T12:00`, etat.horloge.maintenant) === "aujourd'hui"
                    ? 'Aujourd’hui'
                    : horloge.jourRelatif(`${jour}T12:00`, etat.horloge.maintenant) === 'hier'
                      ? 'Hier'
                      : horloge.jourLong(jour)
                }
                compteur={liste.length}
              />
              <div className="flex flex-col gap-sm px-lg">
                {liste.map((notification) => (
                  <LigneDeNotification
                    key={notification.id}
                    icone={notification.icone as NomIcone}
                    texte={notification.texte}
                    heure={horloge.heure(notification.le)}
                    {...(notification.regle === undefined ? {} : { regle: notification.regle })}
                    lue={notification.lue}
                  />
                ))}
              </div>
            </section>
          ))
        )
      ) : historique.length === 0 ? (
        <EtatVide icone="Historique" titre="Aucun prêt passé" />
      ) : (
        <div className="flex flex-col gap-sm px-lg">
          {historique.map((pret) => {
            const materiel = selecteurs.materiel(etat, pret.materiel)
            return (
              <article
                key={pret.id}
                className="flex items-center gap-md rounded-carte-mobile bg-surface-carte p-md"
              >
                <Pictogramme icone={iconeDe(materiel)} teinte={teinteDe(materiel)} taille={40} />
                <div className="flex min-w-0 flex-1 flex-col gap-xs">
                  <p className="mds-texte-corps-fort truncate text-texte-principal">{materiel.nom}</p>
                  <p className="mds-texte-petit text-texte-secondaire">
                    {horloge.jourLong(pret.renduLe ?? pret.sortiLe ?? etat.horloge.maintenant)}
                    {pret.pourClasse && ` · pour la ${pret.pourClasse}`}
                  </p>
                </div>
                <BadgeDeStatut
                  statut={pret.statut === 'perdu' ? 'Incident' : pret.statut === 'annule' ? 'Retiré' : 'Payé'}
                  libelle={pret.statut === 'perdu' ? 'Perdu' : pret.statut === 'annule' ? 'Annulé' : 'Rendu'}
                />
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
