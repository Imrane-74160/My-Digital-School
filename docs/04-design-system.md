# 04 · Design system

Fichier Figma `lN2EFZzYHfTuAW9agcHstV` : page **Design system** (`40:2`, couleurs, typo, rayons, ombres, mouvement) et page **Composants** (`40:3`, sections documentées, chaque composant avec sa description).
Valeurs : `design/tokens.css` (même nommage que les variables Figma). Charte MyDigitalSchool : turquoise + anthracite, accents orange/rose/bleu, Bricolage Grotesque + Inter + JetBrains Mono.

## Principes
- Un seul bouton **Principal** (turquoise) par zone. Orange = **Alerte** (créer un incident). Rose = retard / casse / incident. Orange clair = attention / à valider.
- Vignette neutre **blanche** quand la ligne est neutre, **teintée** quand elle demande de l'attention.
- Cartes back-office : rayon 36, trait bordure 8 %, pas d'ombre. Cartes mobile : rayon 28, fond blanc.
- Chiffres en Bricolage Grotesque, codes / heures / montants de tableau en JetBrains Mono.
- Icônes Lucide, trait 1,5 px, grille 24 (`lucide-react` : `strokeWidth={1.5}`). Couleur héritée (`currentColor`).

## Interactions (reproduire les variantes Figma)
| Déclencheur | Durée | Exemples |
|---|---|---|
| Survol | 120 ms, ease-out | Bouton (+ Ombre/Survol bouton pour Principal), Lien de navigation (+ Infobulle), lignes de tableau (fond `surface/champ`, rayon 16) |
| Appui | 80 ms | Pressé des boutons, Raccourci, Ligne de catalogue, Onglet mobile |
| Clic / sélection | 200 ms | Onglets, Puce de composant, Case à cocher, Interrupteur, ligne Sélectionnée |
| Feuille / voile | 320 ms `--mds-easing-feuille` | Emprunter, visionneuse photo |
| Focus clavier | immédiat | `Focus/Anneau` 4 px turquoise 35 % |

