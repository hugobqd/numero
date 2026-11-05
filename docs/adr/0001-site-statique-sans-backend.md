# Site statique sans backend, données des joueurs dans le navigateur

Numero est un site statique (Vite, TypeScript, Svelte) publié sur GitHub Pages, sans serveur ni base de données : la progression, la collection et les stats de chaque joueur vivent uniquement dans son navigateur (localStorage). Ce choix permet de prototyper et de publier sans coût ni maintenance, et sans collecter de données personnelles. C'est une décision **provisoire** : un joueur qui change d'appareil ou vide son navigateur perd tout.

## Quand la remettre en cause

Un backend devient nécessaire dès qu'on veut l'un de ces trois éléments : synchroniser un joueur entre plusieurs appareils, mesurer les taux de réussite réels pour calibrer la difficulté des fiches, ou ajouter des fonctions sociales (classements, défis entre amis). On s'attend à ce que ce soit rapide.
