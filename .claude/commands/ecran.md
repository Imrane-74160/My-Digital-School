---
description: Construire ou mettre à jour un écran à partir de sa fiche et du Figma
argument-hint: <code écran ex. A3 ou B7, ou nom>
---
Écran demandé : $ARGUMENTS

1. Lis la fiche de l'écran dans `docs/03-ecrans.md` (route, nœud Figma, actions, états à dériver) et les règles concernées dans `docs/02-regles-metier.md`.
2. Avec le MCP Figma, sur le fichier `lN2EFZzYHfTuAW9agcHstV` et le nœud indiqué : `get_design_context` puis `get_screenshot`. Reprends les textes mot pour mot et exporte les images nécessaires dans `src/assets/`. Si le Figma diffère de la fiche, suis le Figma et signale l'écart.
3. Réutilise les composants de `src/design-system/` (en créer un seulement s'il existe dans la page Composants du Figma). Aucune couleur ni taille en dur : tokens `--mds-*`.
4. Branche chaque action sur `dispatch` du domaine ; affiche les refus via le toast résultat ; aucune donnée en dur (tout vient du store).
5. Construis les états « à dériver » listés dans la fiche, avec les composants existants.
6. Vérifie : `npm run build`, capture Playwright à la taille du Figma (390×844 ou 1440×839), compare avec la capture Figma, corrige les écarts visibles. Coche l'écran dans `docs/07-plan-de-dev.md`.
