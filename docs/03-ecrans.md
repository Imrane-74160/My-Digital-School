# 03 · Écrans, routes et interactions

Lien d'un nœud : `https://www.figma.com/design/lN2EFZzYHfTuAW9agcHstV/Maquette-MDS?node-id=<ID avec tiret>` (ex. `8:950` → `node-id=8-950`).
Les **textes, images et mises en page exacts** se lisent dans Figma (`get_design_context`) : le Figma a pu évoluer depuis ces fiches (ex. photo sur les écrans de connexion, QR code dans le scanner) et c'est lui qui fait foi. Ce document dit **quoi brancher** : données, actions, navigation, états non dessinés.

Légende : ▶ action moteur (`docs/02-regles-metier.md`) · → navigation · ◐ état à dériver (non dessiné, construit avec les composants existants, sans nouveau style)

---
## A. App mobile (390 × 844) — page Figma `15:3`
Barre de navigation (5 onglets) : Accueil `/app` · Matériel `/app/materiel` · **Scanner** `/app/scanner` (bouton blanc central) · Alertes `/app/alertes` · Profil `/app/profil`. Onglet actif = variante `Actif`.
Elle est **masquée sur 5 écrans** (plein écran dans le Figma) : A1 Connexion, A2 Charte, A6 Rendre, A7 Scanner, A8 Signaler.
Les en-têtes de A1, A4, A8 et A9 ont un **titre + un sous-titre** (le sous-titre se lit dans le Figma).

### A1 · Connexion — `91:711` — `/app/connexion`
- Logo, visuel (image exportée du Figma), accroche, bouton « Se connecter avec mon compte école », mention sécurisée.
- Clic → connecte la persona choisie dans le panneau démo (Inès par défaut) → Charte si jamais acceptée, sinon Accueil.

### A2 · Charte — `91:838` — `/app/charte`
- En-tête titre + sous-titre, puis **7 articles** : `reglages.charte.articles` = `[{ id, titre, texte }]`, rendus en numéro (pastille) + **titre court** + texte. Titres : Usage, Retour, Niveau 1, Forfaits, Blocage, Classes, Photos.
- Le **texte long du back-office est la source unique** : le mobile affiche `titre` + `texte` complet (les formulations abrégées du Figma mobile sont une illustration).
- Case « J'ai lu la charte… », bouton Continuer **désactivé tant que la case n'est pas cochée**.
- ▶ ACCEPTER_CHARTE → Accueil. Depuis Profil « Relire la charte » : même écran en lecture seule avec bouton retour (◐ sans case ni Continuer).

### A3 · Accueil — `28:2` — `/app`
- En-tête : avatar, « Bonjour {prénom} », « {Profil} · {classe} · {date} », bouton Alertes (pastille si non lues) → Alertes.
- Carte anthracite « À rendre ce soir » : nombre de prêts actifs à rendre avant 18h, rappel 16:30, « Avec une photo ».
- « Mes prêts » (+ lien Historique → Alertes onglet Historique) : une **Carte de prêt** par prêt en cours
  - `En cours` : bouton Rendre → Rendre.
  - `Demande envoyée` (N1) : message « Présente-toi à … : l'équipe vérifie le kit avec toi. »
  - ◐ `Retour en vérification` (N1 rendu, en attente équipe) · ◐ `En retard`.
- Raccourcis : Voir le matériel → Matériel ; Signaler → Signaler.
- ◐ Bloqué : la carte du haut devient rose « Emprunts bloqués · {matériel} non rendu. Rapporte-le au bureau de la pédagogie. »
- ◐ Soir : « Bureau fermé · réouverture demain à 8h ». ◐ Aucun prêt : « Aucun prêt en cours ». ◐ Section « À rembourser : {montant} · {motif} » si incident dû.

