/**
 * État de l'application : le domaine, les deux sessions ouvertes, et le dernier
 * résultat d'action (affiché en bandeau).
 *
 * Deux sessions indépendantes, une par surface — comme une messagerie et sa console
 * d'administration : on peut être connecté en tant qu'élève sur `/app` et en tant que
 * membre de l'équipe sur `/admin` dans le même navigateur, sans que l'une voie l'autre.
 *
 * La persistance vit dans `localStorage` sous une clé qui **inclut la version du seed** :
 * incrémenter `meta.version` dans `data/seed.json` repart donc d'un état propre, au lieu
 * de laisser traîner un état incompatible.
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Action, CodeRegle, EtatMDS, Notification, PersonneId, Resultat } from '@/domain'
import { chargerSeed, dispatch, horloge, recalerSur, selecteurs, VERSION_SEED } from '@/domain'
import { maintenantReel } from './horlogeReelle'

/** Clé de persistance : change avec la version du seed. */
export const CLE_PERSISTANCE = `prets-mds/v${VERSION_SEED}`

/** Domaine des adresses de l'école, ajouté quand on ne saisit que l'identifiant. */
const DOMAINE = '@my-digital-school.org'

/** Les deux espaces de l'application, chacun avec sa session. */
export type Surface = 'app' | 'admin'

/** Résultat de la dernière action, sans l'état : c'est ce qu'affiche le bandeau. */
export type DernierResultat = {
  ok: boolean
  msg: string
  regle: CodeRegle | null
  notifications: Notification[]
}

export type Connexion = {
  ok: boolean
  msg: string
  /** La personne connectée, quand ça a marché : l'écran sait s'il doit passer par la charte. */
  personne?: PersonneId
}

type Magasin = {
  etat: EtatMDS
  /** Personne connectée à l'app. `null` : l'écran de connexion prend la main. */
  sessionApp: PersonneId | null
  /** Personne connectée au back-office. */
  sessionAdmin: PersonneId | null
  dernierResultat: DernierResultat | null

  /** Joue une action du domaine. Un refus ne change pas l'état. */
  executer: (action: Action) => Resultat
  /** Connecte une personne à une surface, si son rôle y donne accès. */
  connecter: (surface: Surface, identifiant: string) => Connexion
  deconnecter: (surface: Surface) => void
  effacerResultat: () => void
  /** Ouvrir l'écran Alertes marque comme lues les notifications de la personne. */
  marquerNotificationsLues: (id: PersonneId) => void
  /**
   * Cale l'horloge du domaine sur l'heure de la machine et applique les échéances
   * franchies depuis la dernière visite : rappel de 16h30, fin de journée à 18h,
   * ouverture du lendemain à 8h (R10, R11, R15, R16).
   */
  synchroniser: () => void
  /** Repart du jeu de données initial. Hors interface : filet de secours. */
  reinitialiser: () => void
}

/** L'état de départ : le seed, recalé sur la date du jour. */
const depart = () => ({
  etat: recalerSur(chargerSeed(), maintenantReel()),
  sessionApp: null,
  sessionAdmin: null,
  dernierResultat: null,
})

/** Les rôles admis sur chaque surface (R13). */
const ROLES_ADMIS: Record<Surface, readonly string[]> = {
  app: ['eleve', 'intervenant'],
  admin: ['equipe', 'direction'],
}

const REFUS_DE_SURFACE: Record<Surface, string> = {
  app: 'Cet espace est réservé aux élèves et aux intervenants. L’équipe se connecte sur l’espace de gestion.',
  admin: 'Cet espace est réservé à l’équipe pédagogique et à la direction.',
}

/** « Ines.Martin » comme « ines.martin@my-digital-school.org » mènent au même compte. */
const normaliser = (identifiant: string): string => {
  const propre = identifiant.trim().toLowerCase()
  return propre.includes('@') ? propre : `${propre}${DOMAINE}`
}

