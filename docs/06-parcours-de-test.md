# 06 · Parcours de test (critères d'acceptation)

Chaque parcours part de la démo réinitialisée. À automatiser avec Playwright (`e2e/parcours-XX.spec.ts`) et à jouer à la main sur téléphone.

## P1 · Emprunt et retour en libre-service (R02 R03 R05)
1. App, Inès → Matériel → Cours → Souris Apple (N2, disponible) → feuille : « Emprunter » désactivé tant que la case forfait n'est pas cochée.
2. Emprunter → Accueil affiche le prêt « En cours ».
3. Rendre → cocher, prendre la photo → « Valider le retour » s'active → Accueil sans le prêt.
4. BO Lydia → Contrôle photo : la photo apparaît → « Photo conforme » → passe dans Contrôlées récemment.

## P2 · Kit N1 incomplet (R04 R07)
1. BO Lydia → Validations → Remise Kit Canon R10 #01 → « Valider la remise ». App Inès : notification « Remise validée ».
2. App Inès → Rendre le kit en décochant « Batterie LP-E17 (2/2) » → statut « Retour en vérification ».
3. BO → Retour : puce Batterie en « Manquant » → « Créer l'incident · 45 € ». Incident de **45 €** (pas 1 130 €) dans Incidents.

## P3 · Réemprunt avant contrôle (R06)
1. BO → Contrôle photo → Casque d'anglais #02 (badge « Réemprunté par Tom ») → Manquant « Incomplet ou abîmé » → incident.
2. L'incident est au nom de **Léa**, pas de Tom ; Tom garde son prêt.

## P4 · Prêt pour la classe (R08 R09)
1. App M. Diallo → emprunter un matériel « Pour ma classe » B3 → responsable = M. Diallo.
2. App Inès (élève) : l'option « Pour ma classe » n'existe pas ; les boîtes intervenant n'apparaissent pas.
3. Tenter de rendre le prêt de M. Diallo depuis une autre persona → refus R08.

## P5 · Oubli, blocage, perte (R10 R11 R15 R16)
1. Panneau démo → « 16h30 » : Inès reçoit « Pense à rendre … ».
2. « Fin de journée » : Inès (casque #03 non rendu) est bloquée → carte Accueil rose, tentative d'emprunt refusée (R10). Les remises non validées sont annulées.
3. BO → Emprunteurs → Inès → « Débloquer pour aujourd'hui » → elle peut emprunter aujourd'hui seulement (R16).
4. « Lendemain 8h » (vendredi : récap 8h mis à jour) → « Fin de journée » (vendredi 18h) : le PC de prêt #02 de Yanis, sorti mercredi, passe `perdu` avec un incident de 450 € (R11) ; Yanis reste bloqué tant que la perte n'est pas payée.

## P6 · Me prévenir (R14)
1. App Léa → Matériel → Casque d'anglais (indisponible) → cloche « Me prévenir ». Idem avec Sarah.
2. App Tom → rendre Casque d'anglais #02 → Léa **et** Sarah reçoivent « Casque d’anglais #02 est de retour. Le premier qui scanne le prend. »
3. Sarah emprunte la première → Léa voit de nouveau « Indisponible » et n'est plus inscrite.

## P7 · Argent réservé à Sandrine (R12 R13)
1. BO Lydia → Incidents → « Enregistrer le paiement » (cadenas) → toast refus R12.
2. Panneau → Sandrine → « Ajuster » Sarah 79 € → 90 € refusé (hausse), 60 € accepté (« 79 € ajusté par Sandrine ») → « Enregistrer le paiement » → Payés.
3. Sandrine → Forfaits par type → PC de prêt 500 € → tous les PC affichent le nouveau forfait. Réglages → charte modifiée → visible dans l'app (Charte).
4. App : aucune action d'équipe accessible.

## P8 · Première connexion et signalement
1. App Noah → Connexion → Charte : « Continuer » désactivé sans la case → Accueil « Aucun prêt en cours ».
2. Signaler → Salle 103 · Manquant → BO Tableau de bord : nouveau signalement + compteur « À faire » → « Marquer traité » → Noah reçoit une notification.

## P9 · Gestion (équipe)
1. Consommables : saisir Stylos 25 → Enregistrer → carte passe en « OK », historique +1 ligne, tableau de bord à jour.
2. Salles : 103 → + → 2 → Valider → « Complet », panneau « À régler » mis à jour.
3. Imports : fichier exemple → 3 lignes valides importées → visibles dans Matériel avec QR. Classes : import B1 B2 B3 M1 M2 → proposées dans « Pour ma classe ».
4. Matériel : ajouter un matériel ; retirer du prêt puis remettre en service ; imprimer l'étiquette.
5. Réglages : couper le rappel de 16h30 → « 16h30 » ne notifie plus.

## P10 · Hiérarchie et personnalisation du tableau de bord
1. BO Lydia → Tableau de bord : « À faire maintenant » est trié **par urgence**, la ligne de tête est appuyée et porte « À traiter en premier · {raison} ». La ligne « Réservé à Sandrine » est **en dernier**.
2. BO Sandrine : la même ligne de paiement **remonte** au classement et n'est plus verrouillée.
3. Lydia → « Personnaliser » → descendre « À faire maintenant », masquer « Récap de 8h » → « Terminer » → recharger : la disposition tient. Cyrianne retrouve la sienne, intacte.
4. « Rétablir le défaut » ne s'affiche qu'après un déplacement, et remet l'écran du Figma.
5. Tout le mode rangement se pilote **au clavier** (flèches de monter/descendre, changement de colonne, masquage).

## P11 · Emprunt raccourci et accueil mobile
1. App Inès → Matériel : une ligne disponible porte un bouton rond « Emprunter » (≥ 44 px) qui ouvre **directement** la feuille du forfait. Le texte de la ligne mène toujours à la fiche.
2. La case du forfait reste obligatoire : le CTA est inerte tant qu'elle n'est pas cochée (R03).
3. App Sarah → Scanner : une ligne « Disponible » ouvre la feuille d'emblée. Un matériel non libre ignore le raccourci.
4. Accueil : « Mes prêts » montre « À rendre avant 18h » puis « En attente de l'équipe », avec leurs compteurs ; le raccourci est « Rendre maintenant » quand il y a un prêt actif, « Emprunter » sinon.
5. Déclencher une action : le bandeau se pose **au-dessus** de la barre de navigation, jamais dessus.

## Transversal
- Se déconnecter d'un espace ne touche pas à l'autre ; les échéances de 16h30, 18h et 8h s'appliquent seules.
- Deux onglets (app + BO) restent synchronisés sans rechargement.
- Aucun défilement horizontal à 390 px ; navigation clavier complète dans le back-office ; contraste AA.
