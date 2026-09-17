---
description: Vérification complète avant de valider une phase
---
1. `npm run lint`, `npm run build`, `npm run test`, `npm run e2e` : tout doit passer, corrige sinon.
2. Pour chaque écran modifié : capture Playwright vs `get_screenshot` Figma ; liste les écarts (espacements, couleurs, textes, icônes) et corrige.
3. Contrôle qu'aucune valeur n'est codée en dur : recherche de `#` hexadécimaux et de `px` hors tokens dans `src/`, compteurs ou montants littéraux dans les écrans.
4. Contrôle accessibilité rapide : tabulation, focus visible, rôles ARIA, aucun défilement horizontal à 390 px.
5. Résume en 5 lignes max : ce qui passe, ce qui a été corrigé, ce qui reste.
