# 07 · Plan de développement

Travailler phase par phase. À la fin de chaque phase : `npm run build`, `npm run test`, captures comparées au Figma, commit. Cocher ici.

## Phase 0 · Socle — fait
- [x] Vite 8 + React 19 + TS 6 strict, React Router 8, Tailwind v4, lucide-react, @fontsource (3 polices), Vitest 5, Playwright, ESLint/Prettier
      (Zustand installé, branché en Phase 1 · TypeScript reste en 6.0 : typescript-eslint exige `<6.1`)
- [x] `design/tokens.css` importé **sans copie**, thème Tailwind mappé sur les 66 variables `--mds-*`
- [x] Routes `/`, `/app/*` (A1→A10), `/admin/*` (B1→B12), `/design-system`, page introuvable ; cadre téléphone 390×844 sur desktop, plein écran < 500 px
- [x] Barre de navigation masquée sur les 5 écrans plein écran du Figma (Connexion, Charte, Rendre, Scanner, Signaler)
- [x] Garde-fous : `design/`, `data/`, `reference/` et la documentation protégés de Prettier ; `src/domain/` interdit d'importer React, le DOM ou le store (règle ESLint)
- **Fini quand** : `npm run dev` affiche la page d'accueil démo avec les polices et couleurs MDS. ✅
- **Vérifié** : lint, format, typecheck, build, 9 tests Vitest, 12 tests Playwright (mobile 390×844 + desktop 1440×839).

## Phase 1 · Domaine (sans UI)
- [ ] Types TS depuis `data/seed.json` ; `loadSeed()`
- [ ] Port de `reference/engine-prototype.js` → `src/domain/engine.ts` : `dispatch(state, action)`, sélecteurs (`blockReason`, `forfait`, compteurs KPI, `recapText`), horloge en date/heure réelles (bureau 8h–18h, 16h30, J+2 18h)
- [ ] 1 test Vitest minimum par règle R01–R16 + refus (état inchangé)
- [ ] Store : état, pile d'annulation, persistance localStorage, synchro entre onglets, `reset()`
- **Fini quand** : tous les tests passent ; les compteurs calculés correspondent aux situations de `docs/05-donnees-demo.md`.

## Phase 2 · Design system
- [ ] Composants de `docs/04-design-system.md` avec toutes leurs variantes et états (survol, appui, focus, désactivé)
- [ ] Page `/design-system` = galerie, comparée section par section à la page Composants (`40:3`)
- **Fini quand** : chaque section a été comparée en capture avec Figma et les écarts corrigés.

## Phase 3 · App mobile
- [ ] A1 Connexion · A2 Charte · A3 Accueil (+ états bloqué / soir / vide / à rembourser)
- [ ] A4 Matériel · A5 Fiche + feuille Emprunter (N1/N2, intervenant) · A6 Rendre
- [ ] A7 Scanner · A8 Signaler · A9 Alertes (+ Historique) · A10 Profil
- [ ] Barre de navigation + transitions + bannière de notification
- **Fini quand** : P1, P4, P6, P8 passent côté app ; captures 390 px conformes au Figma.

## Phase 4 · Back-office
- [ ] Coque (menu, en-tête, connexion) · B2 Tableau de bord
- [ ] B3 Validations · B4 Contrôle photo · B5 Matériel (+ ajout, fiche, étiquette)
- [ ] B6 Prêts · B7 Emprunteurs · B8 Incidents & paiements
- [ ] B9 Consommables · B10 Salles · B11 Imports Calc · B12 Réglages
- **Fini quand** : P2, P3, P5, P7, P9 passent ; captures 1440 px conformes.

## Phase 5 · Démo et finitions
- [ ] Panneau démo (persona, horloge, annuler, réinitialiser, toast résultat avec code règle) + page `/` avec QR vers `/app`
- [ ] Mode côte à côte ; synchro deux onglets vérifiée
- [ ] Accessibilité (clavier, focus, ARIA, contrastes), `prefers-reduced-motion`, aucun scroll horizontal à 390 px
- [ ] Playwright : P1 → P9 verts ; build statique déployable (Vercel/Netlify) ; PWA installable (option)
- **Fini quand** : tout le fichier `docs/06-parcours-de-test.md` passe à la main sur un vrai téléphone + ordinateur.
