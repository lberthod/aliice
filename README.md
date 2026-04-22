# Touche l’image 🎧

Mini-jeu web (Vue 3 + Vite) pour enfant ~3 ans.

Le jeu dit un mot (ex. « banane »), affiche 4 images emoji, et l’enfant doit toucher la bonne.

- ✅ Correct → bordure verte + son joyeux + question suivante
- ❌ Faux → bordure rouge + son doux + le mot est répété, l’enfant peut recliquer
- 🔊 Bouton haut-parleur pour réécouter autant de fois qu’il veut

## Démarrer

```bash
npm install
npm run dev
```

Puis ouvrir l’URL affichée (par défaut http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## Stack

- Vue 3 (`<script setup>`)
- Vite
- Web Speech API pour le TTS français (`fr-FR`)
- Web Audio API pour les petits sons de feedback (pas de fichiers audio externes)
- Emojis comme images (simple, léger, reconnaissable)

## Personnaliser les mots

Éditer `src/words.js`. Chaque entrée :

```js
{ id: 'banana', label: 'banane', emoji: '🍌', category: 'fruits' }
```

## Notes

- Un écran « Commencer » est nécessaire : les navigateurs mobiles bloquent l’audio sans interaction utilisateur.
- Pour passer à des images OpenMoji (SVG) plus tard, remplacer l’élément `.emoji` par une `<img>` pointant sur un asset.
