# Prêts MDS — mémoire projet pour Claude Code

Application de prêt de matériel du campus MyDigitalSchool : une **app mobile** (élèves, intervenants) et un **back-office** (équipe pédagogique, direction).
Ce dépôt construit un **prototype complet et testable** : toutes les fonctionnalités marchent, mais **sans serveur ni base de données**. Les données vivent dans le navigateur (état local persistant) et partent d'un jeu de démo.

## Sources de vérité (dans cet ordre)
1. **Figma** « Maquette-MDS » : https://www.figma.com/design/lN2EFZzYHfTuAW9agcHstV/Maquette-MDS (fichier `lN2EFZzYHfTuAW9agcHstV`) : écrans, composants, textes, couleurs, images.
   Repères par identifiant de nœud (les noms de pages et de frames peuvent évoluer) : Design system `40:2` · Composants `40:3` · Back-office `15:2` · App mobile `15:3`. Chaque écran a son identifiant dans `docs/03-ecrans.md`.
   **Le Figma est la version la plus récente** : s'il diffère d'une description des docs (image, texte, mise en page), suivre le Figma. Les images (photos, QR code…) s'exportent depuis Figma via le MCP et vont dans `src/assets/`.
2. **Règles métier** : `docs/02-regles-metier.md` (R01–R16, statuts, droits, temps). En cas de doute, la règle gagne sur l'écran.
3. **Écrans et interactions** : `docs/03-ecrans.md` (route, nœud Figma, contenu, actions, états à dériver).
4. **Design system** : `docs/04-design-system.md` + `design/tokens.css` (valeurs exportées de Figma).
5. **Données de démo** : `data/seed.json` (cohérentes avec le Figma). Les compteurs affichés sont **calculés** depuis l'état, jamais codés en dur.
6. **Référence logique** : `reference/engine-prototype.js` = moteur pur déjà validé lors des ateliers. À porter en TypeScript, pas à copier-coller tel quel. `reference/prototype-full.html` sert uniquement à comprendre la logique : **son style est obsolète**.

## Stack (décidée)
- Vite + React + TypeScript (strict), React Router
- État : Zustand + `persist` (localStorage) ; synchro entre onglets (événement `storage`) pour ouvrir l'app et le back-office côte à côte
- Styles : Tailwind CSS v4 branché sur `design/tokens.css` (variables `--mds-*`), aucune couleur en dur
- Icônes : `lucide-react` (trait 1,5) · Polices : `@fontsource` Bricolage Grotesque, Inter, JetBrains Mono
- Animations : transitions CSS ; `motion` seulement pour les feuilles (bottom sheets)
- Tests : Vitest (moteur de règles) + Playwright (parcours de `docs/06-parcours-de-test.md`)
- Pas de backend, pas de Supabase, pas d'API. Déploiement statique possible (Vercel/Netlify) pour tester sur téléphone.

## Architecture attendue
```
src/
  domain/        # moteur pur : types, seed loader, reducer dispatch(state, action) -> {state, ok, msg, rule, events}
  store/         # Zustand : état, historique (annuler), persistance, horloge simulée
  design-system/ # composants = composants Figma (mêmes noms, mêmes variantes)
  app-mobile/    # écrans /app/*
  back-office/   # écrans /admin/*
  demo/          # panneau de démo (persona, horloge, annuler, réinitialiser, toast résultat)
```
- `domain/` n'importe **jamais** React, le DOM ou le store.
- Chaque action utilisateur passe par `dispatch`. Un refus renvoie un message + code de règle, affiché dans un toast.

## Conventions
- Interface 100 % en français, textes repris **mot pour mot** du Figma.
- Vocabulaire métier en français dans `domain/` (EMPRUNTER, VALIDER_REMISE, statuts `remise_a_valider`…), code technique en anglais.
- Composants React nommés comme dans Figma, variantes en props typées (`<Bouton type="Principal" taille="M" etat="Défaut" />` ou équivalent anglais documenté une fois dans `design-system/README.md`).
- États interactifs de Figma respectés : survol 120 ms, appui 80 ms, sélection / onglets 200 ms, feuilles 320 ms ; `prefers-reduced-motion` respecté.
- Accessibilité WCAG 2.1 AA : focus visible (anneau `Focus/Anneau`), cibles ≥ 44 px sur mobile, rôles ARIA sur onglets / dialogues / interrupteurs.
- Mobile : maquette 390 × 844. Sur desktop, l'app s'affiche dans un cadre de téléphone ; sur téléphone, en plein écran. Back-office : 1440 × 839, utilisable dès 1280 px.

## Ne pas faire
- Ajouter une fonctionnalité absente du Figma ou des règles (ex. réservation, paiement en ligne, emplois du temps V1.1, export).
- Coder un compteur, un montant ou une date « en dur » quand il se déduit de l'état.
- Détacher le style du design system (hex, px arbitraires).

## Commandes
- `npm run dev` · `npm run build` · `npm run test` (Vitest) · `npm run e2e` (Playwright) · `npm run lint`

## Façon de travailler
- Suivre `docs/07-plan-de-dev.md` phase par phase ; cocher les cases au fur et à mesure.
- Pour chaque écran : lire sa fiche dans `docs/03-ecrans.md`, ouvrir le nœud Figma via le MCP Figma (`get_design_context` + `get_screenshot`), coder, puis comparer visuellement (capture Playwright vs capture Figma).
- Commandes projet : `/ecran <nom>`, `/verifier`, `/scenario <n>` (voir `.claude/commands/`).
