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

## L'application est construite

**En ligne : https://imrane-74160.github.io/My-Digital-School/** — redéployé à chaque push sur la branche, après lint et tests.

Toutes les phases de `docs/07-plan-de-dev.md` sont faites : l'app mobile (A1→A10), le back-office (B1→B12), la connexion des deux espaces, et les neuf parcours de `docs/06-parcours-de-test.md` joués en automatique.

```bash
npm install
npm run dev        # http://localhost:5173
npm run test       # 144 tests Vitest (moteur de règles, seed, recalage, sessions, horloge)
npm run e2e        # 45 tests Playwright (design system, socle, parcours P1→P9)
npm run build      # build statique déployable (Vercel, Netlify, GitHub Pages)
```

### Où aller
| Adresse | Ce qu'on y voit |
|---|---|
| `/` | Redirige vers l'app |
| `/app` | App mobile (élèves, intervenants) — cadre 390 × 844 sur ordinateur, plein écran sur téléphone |
| `/admin` | Back-office (équipe, direction) — 1440 × 839, utilisable dès 1280 px |
| `/cote-a-cote` | Les deux surfaces en même temps, sur le même état |
| `/design-system` | Galerie des composants, chaque section avec son nœud Figma |

### Se connecter

Chaque espace a sa propre connexion, par **identifiant MDS** (pas de mot de passe : sans serveur d'authentification, un contrôle fictif ne protégerait rien).

| Espace | Qui | Identifiant à saisir |
|---|---|---|
| `/app` | Élèves | `ines.martin` · `tom.leroy` · `lea.dubois` · `yanis.benali` · `sarah.nguyen` |
| `/app` | Jamais connecté (passe par la charte) | `noah.petit` |
| `/app` | Intervenants | `a.diallo` · `c.roche` |
| `/admin` | Équipe | `lydia` · `cyrianne` |
| `/admin` | Direction (forfaits, paiements, charte) | `sandrine` |

L'adresse complète marche aussi (`ines.martin@my-digital-school.org`). Un compte d'élève est refusé sur `/admin`, et l'inverse (R13).

Les deux sessions sont indépendantes : dans le même navigateur, on peut être Inès sur `/app` et Lydia sur `/admin`, et voir une validation côté équipe apparaître aussitôt côté élève.

### Le temps passe tout seul

L'horloge est celle de la machine. Au passage de 16h30, de 18h et de 8h le lendemain, l'application applique seule le rappel aux emprunteurs, le blocage des retards, la perte à J+2 et le récap du matin — y compris en rattrapant plusieurs jours d'un coup après une absence. Le jeu de données est recalé sur la date du jour au premier chargement.

Pour rejouer une échéance pendant une présentation, sans attendre 18h, la console du navigateur donne accès au moteur :

```js
__mds.getState().executer({ type: 'FIN_DE_JOURNEE' })  // ou ALLER_A_16H30, LENDEMAIN
__mds.getState().reinitialiser()                        // repartir du jeu de données initial
```

### Les deux surfaces côte à côte

`/cote-a-cote` affiche l'app et le back-office dans la même fenêtre, sur le même état : c'est la vue la plus parlante pour montrer une validation qui se propage.
