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