/**
 * Au plus deux semaines d'échéances rattrapées d'un coup : au-delà, la situation de
 * départ n'a plus de sens et on se contente de remettre l'horloge à l'heure.
 */
const MAX_ECHEANCES = 3 * 7

export const useMDS = create<Magasin>()(
  persist(
    (set, get) => ({
      ...depart(),

      executer: (action) => {
        const resultat = dispatch(get().etat, action)
        const dernierResultat: DernierResultat = {
          ok: resultat.ok,
          msg: resultat.msg,
          regle: resultat.regle,
          notifications: resultat.notifications,
        }
        // Un refus laisse l'état intact : il n'y a que le message à afficher.
        set(resultat.ok ? { etat: resultat.etat, dernierResultat } : { dernierResultat })
        return resultat
      },

      connecter: (surface, identifiant) => {
        const adresse = normaliser(identifiant)
        const personne = get().etat.personnes.find((p) => p.email?.toLowerCase() === adresse)

        if (!personne) {
          return { ok: false, msg: 'Aucun compte ne correspond à cet identifiant.' }
        }
        if (!ROLES_ADMIS[surface].includes(personne.role)) {
          return { ok: false, msg: REFUS_DE_SURFACE[surface] }
        }

        set(surface === 'app' ? { sessionApp: personne.id } : { sessionAdmin: personne.id })
        return { ok: true, msg: `Bonjour ${selecteurs.prenom(personne)}.`, personne: personne.id }
      },

      deconnecter: (surface) => set(surface === 'app' ? { sessionApp: null } : { sessionAdmin: null }),

      effacerResultat: () => set({ dernierResultat: null }),

      marquerNotificationsLues: (id) => {
        const { etat } = get()
        if (!etat.notifications.some((n) => n.pour.includes(id) && !n.lue)) return
        // Marquer comme lu n'est pas une action métier : pas de message de résultat.
        set({
          etat: {
            ...etat,
            notifications: etat.notifications.map((notification) =>
              notification.pour.includes(id) ? { ...notification, lue: true } : notification,
            ),
          },
        })
      },

      synchroniser: () => {
        const reel = maintenantReel()
        let etat = get().etat
        if (!horloge.apres(reel, etat.horloge.maintenant)) return

        // Les échéances se rattrapent dans l'ordre : 16h30, puis 18h, puis 8h le lendemain.
        for (let garde = 0; garde < MAX_ECHEANCES; garde += 1) {
          const maintenant = etat.horloge.maintenant
          const rappel = horloge.aHeure(maintenant, etat.horloge.rappel)
          const fermeture = horloge.fermetureDuJour(etat.horloge)
          const ouverture = horloge.ouvertureDuLendemain(etat.horloge)

          const echeance =
            horloge.avant(maintenant, rappel) && !horloge.apres(rappel, reel)
              ? ('ALLER_A_16H30' as const)
              : horloge.avant(maintenant, fermeture) && !horloge.apres(fermeture, reel)
                ? ('FIN_DE_JOURNEE' as const)
                : !horloge.apres(ouverture, reel)
                  ? ('LENDEMAIN' as const)
                  : null
          if (echeance === null) break

          const resultat = dispatch(etat, { type: echeance })
          // Un refus signifierait que l'échéance est déjà passée : on ne boucle pas dessus.
          if (!resultat.ok) break
          etat = resultat.etat
        }

        // Ces échéances sont des événements de fond : elles n'affichent pas de bandeau.
        set({ etat: { ...etat, horloge: { ...etat.horloge, maintenant: reel } } })
      },

      reinitialiser: () => set(depart()),
    }),
    {
      name: CLE_PERSISTANCE,
      storage: createJSONStorage(() => localStorage),
      // Le dernier message ne survit pas à un rechargement : il n'a de sens que sur le moment.
      partialize: ({ etat, sessionApp, sessionAdmin }) => ({ etat, sessionApp, sessionAdmin }),
    },
  ),
)