### A4 · Matériel — `29:2` — `/app/materiel`
- Recherche (nom), puces catégories (Tout, Studio, Informatique, Cours, Jeux ; + Boîtes pour les intervenants), bouton scanner → Scanner.
- **Une section par catégorie du seed**, dans cet ordre et avec ces titres : Studio photo & vidéo · Informatique · Matériel de cours · Jeux de société · Boîtes intervenant (cette dernière **pour les intervenants seulement**). Les sections vides sont **masquées**. Les sections correspondent exactement aux puces de catégorie.
  *Le « Informatique & cours » du Figma est un raccourci de maquette, pas la règle.*
- Une **Ligne de catalogue** par **type** de matériel (le nom du type, sans le numéro d'unité), avec son badge :
  « Disponible » (1 unité libre) · « n disponibles » (plusieurs) · « Indisponible » + cloche · « Chez toi » ou « Ta demande » si la persona en a une.
- Mode de remise affiché (Remise par l'équipe / Libre-service / lieu).
- Type avec unité disponible → Fiche. Type indisponible → cloche ▶ PREVENEZ_MOI **sur le type** (◐ état « Tu seras prévenu(e) »).
- Jamais le nom de l'emprunteur d'un matériel indisponible.

### A5 · Fiche + feuille Emprunter — `30:2` — `/app/materiel/:itemId`
- Fiche : bouton retour, **fil d'Ariane** (en-tête mobile), visuel, nom, badges (dispo, « N1 · remise par l'équipe »), puis bloc Informations à **2 lignes seulement** : « Où le trouver » et « Retour ». Le forfait n'apparaît **que dans la feuille Emprunter** (Figma `30:2`).
- CTA contextuel : Disponible → ouvre la **feuille Emprunter** · Chez toi → « Rendre ce matériel » · Demande envoyée → message · Indisponible → « Me prévenir à son retour » · Retiré → « Momentanément retiré du prêt » · Soir → « Bureau fermé » (désactivé).
- Feuille (voile + feuille qui monte 320 ms) : forfait total et par composant (**Ligne de montant** Sombre), case d'acceptation obligatoire, consigne N1/N2, CTA « Demander la remise » (N1) / « Emprunter » (N2).
- Intervenant : ◐ contrôle segmenté « Pour moi / Pour ma classe » + classes (`classes`) + aide « Tu seras responsable du matériel et seul à pouvoir le rendre. »
- ▶ EMPRUNTER `{ item, pourClasse?, forfaitAccepte }` → ferme la feuille, retour Accueil, toast résultat. Le CTA reste désactivé tant que la case n'est pas cochée ; un appel sans `forfaitAccepte` ou sans charte acceptée est refusé R03.

### A6 · Rendre — `31:2` — `/app/rendre/:itemId`
- Carte du matériel, Étape 1 « Vérifie le contenu » (kit : une ligne par composant cochable ; sinon « Tout le contenu est là » + « Rien n'est abîmé »), lien « Un souci ? Signaler un problème » → Signaler.
- Étape 2 « Prends une photo » : ◐ avant (zone pointillée « Prendre la photo ») → après (badge « Photo prise », « Reprendre »). Photo simulée (ou fichier local, jamais envoyé).
- Consigne N2 / ◐ N1 (« l'équipe contrôle avec toi »).
- « Valider le retour » désactivé tant que photo manquante. Composant non coché = `manquant`. ▶ RENDRE → Accueil.

### A7 · Scanner — `92:757` — `/app/scanner`
- Plein écran (pas de barre de navigation), bouton Fermer. Viseur animé (ligne de lecture, QR code d'exemple repris du Figma), consigne.
- Feuille « À proximité », **3 lignes maximum**, dans cet ordre : d'abord les **prêts ouverts de la persona** (badges « Chez toi » / « Demandé » / « Vérification »), puis les **matériels disponibles du bureau** pour compléter. Le compteur du titre = le nombre de lignes affichées.
- Ligne « Chez toi » → Rendre ; toutes les autres → Fiche. Fermer → retour arrière.

### A8 · Signaler — `92:874` — `/app/signaler`
- « Sur quoi ? » (liste : mes prêts, salles, autres matériels), « Quel problème ? » (Panne, Casse, Manquant, Déplacé, Autre — une puce active), détails facultatifs, photo facultative.
- « Envoyer le signalement » désactivé sans type. ▶ SIGNALER → Accueil + toast.

### A9 · Alertes — `93:809` — `/app/alertes`
- Onglets Notifications (compteur) / Historique.
- Notifications : groupées Aujourd'hui / Hier / date, **chaque titre de groupe portant son propre compteur** (en plus de celui de l'onglet) ; composant **Notification** Lue / Non lue ; ouvrir l'écran marque tout comme lu.
- ◐ Historique : prêts passés de la persona (Rendu, Perdu, Annulé, pour la classe) → Fiche.

### A10 · Profil — `93:942` — `/app/profil`
- Avatar **84 px** (taille propre à cet écran, cf. `docs/04`), nom, classe + rôle ; informations (compte, emprunts cette année, charte acceptée le …).
- Relire la charte → Charte (lecture) ; Signaler un problème → Signaler ; Se déconnecter → Connexion.

---
## B. Back-office (1440 × 839) — page Figma `15:2`
Coque commune : **Menu principal** (11 liens, infobulle au survol, lien actif = page courante) + **En-tête de page** (titre, fil d'Ariane, retour → Tableau de bord ; boutons Rechercher / Filtres / Notifications ; compte). Sur le Tableau de bord : pas de retour ni de fil d'Ariane.
Le **logo MyDigitalSchool est dans la barre d'en-tête**, à gauche du titre de page ; le rail sombre du menu commence sous l'en-tête (et non l'inverse, contrairement à ce qu'indiquait `docs/04`).
Utilisateur par défaut : Lydia (équipe). Le panneau démo permet de passer en Sandrine (direction) ou Cyrianne.

### B1 · Se connecter — `14:950` — `/admin/connexion`
- Mise en page, image et bouton selon le Figma. Clic → Tableau de bord avec l'utilisateur choisi dans le panneau démo.

### B2 · Tableau de bord — `8:950` — `/admin`
- **À faire maintenant** (Action à faire) : remises à valider → Validations ; photos à contrôler → Contrôle photo ; emprunteur bloqué « Voir » → Emprunteurs (fiche ouverte) ; paiements « Réservé à Sandrine » → Incidents ; signalements « Traiter » → Incidents onglet Signalements. Une ligne n'apparaît que si son compteur > 0.
  - En-tête de la carte : « **{n} actions · mis à jour à {HH:MM}** » (n = lignes affichées, heure = horloge simulée).
  - Ligne validations, titre calculé : « **{n} remises et {m} retours à valider au bureau** » (accords au singulier quand n ou m vaut 1 ; une seule des deux moitiés si l'autre est à 0). Sur le seed initial : « 3 remises et 1 retour à valider au bureau ».
  - Ligne validations, détail : **2 personnes** → format du Figma « {Prénom} attend avec le {matériel} · {Prénom} pour la {classe} » ; **3 et plus** → « {A}, {B} et {C} attendent au bureau » (les matériels disparaissent au profit de l'énumération).
- **En ce moment** (6 Indicateurs, ton Retard/Attention si > 0) : Sortis, En retard, À valider, Photos, À rembourser, Stock bas.
- **Consommables** : sous-titre « Comptage de la semaine · {jour du dernier comptage} », une **Ligne de stock** par consommable avec sa **jauge** (`quantite / seuil`, rayée et teintée quand sous le seuil), puis « Enregistrer le comptage » → Consommables.
- **Prêts en retard** : sous-titre « Non rendus avant 18h », carte par prêt en retard (échéances « Hier 18h Bloqué », « Ven. 18h Perdu · forfait »), ▶ DEBLOQUER, et la note de bas de carte « Le blocage se lève dès le retour. Un déblocage manuel ne vaut que pour la journée. »
- **Récap de 8h** : sous-titre « Envoyé ce matin à l'équipe », bloc mono au **format Figma** (voir « Récap de 8h » dans `docs/02`), puis la ligne des destinataires (avatars + « Cyrianne, Lydia, Sandrine »). C'est un **instantané stocké**, pas un calcul en direct : il ne bouge qu'à ▶ LENDEMAIN.
- **Signalements ouverts** : sous-titre « Envoyés depuis l'app », colonnes **Signalement / Par / Quand / Photo** (la colonne Photo affiche une icône image quand `photo: true`, rien sinon), filtre Ouverts/Traités, ▶ TRAITER_SIGNALEMENT (bouton ✓). Lignes de salle → Salles.

### B3 · Validations sur place — `19:2` — `/admin/validations`
- Onglets Tout / Remises / Retours, chacun avec son compteur (sur le seed initial : Tout **4**, Remises 3, Retours 1).
- **Carte de validation · Remise** — **lecture seule**, une seule action :
  - Ligne d'identité : « {Prénom} · {classe} · attend au bureau · forfait de {montant} accepté à {HH:MM de `demandeLe`} ».
  - Prêt de classe : « pour la {classe} · responsable du prêt pour sa classe ».
  - Kit : puces de composants toutes en état **Vérifié**, **non cliquables**. Sinon : « Tout le contenu est là, rien d'abîmé ».
  - **Pas de « manquant » à la remise** : un kit incomplet ne sort pas ; l'équipe le retire du prêt depuis Matériel (▶ RETIRER). ▶ VALIDER_REMISE est le seul bouton.
- **Carte de validation · Retour** : puces composants « Manquant ? » (bascule) → « Conforme » ▶ VALIDER_RETOUR ou « Créer l'incident · {montant du composant} » ▶ VALIDER_RETOUR{manquant}.
- Colonne « Niveau 1 » : 4 Règles (statique). ◐ Vide : « Tout est traité. Rien ne vous attend. »

### B4 · Contrôle photo — `22:2` — `/admin/controle-photo`
- **Carte photo de retour** par photo en attente : badge « Réemprunté par {nom} » si reparti, agrandir (◐ visionneuse plein écran), déclaration (« Déclaré complet » / « Problème signalé : « … » »), puces « Manquant ? », « Photo conforme » ▶ CONTROLER_PHOTO / « Créer l'incident · {montant} ».
- **Contrôlées récemment** : Ligne de tableau · Contrôle (résultat Conforme / Incident · montant). ◐ Vide.

### B5 · Matériel — `24:3` — `/admin/materiel?id=`
- Recherche (nom ou QR), filtres (Tout, Niveau 1, Niveau 2, Disponibles, Sortis, Retirés), catégorie, « Ajouter un matériel » (◐ panneau/formulaire : nom, catégorie, niveau, lieu, forfait ▶ AJOUTER_MATERIEL).
- **Ligne de tableau · Inventaire** (survol, sélection) : `materiels[].note` s'affiche **sous le badge de statut** quand elle existe (ex. « Molette cassée »). → **Fiche matériel** : QR (généré depuis le code), statut actuel + la même note + action contextuelle (Valider la remise…), forfait par composant (Sandrine : champs éditables ▶ MODIFIER_FORFAIT ; Lydia : lecture + cadenas), total, « Imprimer l'étiquette » (impression navigateur d'une étiquette QR), « Retirer du prêt » ▶ RETIRER / ◐ « Remettre en service » ▶ REMETTRE.

### B6 · Prêts — `26:2` — `/admin/prets`
- Onglets En cours / ◐ Historique, recherche matériel ou emprunteur, **Ligne de tableau · Prêts** (retard en rose) → Matériel fiche.
- Colonne : Retour du soir (nombre à rendre, rappel 16:30), Pour les classes (Prêt de classe).

### B7 · Emprunteurs — `83:2266` — `/admin/emprunteurs?id=`
- Recherche, filtres Tous / Bloqués / À rembourser / Intervenants. **Ligne de tableau · Emprunteur** (survol, sélection).
- **Fiche emprunteur** : identité, statut (bloqué → raison, échéance perte, ▶ DEBLOQUER ; ◐ actif ; ◐ débloqué aujourd'hui), prêts en cours, historique, badge ◐ « Charte non acceptée ».

### B8 · Incidents & paiements — `27:2` — `/admin/incidents?onglet=`
- Onglets À rembourser / ◐ Payés / ◐ Signalements (réutilise la table du tableau de bord).
- **Carte d'incident** : « Ajuster » (◐ saisie inline, baisse seulement) ▶ AJUSTER_MONTANT ; « Enregistrer le paiement » ▶ REMBOURSEMENT. Lydia : boutons verrouillés « Réservé à Sandrine » → refus R12.
- Payés récemment (Ligne de tableau · Paiement). Forfaits par type (Ligne de forfait, bouton modifier ▶ MODIFIER_FORFAIT, Sandrine).

### B9 · Consommables — `84:2451` — `/admin/consommables`
- **Carte de stock** Normal/Bas (bascule automatique selon seuil) avec champ « Comptage de ce lundi ». « Enregistrer le comptage » ▶ COMPTAGE (ajoute une ligne à l'historique).

### B10 · Salles — `87:2645` — `/admin/salles`
- Filtres Toutes / À régler. **Ligne de tableau · Salle** : compteur − / + (local), « Valider » ▶ VERIFIER_SALLE ; statut Complet / n manquant(s) / n en trop.
- Panneau « Vérification de {mois} » : salles vérifiées aujourd'hui / total, jauge, liste « À régler » (écarts + signalements de salle).

### B11 · Imports Calc — `88:2861` — `/admin/imports`
- Inventaire : ◐ zone de dépôt (fichier .ods/.csv — on peut parser un CSV réel, sinon « fichier exemple ») → aperçu **Ligne d'import** Valide/Erreur → « Importer les n lignes valides » ▶ IMPORT_INVENTAIRE / Annuler. ◐ Succès : « Import terminé » + lien Matériel.
- Liste des classes : pastilles actuelles, zone de dépôt → ◐ aperçu → ▶ IMPORT_CLASSES.

### B12 · Réglages — `89:3051` — `/admin/reglages`
- Charte : **liste numérotée, éditable article par article** (champ titre + zone de texte par article), un **seul bouton « Enregistrer la charte »** pour l'ensemble ▶ MODIFIER_CHARTE (Sandrine). Lydia : lecture seule + cadenas → refus R12.
- Notifications : 2 **Lignes de réglage** avec Interrupteur ▶ REGLAGE. Rôles et accès (statique depuis `people`).

---
## C. Panneau de démo (hors Figma, discret)
Bouton flottant « Démo » (coin bas-gauche, touche `D`) ouvrant un panneau :
- **Surface** : App mobile / Back-office / Côte à côte (desktop ≥ 1600 px).
- **Persona app** : Inès, Tom, Léa, Yanis, Sarah, Noah (1re connexion), M. Diallo, Mme Roche. **Utilisateur BO** : Lydia, Cyrianne, Sandrine.
- **Horloge** : heure courante, « 16h30 », « Fin de journée », « Lendemain 8h ».
- **Annuler** (⌘Z, pile d'historique) · **Réinitialiser la démo** (recharge `seed.json`).
- **Toast résultat** après chaque action : Accepté/Refusé, message, code règle (R01…). Les notifications destinées à la persona app s'affichent aussi en bannière dans le téléphone.
- Page `/` : choix App mobile / Back-office / Côte à côte + QR code vers `/app` pour ouvrir sur téléphone.
