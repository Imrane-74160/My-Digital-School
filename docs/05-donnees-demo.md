# 05 · Données de démo

Fichier : `data/seed.json`. Chargé au premier lancement et par « Réinitialiser la démo ». Situation : **jeudi 17 septembre 2026, 10:15**, une matinée normale au campus.

## Ce que le jeu permet de tester tout de suite
| Situation | Données | Écrans |
|---|---|---|
| 3 remises N1 à valider | Kit Canon R10 #01 (Inès), Ronin (M. Diallo pour la B3), Zoom H5 (Léa) | BO Validations, App Accueil d'Inès |
| 1 retour N1 à contrôler, récepteur manquant possible | Micro HF Godox (Tom) | BO Validations |
| 3 photos N2 à contrôler, dont un réemprunt | Codenames (Sarah), Casque #02 (Léa → repris par Tom), Boîte #02 (Mme Roche, « feutres secs ») | BO Contrôle photo |
| Emprunteur bloqué, perte vendredi 18h | Yanis, PC de prêt #02 sorti hier | BO Tableau de bord, Emprunteurs ; App avec Yanis |
| 2 paiements à enregistrer (94 €) | Sarah 79 €, Léa 15 € (ajusté de 25 € par Sandrine) | BO Incidents (Sandrine vs Lydia) |
| Prêts pour la classe | M. Diallo (B3), Mme Roche (M1) | BO Prêts, App avec un intervenant |
| « Me prévenir » | Casques d'anglais tous indisponibles | App Matériel |
| Première connexion | Noah Petit (charte jamais acceptée) | App Connexion → Charte |
| Stock bas | Stylos 4 / seuil 10 | BO Consommables, Tableau de bord |
| Salles à régler | 103 (1/2), 104 (2/1), 201 (1/2) + 2 signalements | BO Salles |
| Import avec erreur | `importExemple` (4 lignes dont 1 sans niveau) | BO Imports Calc |

## Modèle (résumé)
- `personnes` (rôle `eleve` / `intervenant` / `equipe` / `direction`, couleur d'avatar, charte acceptée)
- `materiels` (type, catégorie, niveau, lieu, QR, `forfait` ou `composants[]`, statut, `reserveA`)
- `prets` (responsable, pour la classe, statut, dates) — ouverts + historique
- `photosDeRetour` (à contrôler / conforme / problème, réemprunté par)
- `incidents`, `signalements`, `notifications`, `consommables` + `comptages`, `salles`, `reglages`, `exemptions`, `importExemple`

## Règles de calcul (jamais en dur)
- Sortis = prêts `actif` + `retour_a_valider` · À valider = remises + retours en attente · Photos = photos `a_controler`
- En retard = prêts `actif` non rendus à la fermeture d'un jour passé · Bloqué = responsable d'un prêt en retard (hors exemption du jour) ou d'une perte non remboursée
- À rembourser = incidents `a_rembourser` (nombre + somme) · Stock bas = quantité < seuil
- Forfait d'un kit = somme des composants · « Forfaits par type » = un forfait par `type`

Les dates s'affichent en relatif (Auj., Hier, Lundi, lundi 14 sept.) par rapport à l'horloge simulée.