## Inventaire des composants (id Figma → composant React)
| Section | Composant (id) | Propriétés / variantes |
|---|---|---|
| Icônes | 63 icônes `Icône/…` | Nom (voir liste plus bas) |
| Bouton | Bouton (`43:101`) | Libellé · Afficher l'icône · Icône · Type Principal/Secondaire/Alerte · Taille M(40)/L(52) · État Défaut/Survol/Pressé/Désactivé |
| Bouton icône | Bouton icône (`44:89`) | Icône · Style Doux/Contour/Surface/Plein · État Défaut/Survol/Pressé · 36–56 px |
| Badges | Badge de statut (`45:89`) | Afficher la pastille · Statut Disponible/En cours/À valider/En retard/Bloqué/Retiré/Payé/Incident (libellé libre) |
| Badges | Pastille (`45:96`) | Type Niveau (N1/N2)/Classe (B3)/Montant (Forfait 25 €) |
| Avatar | Avatar (`45:110`) | Initiale · Taille 22/28/32/44/48 · couleur de la personne |
| Puce de composant | Puce de composant (`45:130`) | Nom · État Vérifié/Neutre/Survol/Manquant |
| Onglets | Onglet (`46:76`) | Libellé · Compteur · Afficher le compteur · État Actif/Inactif/Survol (piste `surface/bouton-doux`) |
| Onglets | Liste déroulante (`46:100`) | Valeur · État Défaut/Survol/Ouverte (menu d'options) |
| Champs | Champ (`46:128`) | Texte · Icône · Afficher l'icône · État Défaut/Survol/Focus/Rempli |
| Champs | Case à cocher (`46:144`) | Cochée Oui/Non · État Défaut/Survol |
| Champs | Interrupteur (`89:425`) | Activé Oui/Non |
| Navigation | Infobulle (`49:81`) · Lien de navigation (`49:107`) | Icône · Libellé · État Inactif/Survol/Actif |
| Navigation | Onglet de navigation mobile (`49:124`) | Icône · État Inactif/Pressé/Actif/Scanner |
| Carte | En-tête de carte (`49:129`) | Titre · Sous-titre · Afficher le sous-titre · Icône · Afficher les options |
| Pictogramme | Pictogramme (`59:150`) | Icône · Forme Carré/Rond · Teinte Neutre/Turquoise/Bleu/Orange/Rose/Blanc/Contour · 32–56 px |
| Puce de catégorie | Puce de catégorie (`61:132`) | Libellé · État Active/Inactive/Pressée |
| Structure | Barre d'état (`61:147`) · Barre de navigation mobile (`61:155`) · Menu principal (`61:206`) · En-tête de page (`61:274`) | En-tête : Titre · Retour · Fil d'Ariane |
| Tableaux | Cellule d'en-tête (`61:300`) | Libellé · Alignement Gauche/Droite |
| Tableaux | Ligne de tableau · Inventaire (`62:503`) | Défaut/Survol/Sélectionnée |
| Tableaux | Ligne de tableau · Prêts (`62:317`) · Signalement (`62:366`) · Contrôle (`62:401`) · Paiement (`62:432`) · Emprunteur (`97:3242`, + Sélectionnée) · Salle (`97:3308`) | Défaut/Survol |
| Tableaux | Ligne d'import (`97:3351`) | Contrôle Valide/Erreur |
| Cartes BO | Indicateur (`63:276`) | Valeur · Libellé · Ton Neutre/Retard/Attention |
| Cartes BO | Action à faire (`63:319`) | Titre · Détail · Action Principale/Secondaire/Réservée à Sandrine |
| Cartes BO | Ligne de stock (`63:339`) · Carte de stock (`98:4006`) | Niveau Normal/Bas |
| Cartes BO | Règle (`63:346`) · Prêt de classe (`63:358`) · Ligne de forfait (`63:367`) · Carte d'incident (`63:393`) · Ligne de réglage (`98:4013`) | textes |
| Cartes BO | Carte photo de retour (`63:486`) | État Conforme/Problème |
| Cartes BO | Carte de validation (`63:568`) | Type Remise/Retour |
| Cartes mobile | Carte de prêt (`64:408`) | État En cours/Demande envoyée |
| Cartes mobile | Raccourci (`64:438`) | Défaut/Pressé |
| Cartes mobile | Ligne de catalogue (`64:487`) | Action Détail/Me prévenir · État Défaut/Pressé |
| Cartes mobile | Ligne d'information (`64:494`) · Étape (`64:526`) · Matériel détecté (`98:4066`) | textes |
| Cartes mobile | Ligne de montant (`64:506`) | Fond Clair/Sombre |
| Cartes mobile | Case avec libellé (`64:520`) | Style Liste/Simple |
| Cartes mobile | Titre de section (`64:537`) | Complément Lien/Compteur |
| Cartes mobile | Notification (`98:4033`) | Lecture Lue/Non lue |
| Cartes mobile | Action du compte (`98:4057`) | Type Navigation/Danger |

Construire d'abord ces composants dans `src/design-system/` avec une page `/design-system` (galerie de toutes les variantes) pour comparer avec la page Composants du Figma.

## Icônes (Figma → lucide-react)
École `School` · Cadenas `Lock` · Cadenas ouvert `LockOpen` · Tableau de bord `LayoutDashboard` · Utilisateur validé `UserCheck` · Utilisateurs `Users` · Utilisateur `User` · Image `Image` · Colis `Package` · Échange `ArrowLeftRight` · Reçu `ReceiptText` · Stylo `Pencil` · Porte `DoorOpen` · Import `Upload` · Réglages `SlidersHorizontal` · Retour `Undo2` · Dossier `Folder` · Dossier ouvert `FolderOpen` · Loupe `Search` · Cloche `Bell` · Chevron bas/droit/gauche `ChevronDown/Right/Left` · Liste cochée `ListChecks` · Plus d'options `EllipsisVertical` · Coche `Check` · Croix `X` · Plus `Plus` · Moins `Minus` · Drapeau `Flag` · Horloge `Clock` · Ordinateur portable `Laptop` · Enveloppe `Mail` · Ventilateur `Fan` · Casque audio `Headphones` · Cartes de jeu `GalleryVerticalEnd` · Appareil photo `Camera` · Caméra `Video` · Enregistreur `Radio` · Micro `Mic` · Alerte `TriangleAlert` · Bouclier `Shield` · Pièce de puzzle `Puzzle` · Agrandir `Maximize2` · Historique `History` · Souris `Mouse` · Prise `Plug` · Repère `MapPin` · Imprimante `Printer` · Interdit `Ban` · Lune `Moon` · Portefeuille `Wallet` · Modifier `SquarePen` · Carte SD `HardDrive` · Batterie `Battery` · Étiquette `Tag` · Maison `House` · Grille `LayoutGrid` · Scanner `ScanLine` · Flèche `ArrowUpRight` · Rotation `RotateCcw` · Trépied `Tripod`* · Ampoule `Lightbulb`
\* vérifier l'équivalent exact dans la version de lucide installée ; à défaut, reprendre le SVG depuis Figma (`get_design_context` sur l'icône).

## Logos et images
- `reference/charte/` : logo MyDigitalSchool (SVG + PNG). Le logo du back-office est dans le Menu principal.
- Visuels matériel : pas de photos, pictogrammes sur fond rayé (motif `trait/rayure`) comme dans le Figma.
