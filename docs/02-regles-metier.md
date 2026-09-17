# 02 · Règles métier

Validées en ateliers avec l'équipe (6 rounds). Le moteur de référence `reference/engine-prototype.js` les implémente déjà : porter sa logique en TypeScript dans `src/domain/`, avec un test Vitest par règle.

## Les 16 règles
| Code | Clé | Règle | Où elle se voit |
|---|---|---|---|
| R01 | bureau | On emprunte seulement quand le bureau est ouvert (8h–18h). | App : bouton « Bureau fermé » le soir |
| R02 | dispo | Pas de réservation : premier arrivé, premier servi. | Catalogue : Disponible / Indisponible |
| R03 | forfait | Forfait affiché et accepté (case à cocher) avant chaque emprunt. Charte acceptée une fois à la 1re connexion. | Feuille Emprunter, écran Charte |
| R04 | n1 | Niveau 1 : remise **et** retour validés sur place par l'équipe. | BO Validations sur place |
| R05 | n2 | Niveau 2 : retour avec photo, contrôle plus tard. | App Rendre, BO Contrôle photo |
| R06 | reemprunt | N2 : le matériel peut repartir avant le contrôle ; la photo protège le nouvel emprunteur. | Badge « Réemprunté par … » |
| R07 | composant | Composant manquant : on doit le forfait du composant, pas celui du kit. | Puces composants, Forfait par composant |
| R08 | retour | Seul le responsable du prêt fait le retour. | Refus si un autre tente de rendre |
| R09 | classe | « Pour ma classe » réservé aux intervenants, qui restent responsables. Boîtes intervenant réservées aux intervenants. | Feuille Emprunter (intervenant), Prêts de classe |
| R10 | blocage | Non rendu à 18h le jour même : emprunts bloqués. | App Accueil bloqué, BO Emprunteurs, KPI |
| R11 | perte | Toujours absent à J+2 à 18h : déclaré perdu, forfait dû. | Carte « Prêts en retard », incident perte |
| R12 | argent | Forfaits, ajustements (baisse seulement) et paiements : réservés à Sandrine. | Mention « Réservé à Sandrine » + refus pour Lydia/Cyrianne |
| R13 | equipe | Valider, contrôler, gérer matériel / salles / stocks / imports / réglages : réservé à l'équipe. | Tout le back-office |
| R14 | prevenez | « Me prévenir » : tous les inscrits sont prévenus au retour, le premier qui scanne le prend. | Bouton Me prévenir, notification |
| R15 | temps | Rappel push à 16h30 aux emprunteurs, récap e-mail à 8h pour l'équipe (activables dans Réglages). | Alertes, carte Récap de 8h |
| R16 | deblocage | L'équipe peut débloquer une personne pour la journée uniquement. | Bouton « Débloquer pour aujourd'hui » |

## Statuts
**Matériel** : `disponible` · `remise_a_valider` · `emprunte` · `retour_a_valider` · `anomalie` (retiré du prêt suite à incident) · `hors_service` (retiré manuellement) · `perdu`
**Prêt** : `remise_a_valider` → `actif` → (`retour_a_valider` si N1) → `rendu` ; ou `perdu` ; ou `annule` (remise non validée à la fin de journée)
**Photo de retour (N2)** : `a_controler` → `conforme` | `probleme` (crée un incident)
**Incident** : `a_rembourser` → `rembourse` ; montant ajustable à la baisse par Sandrine (on garde le montant initial)
**Signalement** : `ouvert` → `traite`

Libellés affichés (badges Figma) : Disponible · En cours · À valider · En retard · Bloqué · Retiré (du prêt) · Payé · Incident.

## Cycle de vie d'un emprunt
```
N2 :  EMPRUNTER ─► actif ─► RENDRE (checklist + photo) ─► rendu + photo à contrôler ─► CONTROLER_PHOTO ─► conforme | incident
N1 :  EMPRUNTER ─► remise_a_valider ─► VALIDER_REMISE ─► actif ─► RENDRE ─► retour_a_valider ─► VALIDER_RETOUR ─► rendu | incident composant
Soir : actif non rendu à 18h ─► responsable bloqué ─► J+2 18h ─► perdu + incident (forfait complet)
```

