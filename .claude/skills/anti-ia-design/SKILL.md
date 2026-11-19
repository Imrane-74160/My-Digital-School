---
name: anti-ia-design
description: Repérer et corriger les tics visuels d'une maquette qui sent le gabarit généré. Complément de no-ai-slop, qui ne couvre que le texte. À utiliser avant de livrer un écran, une page Figma, un guide de style ou un support de soutenance.
---

# Anti-IA, côté visuel

Pour le texte, utiliser `no-ai-slop`. Ce fichier ne traite que ce qu'il ne couvre pas :
la mise en page, et les quelques tics de français que la liste anglaise ne voit pas.

## Les tics visuels

**La symétrie parfaite.** Trois cartes de largeur identique, trois icônes, trois titres
de même longueur. Une page conçue par quelqu'un est asymétrique : une carte large et
deux étroites, parce que leur contenu n'a pas le même poids. Si vos blocs sont tous
égaux, demandez-vous lequel compte vraiment.

**Rien ne domine.** Un écran a un point d'entrée. Si six éléments crient aussi fort,
l'œil ne sait pas où se poser et la page paraît générée. Appuyez-en un, atténuez le reste.

**L'icône décorative.** Une icône par ligne « parce que ça fait propre ». Si elle ne
distingue pas la ligne de sa voisine, elle ne sert qu'à remplir. Enlevez-la.

**L'espacement uniforme.** Le même écart partout aplatit la hiérarchie. Les éléments qui
vont ensemble se serrent, les groupes se séparent. Deux valeurs d'écart dans une carte,
pas une.

**Le même arrondi partout.** Du bouton à la page, le même rayon : signature du gabarit.
Ici, le rayon dit l'échelle. 8 pour une pastille, 14 pour une vignette, 36 pour une carte
de back-office. Il varie parce que les objets n'ont pas la même taille.

**Les ombres douces partout.** Une ombre sert à décoller un élément du fond. Si tout est
décollé, plus rien ne l'est. Les cartes du back-office n'ont pas d'ombre : une bordure
noire à 8 % suffit.

**Le dégradé violet-bleu.** Et ses cousins : le fond pastel diagonal, le glassmorphisme,
la grille de cartes toutes identiques. Ce sont les réglages par défaut des générateurs.
La charte MDS est turquoise et anthracite, avec des accents orange, rose et bleu.

**Les fausses données.** « Lorem », « Nom du produit », « 1 234 », « John Doe ».
Prenez `data/seed.json` : Yanis Benali, PC de prêt #02, 450 €, hier 18h. Les vraies
données ont des longueurs inégales, et c'est ce qui révèle les problèmes de mise en page
avant la mise en production.

## Les tics de français que la liste anglaise ne voit pas

| Tournure | Quoi mettre |
|---|---|
| « permet de », « offre la possibilité de » | un vrai verbe : calcule, bloque, affiche |
| « au cœur de », « véritable », « incontournable » | rien, c'est du communiqué |
| « il est important de noter que » | coupez, dites la chose |
| « fluide », « intuitif », « robuste », « optimisé » | un chiffre, ou rien |
| « En résumé », « Pour conclure » | supprimez le paragraphe |
| le rythme ternaire (« clair, net et précis ») | gardez-en deux, ou quatre |

Le tiret cadratin vaut aussi en français, et plus encore : on l'utilise peu en typographie
française courante. Une virgule, une parenthèse ou un point font le travail.

## Pour ce projet

- Les libellés d'interface viennent du Figma mot pour mot. On ne « reformule pour plus de
  clarté » qu'avec un arbitrage noté dans `docs/03-ecrans.md`.
- Les chiffres viennent de l'état. Citer 152 € est juste, écrire « environ 150 € » ne l'est pas.
- Un arbitrage se note avec son coût, pas seulement avec son bénéfice.
- La documentation s'adresse à qui reprend le projet, pas à un jury. Elle a le droit d'être sèche.
