---
description: Jouer un parcours de test de bout en bout (Playwright) et corriger
argument-hint: <numéro de parcours, ex. 5>
---
Parcours P$ARGUMENTS de `docs/06-parcours-de-test.md`.
1. Écris ou mets à jour `e2e/parcours-$ARGUMENTS.spec.ts` (démo réinitialisée au début, étapes et vérifications du document).
2. Lance-le. En cas d'échec, trouve si le problème vient du domaine (règle mal portée → test Vitest d'abord) ou de l'écran, corrige, relance jusqu'au vert.
3. Ne modifie jamais une règle de `docs/02-regles-metier.md` pour faire passer un test : signale plutôt l'incohérence.
