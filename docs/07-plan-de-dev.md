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

## Phase 1 · Domaine (sans UI) — fait
- [x] Types TS depuis `data/seed.json` (`types.ts`) ; `chargerSeed()` avec validation explicite par chemin de champ + invariants (`seed.ts`)
- [x] Port de `reference/engine-prototype.js` → `src/domain/engine.ts` : `dispatch(etat, action)` sur 24 actions, sélecteurs (`raisonDeBlocage`, `forfaitMateriel`, `compteurs`, `construireRecap`, `lignesAFaire`), horloge en dates réelles sans `Date` ni `Intl` (`horloge.ts`)
- [x] 128 tests Vitest : 1 par règle R01–R16 (cas accepté **et** refusé avec son code), 1 refus par action protégée (17), immuabilité vérifiée avec `toBe`, compteurs KPI, cycles de vie N1 et N2, horloge
- [x] Store Zustand : état, pile d'annulation (25 pas, horloge comprise), persistance `localStorage` sous une clé versionnée, synchro entre onglets, `reinitialiser()`
- **Fini quand** : tous les tests passent ; les compteurs calculés correspondent aux situations de `docs/05-donnees-demo.md`. ✅
- **Vérifié** : Sortis 12 · En retard 1 · À valider 4 · Photos 3 · À rembourser 2 (94 €) · Stock bas 1 · Signalements ouverts 4 · Bloqués 1, et le récap de 8h reproduit les 7 lignes du Figma.

## Phase 2 · Design system — en cours
- [x] **Icônes** : table nom Figma → `lucide-react` générée depuis `docs/04` (63 icônes). « Trépied » repris du Figma en SVG. Test Vitest : toutes les icônes du seed et du moteur résolvent.
- [x] **Bouton** (`43:101`) : 24 variantes (Type × Taille × État), géométrie vérifiée au pixel contre le Figma — M 102,5 × 40 (Figma 103 × 40), L 117,1 × 52 (Figma 117 × 52), rayons 20/24, paddings 16/16 et 16/20, gap 8, libellé Inter 500 14/18 et 16/18, halos de survol turquoise et orange.
- [x] **Bouton icône** (`44:89`) · **Badge de statut** (`45:89`) · **Pastille** (`45:96`) · **Avatar** (`45:110` + taille 84) · **Pictogramme** (`59:150`) · **Puce de catégorie** (`61:132`) · **Puce de composant** (`45:130`) — géométrie, paddings, rayons, typo et couleurs vérifiés valeur par valeur
- [ ] Champ · Case à cocher · Interrupteur · Onglet · Liste déroulante · Infobulle · Lien de navigation · Onglet de navigation mobile
- [ ] Structure : Barre d'état · Barre de navigation mobile · Menu principal · En-tête de page · En-tête de carte · Cellule d'en-tête · Titre de section
- [ ] Tableaux : les 8 lignes de tableau + Ligne d'import
- [ ] Cartes back-office : Indicateur · Action à faire · Ligne de stock · Carte de stock · Règle · Prêt de classe · Ligne de forfait · Carte d'incident · Ligne de réglage · Carte photo de retour · Carte de validation
- [ ] Cartes mobile : Carte de prêt · Raccourci · Ligne de catalogue · Ligne d'information · Étape · Matériel détecté · Ligne de montant · Case avec libellé · Notification · Action du compte
- [x] Page `/design-system` = galerie, chaque section portant le lien de son nœud Figma
- **Fini quand** : chaque section a été comparée en capture avec Figma et les écarts corrigés.
- **Méthode retenue** : pour chaque composant, `get_design_context` sur son nœud, puis **mesure chiffrée** du rendu (boîte, rayon, padding, gap, police, couleurs calculées) contre les valeurs du Figma — pas une comparaison à l'œil. Ces relevés sont figés dans `e2e/design-system.desktop.ts` : toute dérive casse `npm run e2e`.
- Seule tolérance : la **largeur** d'un élément dimensionné par son texte (± 2 px), car elle dépend des métriques de la police. Hauteurs, rayons, paddings, gaps, graisses et couleurs sont exacts.

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