## Actions du moteur (`dispatch(state, action)`)
| Action | Qui | Préconditions / refus (code) | Effets |
|---|---|---|---|
| ACCEPTER_CHARTE | emprunteur | — | `charteAcceptee = date` |
| EMPRUNTER {item, pourClasse?} | emprunteur | bureau ouvert (R01) · pas bloqué (R10) · pourClasse ⇒ intervenant (R09) · boîte ⇒ intervenant · matériel disponible (R02) | N1 : prêt `remise_a_valider` + notif équipe. N2 : prêt `actif`. Retire la personne des « prévenus ». Si photo précédente non contrôlée : OK (R06) |
| VALIDER_REMISE {item} | équipe | remise en attente | prêt `actif`, notif « Remise validée : … est à rendre ce soir. » |
| RENDRE {item, manquant?, photo} | responsable | prêt en cours · auteur = responsable (R08) · remise validée · retour pas déjà en attente | N1 : `retour_a_valider` + notif équipe. N2 : `rendu`, matériel disponible, photo à contrôler, notif aux prévenus (R14) |
| VALIDER_RETOUR {item, manquant?} | équipe | retour en attente | conforme : disponible. Manquant : `anomalie` + incident au forfait du composant (R07) |
| CONTROLER_PHOTO {item, manquant?} | équipe | N2 uniquement · photo en attente | conforme. Problème : incident au **dernier responsable**, pas au nouvel emprunteur (R06) ; si en stock, matériel retiré |
| PREVENEZ_MOI {item} | emprunteur | matériel indisponible, pas retiré, pas déjà chez soi, pas déjà inscrit | ajout aux prévenus |
| SIGNALER {cible, type, texte, photo?} | tous | types : Panne, Casse, Manquant, Déplacé, Autre ; cible : mon prêt, un matériel, une salle | signalement ouvert + notif équipe |
| TRAITER_SIGNALEMENT {id} | équipe | — | `traite` + notif à l'auteur |
| RETIRER / REMETTRE {item} | équipe | retirer : en stock · remettre : retiré/anomalie/perdu | statut ; remettre notifie les prévenus |
| AJOUTER_MATERIEL {données} | équipe | — | nouvel id + QR `MDS-…` |
| MODIFIER_FORFAIT {item, composant?, valeur} | Sandrine (R12) | — | s'applique à **tout le type** (« Un changement s'applique à tout le type ») |
| AJUSTER_MONTANT {incident, valeur} | Sandrine | baisse uniquement | montant ajusté, mention « ajusté par Sandrine » |
| REMBOURSEMENT {incident} | Sandrine | pas déjà payé | `rembourse` + notif merci ; lève un blocage « perte non remboursée » |
| DEBLOQUER {personne} | équipe | personne bloquée | exemption jusqu'à la fin de la journée (R16) |
| COMPTAGE {quantités} | équipe | — | quantités + date ; notif équipe si sous le seuil |
| VERIFIER_SALLE {salle, presents} | équipe | — | présents + date de vérification |
| IMPORT_INVENTAIRE {lignes valides} | équipe | lignes en erreur ignorées | ajoute les matériels |
| IMPORT_CLASSES {classes} | équipe | — | remplace la liste des classes |
| MODIFIER_CHARTE {texte} | Sandrine | — | charte mise à jour |
| REGLAGE {rappel16h30 \| recap8h, valeur} | équipe | — | active / coupe l'envoi |
| FIN_DE_JOURNEE (horloge) | démo | déjà le soir → refus | rappel 16h30 si activé · remises non validées annulées · blocages appliqués |
| LENDEMAIN (horloge) | démo | — | jour +1 à 8h · exemptions expirées · prêts à J+2 passent `perdu` · récap 8h si activé |

Toute action refusée renvoie `{ ok:false, msg, rule }` et **ne modifie pas l'état**. Les changements de blocage déclenchent automatiquement une notification à la personne (« Tes emprunts sont bloqués : … » / « Tu peux de nouveau emprunter. »).

## Droits (résumé)
| | Emprunteur | Intervenant | Équipe (Cyrianne, Lydia) | Direction (Sandrine) |
|---|---|---|---|---|
| Emprunter / rendre / signaler / me prévenir | ✓ | ✓ | — | — |
| Pour ma classe, boîtes intervenant | — | ✓ | — | — |
| Valider, contrôler, débloquer, matériel, salles, stocks, imports, réglages | — | — | ✓ | ✓ |
| Forfaits, ajustement, paiement, charte | — | — | 🔒 visible, refusé | ✓ |

Côté Lydia, les actions de Sandrine restent **visibles** avec la mention « Réservé à Sandrine » (cadenas) : le clic affiche le refus R12.

## Temps (horloge simulée)
- Démo au départ : **jeudi 17 septembre 2026, 10:15**, bureau ouvert.
- Contrôles du panneau démo : « Aller à 16h30 » (déclenche le rappel), « Fin de journée 18h », « Lendemain 8h ».
- Dates relatives affichées comme dans le Figma : « Aujourd'hui / Auj. 9:58 », « Hier 17:40 », « Lundi », « Ven. 18h », « lundi 14 sept. ».

## Écarts connus et arbitrés
- Perte : le Figma affiche « Déclaré perdu vendredi à 18h » (J+2, fin de journée). **On suit le Figma** (le moteur de référence le faisait à 8h).
- Le prototype compte J+2 en jours calendaires, sans gestion des week-ends ni jours fériés (hors périmètre).
- Les chiffres du Figma sont illustratifs : l'app affiche ceux calculés depuis `data/seed.json` (quelques unités d'écart possibles, c'est normal).
