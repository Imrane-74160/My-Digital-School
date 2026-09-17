# 03 · Écrans, routes et interactions

Lien d'un nœud : `https://www.figma.com/design/lN2EFZzYHfTuAW9agcHstV/Maquette-MDS?node-id=<ID avec tiret>` (ex. `8:950` → `node-id=8-950`).
Les **textes, images et mises en page exacts** se lisent dans Figma (`get_design_context`) : le Figma a pu évoluer depuis ces fiches (ex. photo sur les écrans de connexion, QR code dans le scanner) et c'est lui qui fait foi. Ce document dit **quoi brancher** : données, actions, navigation, états non dessinés.

Légende : ▶ action moteur (`docs/02-regles-metier.md`) · → navigation · ◐ état à dériver (non dessiné, construit avec les composants existants, sans nouveau style)

---
## A. App mobile (390 × 844) — page Figma `15:3`
Barre de navigation (5 onglets) : Accueil `/app` · Matériel `/app/materiel` · **Scanner** `/app/scanner` (bouton blanc central) · Alertes `/app/alertes` · Profil `/app/profil`. Onglet actif = variante `Actif`.

### A1 · Connexion — `91:711` — `/app/connexion`
- Logo, visuel (image exportée du Figma), accroche, bouton « Se connecter avec mon compte école », mention sécurisée.
- Clic → connecte la persona choisie dans le panneau démo (Inès par défaut) → Charte si jamais acceptée, sinon Accueil.

