/**
 * État de l'application : le domaine, plus ce qui relève de la démo (persona courante,
 * pile d'annulation, dernier résultat pour le toast).
 *
 * La persistance vit dans `localStorage` sous une clé qui **inclut la version du seed** :
 * incrémenter `meta.version` dans `data/seed.json` réinitialise donc automatiquement la
 * démo chez tout le monde, au lieu de laisser traîner un état incompatible.
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Action, CodeRegle, EtatMDS, Notification, PersonneId, Resultat } from '@/domain'
import { chargerSeed, dispatch, PERSONA_PAR_DEFAUT, VERSION_SEED } from '@/domain'

/** Clé de persistance : change avec la version du seed. */
export const CLE_PERSISTANCE = `prets-mds/v${VERSION_SEED}`

/** Profondeur de la pile d'annulation : assez pour rejouer un parcours, sans gonfler le stockage. */
const PROFONDEUR_HISTORIQUE = 25

/** Résultat de la dernière action, sans l'état : c'est ce qu'affiche le toast de démo. */
export type DernierResultat = {
  ok: boolean
  msg: string
  regle: CodeRegle | null
  notifications: Notification[]
}

type Magasin = {
  etat: EtatMDS
  /** Persona connectée dans l'app mobile. */
  personaApp: PersonneId
  /** Utilisateur connecté au back-office. */
  utilisateurBO: PersonneId
  dernierResultat: DernierResultat | null
  /** États précédents, du plus récent au plus ancien. Non persisté. */
  historique: EtatMDS[]

  /** Joue une action du domaine et met à jour le toast. Un refus ne change pas l'état. */
  executer: (action: Action) => Resultat
  /** Annule la dernière action réussie (⌘Z), changements d'horloge compris. */
  annuler: () => boolean
  peutAnnuler: () => boolean
  /** Recharge `data/seed.json` : « Réinitialiser la démo ». */
  reinitialiser: () => void
  choisirPersonaApp: (id: PersonneId) => void
  choisirUtilisateurBO: (id: PersonneId) => void
  effacerResultat: () => void
  /** Ouvrir l'écran Alertes marque comme lues les notifications de la personne. */
  marquerNotificationsLues: (id: PersonneId) => void
}

const depart = () => ({
  etat: chargerSeed(),
  personaApp: PERSONA_PAR_DEFAUT.app as PersonneId,
  utilisateurBO: PERSONA_PAR_DEFAUT.backOffice as PersonneId,
  dernierResultat: null,
  historique: [] as EtatMDS[],
})

export const useMDS = create<Magasin>()(
  persist(
    (set, get) => ({
      ...depart(),

      executer: (action) => {
        const avant = get().etat
        const resultat = dispatch(avant, action)
        const dernierResultat: DernierResultat = {
          ok: resultat.ok,
          msg: resultat.msg,
          regle: resultat.regle,
          notifications: resultat.notifications,
        }

        if (!resultat.ok) {
          // Un refus n'entre pas dans l'historique : il n'y a rien à annuler.
          set({ dernierResultat })
          return resultat
        }

        set({
          etat: resultat.etat,
          dernierResultat,
          historique: [avant, ...get().historique].slice(0, PROFONDEUR_HISTORIQUE),
        })
        return resultat
      },

      annuler: () => {
        const [precedent, ...reste] = get().historique
        if (!precedent) return false
        set({
          etat: precedent,
          historique: reste,
          dernierResultat: { ok: true, msg: 'Dernière action annulée.', regle: null, notifications: [] },
        })
        return true
      },

      peutAnnuler: () => get().historique.length > 0,

      reinitialiser: () => set(depart()),

      choisirPersonaApp: (id) => set({ personaApp: id }),
      choisirUtilisateurBO: (id) => set({ utilisateurBO: id }),
      effacerResultat: () => set({ dernierResultat: null }),

      marquerNotificationsLues: (id) => {
        const { etat } = get()
        if (!etat.notifications.some((n) => n.pour.includes(id) && !n.lue)) return
        // Marquer comme lu n'est pas une action métier : pas d'entrée dans l'historique.
        set({
          etat: {
            ...etat,
            notifications: etat.notifications.map((notification) =>
              notification.pour.includes(id) ? { ...notification, lue: true } : notification,
            ),
          },
        })
      },
    }),
    {
      name: CLE_PERSISTANCE,
      storage: createJSONStorage(() => localStorage),
      // L'historique et le toast ne survivent pas à un rechargement : ils n'ont pas de sens hors session.
      partialize: ({ etat, personaApp, utilisateurBO }) => ({ etat, personaApp, utilisateurBO }),
    },
  ),
)
