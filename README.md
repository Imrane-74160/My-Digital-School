# Prêts MDS · pack de démarrage pour Claude Code

Tout ce dont Claude Code a besoin pour développer le prototype. Figma : https://www.figma.com/design/lN2EFZzYHfTuAW9agcHstV/Maquette-MDS

## Contenu
| Fichier | Rôle |
|---|---|
| `CLAUDE.md` | Mémoire du projet, lue automatiquement à chaque session : contexte, stack, règles de travail |
| `.mcp.json` | Déclare le serveur MCP Figma pour ce projet |
| `.claude/commands/` | Commandes `/ecran`, `/verifier`, `/scenario` |
| `docs/01-produit.md` | Problème, personas, périmètre, hors périmètre, glossaire |
| `docs/02-regles-metier.md` | Règles R01–R16, statuts, actions, droits, horloge |
| `docs/03-ecrans.md` | 22 écrans + panneau démo : route, nœud Figma, actions, états à dériver |
| `docs/04-design-system.md` | Principes, interactions, inventaire des composants Figma, icônes |
| `docs/05-donnees-demo.md` + `data/seed.json` | Jeu de démo cohérent avec les écrans |
| `docs/06-parcours-de-test.md` | 9 parcours = critères d'acceptation |
| `docs/07-plan-de-dev.md` | Phases à cocher |
| `design/tokens.css` · `tokens.json` | Variables exportées du Figma |
| `reference/` | Moteur de règles validé (JS), ancien prototype HTML (logique seulement), logos |

## Mise en place (10 minutes)
1. Crée un dossier vide, par ex. `prets-mds`, et **décompresse ce zip dedans** (CLAUDE.md doit être à la racine).
2. Dans ce dossier : `git init` puis un premier commit (pour pouvoir revenir en arrière).
3. Lance `claude` dans le dossier. Accepte le serveur MCP « figma » proposé, puis tape `/mcp` → figma → **Authenticate** et connecte ton compte Figma (celui qui a accès au fichier).
   Si le serveur n'est pas proposé : `claude mcp add --transport http figma https://mcp.figma.com/mcp`.
4. Colle le premier message ci-dessous en remplaçant le lien.

## Premier message à coller dans Claude Code
```
Voici le Figma validé du projet : https://www.figma.com/design/lN2EFZzYHfTuAW9agcHstV/Maquette-MDS

Lis CLAUDE.md puis tous les fichiers de docs/ et data/seed.json. Vérifie que tu accèdes au Figma
(get_screenshot du nœud 8:950 et du nœud 28:2). Ensuite, sans coder :
1. reformule en 10 lignes ce que tu vas construire,
2. liste tes questions ou les incohérences entre Figma, règles et données,
3. propose le découpage de la Phase 0 et de la Phase 1 de docs/07-plan-de-dev.md.
Attends ma validation avant d'écrire du code.
```

## Ensuite, phase par phase
- `Passe en mode plan et démarre la Phase 0.` → valide le plan → laisse coder → `/verifier` → commit.
- Phase 1 (règles) : exige que les tests Vitest passent avant toute UI.
- Phases 3 et 4 : un écran à la fois, `/ecran A3`, `/ecran B2`… puis `/verifier`.
- Phase 5 : `/scenario 1` à `/scenario 9`, puis test sur ton téléphone (déploiement Vercel ou `npm run dev -- --host` sur le même Wi-Fi).

## Conseils
- Une session Claude Code = une phase ou quelques écrans. Utilise `/clear` entre deux gros blocs : CLAUDE.md et les docs gardent le contexte.
- Si Claude invente une fonctionnalité, rappelle-lui la section « Ne pas faire » de CLAUDE.md.
- Si tu modifies le Figma ou une règle, mets à jour le doc concerné **avant** de redemander du code.

---

## Le prototype est construit

Toutes les phases de `docs/07-plan-de-dev.md` sont faites : l'app mobile (A1→A10), le back-office (B1→B12), le panneau de démo, et les neuf parcours de `docs/06-parcours-de-test.md` joués en automatique.

```bash
npm install
npm run dev        # http://localhost:5173
npm run test       # 135 tests Vitest (moteur de règles, seed, horloge, tokens)
npm run e2e        # 44 tests Playwright (design system, socle, parcours P1→P9)
npm run build      # build statique déployable (Vercel, Netlify, GitHub Pages)
```

### Où aller
| Adresse | Ce qu'on y voit |
|---|---|
| `/` | Choix de la surface + QR code pour ouvrir l'app sur un téléphone |
| `/app` | App mobile (élèves, intervenants) — cadre 390 × 844 sur ordinateur, plein écran sur téléphone |
| `/admin` | Back-office (équipe, direction) — 1440 × 839, utilisable dès 1280 px |
| `/cote-a-cote` | Les deux surfaces en même temps, sur le même état |
| `/design-system` | Galerie des composants, chaque section avec son nœud Figma |

### Piloter la démo
Bouton **Démo** en bas à gauche, ou touche `D` : changer de persona (app et back-office), avancer l'horloge simulée (16h30, fin de journée, lendemain 8h), **annuler** (`⌘Z` / `Ctrl+Z`), **réinitialiser** (recharge `data/seed.json`).

Chaque action passe par le moteur de règles : un refus affiche un toast avec son code de règle (R01→R16). Aucun serveur, aucune base : l'état vit dans le navigateur, sous une clé versionnée sur la version du seed — changer `meta.version` dans `data/seed.json` remet la démo à zéro.
