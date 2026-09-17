# 02 · Règles métier

Validées en ateliers avec l'équipe (6 rounds). Le moteur de référence `reference/engine-prototype.js` les implémente déjà : porter sa logique en TypeScript dans `src/domain/`, avec un test Vitest par règle.

## Les 16 règles
| Code | Clé | Règle | Où elle se voit |
|---|---|---|---|
| R01 | bureau | On emprunte seulement quand le bureau est ouvert (8h–18h). | App : bouton « Bureau fermé » le soir |
| R02 | dispo | Pas de réservation : premier arrivé, premier servi. | Catalogue : Disponible / Indisponible |
| R03 | forfait | Forfait affiché et accepté (case à cocher) avant chaque emprunt. Charte acceptée une fois à la 1re connexion. **Les deux sont des préconditions du moteur**, pas seulement de l'interface : `EMPRUNTER` exige `forfaitAccepte: true` et une charte acceptée, sinon refus R03. | Feuille Emprunter, écran Charte |
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
| R14 | prevenez | « Me prévenir » s'inscrit **sur un type** de matériel, et seulement si aucune unité du type n'est disponible. Dès qu'une unité revient, tous les inscrits du type sont prévenus **avec le nom de l'unité** et la liste du type est vidée ; le premier qui scanne le prend. | Bouton Me prévenir, notification |
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
| EMPRUNTER {item, pourClasse?, forfaitAccepte} | emprunteur | charte acceptée (R03) · `forfaitAccepte: true` (R03) · bureau ouvert (R01) · pas bloqué (R10) · pourClasse ⇒ intervenant (R09) · boîte ⇒ intervenant · matériel disponible (R02) | N1 : prêt `remise_a_valider` + notif équipe. N2 : prêt `actif` + notif « Emprunt confirmé : … est à rendre ce soir avant 18h. » Retire la personne des « prévenus » **du type**. Si photo précédente non contrôlée : OK (R06) |
| VALIDER_REMISE {item} | équipe | remise en attente | prêt `actif`, notif « Remise validée : … est à rendre ce soir. » **Pas de « manquant » à la remise** : un kit incomplet ne sort pas, l'équipe le retire du prêt depuis Matériel (▶ RETIRER) |
| RENDRE {item, manquant?, photo} | responsable | prêt en cours · auteur = responsable (R08) · remise validée · retour pas déjà en attente | N1 : `retour_a_valider` + notif équipe. N2 : `rendu`, matériel disponible, photo à contrôler, notif aux inscrits du **type** (R14) |
| VALIDER_RETOUR {item, manquant?} | équipe | retour en attente | conforme : disponible + notif aux inscrits du **type** (R14). Manquant : `anomalie` + incident au forfait du composant (R07) |
| CONTROLER_PHOTO {item, manquant?} | équipe | N2 uniquement · photo en attente | conforme. Problème : incident au **dernier responsable**, pas au nouvel emprunteur (R06) ; si en stock, matériel retiré |
| PREVENEZ_MOI {type} | emprunteur | **aucune unité du type disponible** · aucune unité du type déjà chez soi · pas déjà inscrit | ajout aux « prévenus » du type |
| SIGNALER {cible, type, texte, photo?} | tous | types : Panne, Casse, Manquant, Déplacé, Autre ; cible : mon prêt, un matériel, une salle | signalement ouvert + notif équipe |
| TRAITER_SIGNALEMENT {id} | équipe | — | `traite` + notif à l'auteur |
| RETIRER / REMETTRE {item} | équipe | retirer : en stock · remettre : retiré/anomalie/perdu | statut ; remettre notifie les inscrits du **type** (R14) |
| AJOUTER_MATERIEL {données} | équipe | — | nouvel id + QR `MDS-…` |
| MODIFIER_FORFAIT {item, composant?, valeur} | Sandrine (R12) | — | s'applique à **tout le type** (« Un changement s'applique à tout le type ») |
| AJUSTER_MONTANT {incident, valeur} | Sandrine | baisse uniquement | montant ajusté, mention « ajusté par Sandrine » |
| REMBOURSEMENT {incident} | Sandrine | pas déjà payé | `rembourse` + notif merci ; lève un blocage « perte non remboursée » |
| DEBLOQUER {personne} | équipe | personne bloquée | exemption jusqu'à la fin de la journée (R16) |
| COMPTAGE {quantités} | équipe | — | quantités + date ; notif équipe si sous le seuil |
| VERIFIER_SALLE {salle, presents} | équipe | — | présents + date de vérification |
| IMPORT_INVENTAIRE {lignes valides} | équipe | lignes en erreur ignorées | ajoute les matériels |
| IMPORT_CLASSES {classes} | équipe | — | remplace la liste des classes |
| MODIFIER_CHARTE {titre?, articles} | Sandrine | — | charte mise à jour : `{ titre, articles: [{ id, titre, texte }] }`, 7 articles |
| REGLAGE {rappel16h30 \| recap8h, valeur} | équipe | — | active / coupe l'envoi |
| FIN_DE_JOURNEE (horloge) | démo | déjà le soir → refus | rappel 16h30 si activé · remises non validées annulées · blocages appliqués |
| LENDEMAIN (horloge) | démo | — | jour +1 à 8h · exemptions expirées · prêts à J+2 passent `perdu` · **génère et stocke l'instantané du récap de 8h** si `recap8h` est actif |

