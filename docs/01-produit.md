# 01 · Produit

## Problème
Au campus MyDigitalSchool, le matériel (studio photo-vidéo, PC, casques, souris, multiprises, jeux, boîtes intervenant) se prête « à la confiance » : on ne sait pas qui a quoi, le matériel revient incomplet, rien ne relance les oublis et les pertes ne sont pas facturées de façon juste.

## Promesse
« Emprunte le matériel de l'école en 30 secondes. Scanne, emprunte, rends le soir avec une photo. »

## Utilisateurs
| Persona | Rôle | Surface | Ce qu'il/elle doit pouvoir faire |
|---|---|---|---|
| Inès Martin | Élève B3 | App mobile | Voir ses prêts, emprunter, rendre avec photo, être prévenue, signaler |
| Tom Leroy, Léa Dubois, Yanis Benali, Sarah Nguyen | Élèves | App mobile | Idem (Yanis est bloqué dans les données de démo) |
| Noah Petit | Élève B1, jamais connecté | App mobile | Tester la première connexion et la charte |
| M. Diallo, Mme Roche | Intervenants | App mobile | Idem + « Pour ma classe » + boîtes intervenant |
| Cyrianne, Lydia | Équipe pédagogique | Back-office | Valider remises et retours, contrôler les photos, gérer matériel, salles, consommables, imports, débloquer |
| Sandrine | Direction | Back-office | Tout, plus forfaits, ajustements, paiements et charte |

## Ce que l'application doit permettre
1. Jouer **chaque règle R01 à R16 de bout en bout**, des deux côtés, sans truquage.
2. Un rendu fidèle au Figma validé, présentable en soutenance.
3. L'usage réel : l'app sur un téléphone, le back-office sur un ordinateur, les deux en même temps dans deux onglets synchronisés.
4. Les échéances qui tombent toutes seules. L'horloge est celle de la machine : 16h30, 18h et 8h le lendemain se déclenchent sans que personne appuie sur un bouton.

## Périmètre
- App mobile : 10 écrans (Connexion, Charte, Accueil, Matériel, Fiche + Emprunter, Rendre, Scanner, Signaler, Alertes, Profil).
- Back-office : 12 écrans (Se connecter, Tableau de bord, Validations sur place, Contrôle photo, Matériel, Prêts, Emprunteurs, Incidents & paiements, Consommables, Salles, Imports Calc, Réglages).

## Hors périmètre (ne pas construire)
- Mot de passe et SSO. On se connecte avec son identifiant MDS, chaque espace a sa session, et les rôles se refusent entre eux (R13). Un vrai contrôle d'identité demanderait un serveur.
- Paiement en ligne (le paiement se fait au bureau ; l'app enregistre « payé »).
- Réservation à l'avance, emplois du temps / import PRONOTE (V1.1), exports, e-mails réels, push réels (simulés dans Alertes et dans le toast).
- Caméra réelle : le scanner et la photo sont simulés (option : `<input type="file" capture>` pour la photo si simple, sans stockage serveur).

## Glossaire
| Terme | Définition |
|---|---|
| Niveau 1 (N1) | Matériel sensible (studio, PC). Remise et retour **validés sur place** par l'équipe. |
| Niveau 2 (N2) | Libre-service au bureau de la pédagogie. Retour avec **photo**, contrôle plus tard. |
| Forfait | Montant dû en cas de perte ou casse, affiché et accepté à chaque emprunt. Un kit a un forfait par composant. |
| Responsable | Personne qui a emprunté (ou l'intervenant pour sa classe). Seul·e à pouvoir rendre. |
| Blocage | Un prêt non rendu le soir bloque les nouveaux emprunts de son responsable. |
| Déblocage | L'équipe peut lever le blocage pour la journée uniquement. |
| Signalement | Problème remonté depuis l'app sur un matériel ou une salle. |
| Consommables | Stylos, feutres, couverts : comptage hebdomadaire, pas de suivi par personne. |
| Salles | Ventilateurs rattachés aux salles, vérification mensuelle. |