### A2 · Charte — `91:838` — `/app/charte`
- 7 articles (texte = `settings.charte`, modifiable dans le back-office), case « J'ai lu la charte… », bouton Continuer **désactivé tant que la case n'est pas cochée**.
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
- Listes groupées par catégorie, une **Ligne de catalogue** par **type** de matériel : nom, badge (Disponible · « n disponibles » · Indisponible · Ta demande · Chez toi), mode de remise (Remise par l'équipe / Libre-service / lieu).
- Type avec unité disponible → Fiche. Type indisponible → bouton cloche ▶ PREVENEZ_MOI (◐ état « Tu seras prévenu(e) »).
- Jamais le nom de l'emprunteur d'un matériel indisponible.

### A5 · Fiche + feuille Emprunter — `30:2` — `/app/materiel/:itemId`
- Fiche : retour, visuel, nom, badges (dispo, « N1 · remise par l'équipe »), informations (où le trouver, remise, retour, forfait).
- CTA contextuel : Disponible → ouvre la **feuille Emprunter** · Chez toi → « Rendre ce matériel » · Demande envoyée → message · Indisponible → « Me prévenir à son retour » · Retiré → « Momentanément retiré du prêt » · Soir → « Bureau fermé » (désactivé).
- Feuille (voile + feuille qui monte 320 ms) : forfait total et par composant (**Ligne de montant** Sombre), case d'acceptation obligatoire, consigne N1/N2, CTA « Demander la remise » (N1) / « Emprunter » (N2).
- Intervenant : ◐ contrôle segmenté « Pour moi / Pour ma classe » + classes (`classes`) + aide « Tu seras responsable du matériel et seul à pouvoir le rendre. »
- ▶ EMPRUNTER → ferme la feuille, retour Accueil, toast résultat.

### A6 · Rendre — `31:2` — `/app/rendre/:itemId`
- Carte du matériel, Étape 1 « Vérifie le contenu » (kit : une ligne par composant cochable ; sinon « Tout le contenu est là » + « Rien n'est abîmé »), lien « Un souci ? Signaler un problème » → Signaler.
- Étape 2 « Prends une photo » : ◐ avant (zone pointillée « Prendre la photo ») → après (badge « Photo prise », « Reprendre »). Photo simulée (ou fichier local, jamais envoyé).
- Consigne N2 / ◐ N1 (« l'équipe contrôle avec toi »).
- « Valider le retour » désactivé tant que photo manquante. Composant non coché = `manquant`. ▶ RENDRE → Accueil.

### A7 · Scanner — `92:757` — `/app/scanner`
- Viseur animé (ligne de lecture, QR code d'exemple repris du Figma), consigne, feuille « QR détectés à proximité » : prêts en cours de la persona + matériels disponibles du bureau (max 5), badge d'état.
- Ligne « Chez toi » → Rendre ; autre → Fiche. Fermer → retour arrière.

### A8 · Signaler — `92:874` — `/app/signaler`
- « Sur quoi ? » (liste : mes prêts, salles, autres matériels), « Quel problème ? » (Panne, Casse, Manquant, Déplacé, Autre — une puce active), détails facultatifs, photo facultative.
- « Envoyer le signalement » désactivé sans type. ▶ SIGNALER → Accueil + toast.

### A9 · Alertes — `93:809` — `/app/alertes`
- Onglets Notifications (compteur) / Historique.
- Notifications : groupées Aujourd'hui / Hier / date ; composant **Notification** Lue / Non lue ; ouvrir l'écran marque tout comme lu.
- ◐ Historique : prêts passés de la persona (Rendu, Perdu, Annulé, pour la classe) → Fiche.

### A10 · Profil — `93:942` — `/app/profil`
- Avatar, nom, classe + rôle ; informations (compte, emprunts cette année, charte acceptée le …).
- Relire la charte → Charte (lecture) ; Signaler un problème → Signaler ; Se déconnecter → Connexion.

---
## B. Back-office (1440 × 839) — page Figma `15:2`
Coque commune : **Menu principal** (11 liens, infobulle au survol, lien actif = page courante) + **En-tête de page** (titre, fil d'Ariane, retour → Tableau de bord ; boutons Rechercher / Filtres / Notifications ; compte). Sur le Tableau de bord : pas de retour ni de fil d'Ariane.
Utilisateur par défaut : Lydia (équipe). Le panneau démo permet de passer en Sandrine (direction) ou Cyrianne.

### B1 · Se connecter — `14:950` — `/admin/connexion`
- Mise en page, image et bouton selon le Figma. Clic → Tableau de bord avec l'utilisateur choisi dans le panneau démo.

### B2 · Tableau de bord — `8:950` — `/admin`
- **À faire maintenant** (Action à faire) : remises à valider → Validations ; photos à contrôler → Contrôle photo ; emprunteur bloqué « Voir » → Emprunteurs (fiche ouverte) ; paiements « Réservé à Sandrine » → Incidents ; signalements « Traiter » → Incidents onglet Signalements. Une ligne n'apparaît que si son compteur > 0.
- **En ce moment** (6 Indicateurs, ton Retard/Attention si > 0) : Sortis, En retard, À valider, Photos, À rembourser, Stock bas.
- **Consommables** : lignes de stock + « Enregistrer le comptage » → Consommables.
- **Prêts en retard** : carte par prêt en retard (échéances « Hier 18h Bloqué », « Ven. 18h Perdu · forfait »), ▶ DEBLOQUER.
- **Récap de 8h** : texte généré depuis l'état (voir `recapText` du moteur).
- **Signalements ouverts** : Ligne de tableau · Signalement, filtre Ouverts/Traités, ▶ TRAITER_SIGNALEMENT (bouton ✓). Lignes de salle → Salles.

### B3 · Validations sur place — `19:2` — `/admin/validations`
- Onglets Tout / Remises / Retours. **Carte de validation** Remise : ▶ VALIDER_REMISE. Retour : puces composants « Manquant ? » (bascule) → « Conforme » ▶ VALIDER_RETOUR ou « Créer l'incident · {montant du composant} » ▶ VALIDER_RETOUR{manquant}.
- Colonne « Niveau 1 » : 4 Règles (statique). ◐ Vide : « Tout est traité. Rien ne vous attend. »

### B4 · Contrôle photo — `22:2` — `/admin/controle-photo`
- **Carte photo de retour** par photo en attente : badge « Réemprunté par {nom} » si reparti, agrandir (◐ visionneuse plein écran), déclaration (« Déclaré complet » / « Problème signalé : « … » »), puces « Manquant ? », « Photo conforme » ▶ CONTROLER_PHOTO / « Créer l'incident · {montant} ».
- **Contrôlées récemment** : Ligne de tableau · Contrôle (résultat Conforme / Incident · montant). ◐ Vide.

### B5 · Matériel — `24:3` — `/admin/materiel?id=`
- Recherche (nom ou QR), filtres (Tout, Niveau 1, Niveau 2, Disponibles, Sortis, Retirés), catégorie, « Ajouter un matériel » (◐ panneau/formulaire : nom, catégorie, niveau, lieu, forfait ▶ AJOUTER_MATERIEL).
- **Ligne de tableau · Inventaire** (survol, sélection) → **Fiche matériel** : QR (généré depuis le code), statut actuel + action contextuelle (Valider la remise…), forfait par composant (Sandrine : champs éditables ▶ MODIFIER_FORFAIT ; Lydia : lecture + cadenas), total, « Imprimer l'étiquette » (impression navigateur d'une étiquette QR), « Retirer du prêt » ▶ RETIRER / ◐ « Remettre en service » ▶ REMETTRE.

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
- Charte (Sandrine : zone de texte éditable + « Enregistrer la charte » ▶ MODIFIER_CHARTE ; Lydia : lecture + cadenas).
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