Toute action refusée renvoie `{ ok:false, msg, rule }` et **ne modifie pas l'état**. Les changements de blocage déclenchent automatiquement une notification à la personne (« Tes emprunts sont bloqués : … » / « Tu peux de nouveau emprunter. »).

`dispatch` est **immuable** : sur un refus, l'objet état renvoyé est *exactement* celui reçu (identité préservée, testée avec `toBe`).

Messages de refus fixés :
- R03 forfait non accepté : « Accepte le forfait pour emprunter. »
- R03 charte non acceptée : « Accepte la charte avant ton premier emprunt. »

## Notifications
- Un emprunt **N2** produit « Emprunt confirmé : {matériel} est à rendre ce soir avant 18h. » (R05).
- Un emprunt **N1** produit « Demande envoyée : présente-toi à {lieu} pour {matériel}. » (R04), puis « Remise validée : {matériel} est à rendre ce soir. » après ▶ VALIDER_REMISE (R04).
- **Aucune notification « Remise validée » pour un matériel de niveau 2** : le N2 n'a pas d'étape de remise.
- Retour d'une unité : les inscrits « Me prévenir » du **type** reçoivent « {matériel} est de retour. Le premier qui scanne le prend. » (R14).

## Récap de 8h
Format repris du Figma (carte « Récap de 8h » du tableau de bord) : une ligne d'en-tête « {Jour} {j} {mois}. · 8:00 », puis **une ligne par indicateur non nul** —
`n prêt(s) en retard` · `n emprunteur(s) bloqué(s)` · `n photo(s) à contrôler` · `n paiement(s) · {somme} €` · `n signalement(s) ouvert(s)` · `Stock bas : {noms en minuscules}`.

C'est un **instantané**, pas un calcul en direct : il est généré par ▶ LENDEMAIN quand `recap8h` est actif, puis stocké dans l'état. Au chargement du seed il est généré une fois et daté de 8:00.

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

### Arbitrages de la session « avant Phase 0 »
- **Charte structurée** : `reglages.charte` = `{ titre, articles: [{ id, titre, texte }] }`. Les 7 titres courts viennent du Figma mobile (Usage, Retour, Niveau 1, Forfaits, Blocage, Classes, Photos) ; les **textes longs du back-office sont la source unique**. Les textes abrégés du Figma mobile ne sont qu'une illustration.
- **KPI « À valider » = 4** (remises + retours N1 en attente). La règle de calcul est la bonne, le « 3 » du Figma est illustratif, le libellé ne change pas. La ligne « À faire » se calcule aussi : « 3 remises et 1 retour à valider au bureau ».
- **`prets[].emprunteur` supprimé** : seul `responsable` existe. Pour un prêt de classe, le demandeur *est* l'intervenant responsable.
- **« Pour ma classe »** propose la liste globale `classes` (celle que remplace ▶ IMPORT_CLASSES). `personnes[].classes` ne sert qu'à l'affichage (« Intervenant · B3, M1 ») et à présélectionner la première classe.
- **`prets` P110 rétabli** (bug de génération) : Léa / Pack LED Newer, sorti à 9:30, validé par Cyrianne. Sortis = 12, comme le Figma.
- **`materiels[].note`** s'affiche **uniquement au back-office** : sous le badge de statut dans la table Matériel et dans « Statut actuel » de la fiche. Jamais dans l'app.
- **Horloge injectable** : aucun `Date.now()` dans `src/domain/`. Fuseau `Europe/Paris`, départ `2026-09-17T10:15`.
