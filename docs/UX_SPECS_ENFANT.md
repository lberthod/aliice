# 📐 Spécifications UX Enfant - Aliice

**Cible** : Enfants 2.5-5 ans | **Contexte** : Apprentissage vocabulaire thaï ludique

---

## 1. Principes Fondamentaux

### **1.1 Design pour le Jeune Enfant**
- ✅ Couleurs vives, contrastes forts (WCAG AA minimum pour tous les textes)
- ✅ Emojis ≥ 80px (assez grands pour petit doigt maladroit)
- ✅ Zones de clic ≥ 44px × 44px (recommandation mobile pour enfants)
- ✅ Polices arrondies (Baloo 2, Mali) - aucune police étroite/serrée
- ✅ Animations douces (pas de clignotement > 3 Hz)
- ✅ Aucun bruit agressif/punitif

### **1.2 Cognitif**
- Attention enfant = 5-10 min → sessions courtes naturelles
- Répétition = apprentissage → pas cacher les erreurs, juste corriger gentiment
- Immédiateté du feedback (< 500ms optimal)
- Succès > Correction (ratio minimum 70% réussite attendu)

### **1.3 Accessibilité**
- Contraste minimum 4.5:1 (texte sur fond)
- Pas de texte en rouge seul (couleur-blind friendly)
- Haptique + audio + visuel pour tous les feedbacks
- Support VoiceOver/TalkBack (aria-labels)

---

## 2. Composants UI & Interactions

### **2.1 Écran de Démarrage**
```
┌─────────────────────────┐
│        🐼 Aliice        │
│   เรียนภาษาไทย 🇹🇭     │
├─────────────────────────┤
│  Votre Profil:          │
│  [Avatar 🐯] [Edit]     │
│  "Mon Enfant"           │
│                         │
│  📊 Stats:              │
│  ⭐ 45 mots appris      │
│  🔥 Streak: 3 jours     │
│  📈 Niveau 7            │
├─────────────────────────┤
│  [🎮 Continuer] [NEW]   │
│  [👤 Profil]  [⚙️ Info] │
└─────────────────────────┘
```

**Spécifications** :
- Avatar: 100px (touchable, changeable)
- Boutons: 60px minimum, avec icône + texte
- Texte principal: 24-28px (Mali font)
- Stat display: rétrospectif "Aujourd'hui" vs "Meilleur"

---

### **2.2 Écran Sélection Catégorie**
```
┌─────────────────────────┐
│   🎯 Choisir catégorie  │
│      (ou "Tous")        │
├─────────────────────────┤
│  [🐘 Animaux] [🍓 Fruit]│
│  [🎨 Couleurs][🔢 Nomb.]│
│  [👕 Vêtements]...      │
│  [🔒 Bloqué]            │
│      (débloque à 60%)    │
├─────────────────────────┤
│ 📊 Progress catégorie   │
│ [████░░░░] 6/10 mots    │
└─────────────────────────┘
```

**Spécifications** :
- Bouton catégorie: 80×80px avec icône 60px
- Grille: 2 colonnes max (iPhone, petit doigt)
- Lock icon + tooltip: "Maîtrisez les catégories précédentes"
- Progress bar: 40px height, visible sans clic

---

### **2.3 Écran de Jeu (Core Loop)**
```
┌──────────────────────────┐
│ 🏠 ⏱️ 2:30  Animaux 5/10  │
├──────────────────────────┤
│         🐼 (mascotte)    │
│      "Écoute!"           │
├──────────────────────────┤
│   🔊 Réécouter [btn 60px]│
├──────────────────────────┤
│ ┌─────────┐ ┌─────────┐ │
│ │   🐕    │ │   🐈    │ │
│ │ Choix 1 │ │ Choix 2 │ │
│ └─────────┘ └─────────┘ │
│ ┌─────────┐ ┌─────────┐ │
│ │   🐷    │ │   🦁    │ │
│ │ Choix 3 │ │ Choix 4 │ │
│ └─────────┘ └─────────┘ │
└──────────────────────────┘
```

**Spécifications** :
- Emoji choix: ≥ 100px
- Zones clic: 120×120px (padding autour)
- Mascotte change d'état: idle→listen(🦻)→happy(🥳)/sad(😢)
- Haut-parleur: 60px, sur contraste visible
- Timer en haut-droit (petit, discret, max 3min/session)
- Barre progression catégorie (discret, bas)

---

### **2.4 Feedback Correcte**
```
Réponse juste:
├─ VISUEL:
│  ├─ Bordure VERTE 5px autour emoji
│  ├─ Confetti temporaire (500ms)
│  └─ Emoji cible "bounce" animation
├─ AUDITIF:
│  ├─ Son joyeux (gamme: Do5-Mi5-Sol5, +200ms)
│  └─ Félicitation (aléatoire): "เก่งมาก!" / "ดีมาก!" / "✨"
├─ HAPTIQUE:
│  └─ Vibration: [50, 50, 100] (tap-tap-longer)
└─ TIMING:
   ├─ Feedback immédiat (< 100ms)
   ├─ Pause 1s avant question suivante
   └─ Pas de "compte à rebours" agressif
```

**Spécifications** :
- Couleur verte: #4dc87a (WCAG AA sur fond blanc)
- Animation bounce: 400ms cubic-bezier(0.68, -0.55, 0.265, 1.55)
- Confetti: 30 particules, max 500ms durée
- Son: triangle wave 523.25Hz (C5), 150ms

---

### **2.5 Feedback Incorrect**
```
Réponse fausse:
├─ VISUEL:
│  ├─ Bordure ROUGE 5px autour réponse
│  ├─ Emoji correct "flash" (pulse gentle)
│  └─ Mascotte triste 😢 (500ms)
├─ AUDITIF:
│  ├─ Son doux (pas punitif): 330Hz → 247Hz
│  ├─ TTS répète le mot (reassurance)
│  └─ Pas de "wrong" / "bad"
├─ HAPTIQUE:
│  └─ Vibration douce: [30, 20, 30]
└─ TIMING:
   ├─ Pause 1.5s avant rejouer
   └─ Enfant peut recliquer immédiatement
```

**Spécifications** :
- Couleur rouge: #ff7ca8 (WCAG AA)
- Animation pulse: 600ms ease-in-out
- Son: sine wave 330Hz puis 247Hz, pas d'alarme
- TTS: même pitch/rate que l'intro

---

### **2.6 Session Summary Screen** (Nouveau)
```
┌──────────────────────────┐
│     🎉 Bravo! 🎉        │
│                          │
│  Session d'aujourd'hui:  │
│  ───────────────────    │
│  ✅ 12 mots appris      │
│  🔥 Streak: 8 correct   │
│  ⚡ Temps moyen: 2.5s   │
│  🎯 Accuracy: 89%       │
│                          │
│  🏆 Badges gagnés:      │
│  [✨] [🔥] [📚]         │
│                          │
│  📈 Nouvelle catégorie   │
│     débloquée! 🎊       │
│     "Fruits"             │
│                          │
│  [🏠 Accueil]           │
│  [🔄 Rejouer]           │
│  [👤 Profil]            │
└──────────────────────────┘
```

**Spécifications** :
- Apparaît après 20 questions OU 10 minutes OU déconnexion
- Affiche: score session, streak, accuracy, badges
- Emoji célébration: 80px, animation pop-in
- Boutons: 60px, deux actions principales

---

### **2.7 Sécurité Enfant (Child Lock Mode)**

#### **Activation**
- Automatique après 5 minutes d'inactivité
- Manuel: long-press (2s) sur bouton home

#### **Comportement en mode Lock**
```javascript
{
  "bloquer": {
    "gestes_os": "Swipe up (home), back gesture",
    "boutons_systeme": "Home, Recent apps",
    "sortie_app": "Confirmez avec code enfant",
    "navigation": "Bloquée (sauf bouton Retour jeu)"
  },
  "timer": {
    "max_session": "15 min sans pause",
    "pause_apres": "10 bonnes réponses → écran repos",
    "cooldown_click": "300ms (anti-spam bouton)"
  },
  "affichage": {
    "icone_lock": "🔒 en haut-gauche (discret)",
    "desactiver": "Code parent (4 chiffres) ou timeout",
    "timeout": "Automatique après 30s inactivité"
  }
}
```

---

## 3. Progression Pédagogique (Difficulty Curve)

### **3.1 Nombre de Choix**
| Niveau | Choix | Distracteurs | Stratégie |
|--------|-------|--------------|-----------|
| 1 | 2 | Très différents | "chat" vs "pomme" |
| 2 | 3 | Différents | "chat" vs "chien" vs "pomme" |
| 3 | 4 | Mixtes | 50% même catégorie |
| 4+ | 4 | Difficiles | 70% même catégorie |

### **3.2 Vitesse TTS**
- Niveau 1-2: `rate: 0.75` (plus lent)
- Niveau 3+: `rate: 0.85` (normal)
- Optionnel: "Slow mode" toggle si erreurs fréquentes

### **3.3 Déblocage Catégorie**
- Seuil: 60% mots maîtrisés (répondus 3× correctement)
- Notification: "🎊 Bravo! 'Fruits' débloqué!"
- Pas de pressure (peut jouer catégories précédentes toujours)

---

## 4. Accessibilité Complète

### **4.1 Couleurs & Contraste**
```
Palettes par catégorie:
├─ Animaux:    #ffe9a8 fond → #2c2c3a texte (7.2:1) ✅
├─ Fruits:     #ffcfe0 fond → #2c2c3a texte (6.1:1) ✅
├─ Couleurs:   #ffccf0 fond → #2c2c3a texte (5.8:1) ✅
└─ OK: Tous WCAG AA+
```

### **4.2 Accessibilité Screen Reader**
```html
<!-- Exemple pour emoji card -->
<button 
  class="emoji-choice"
  aria-label="Chat, แมว"
  aria-pressed="false"
  role="radio"
>
  🐕
</button>
```

### **4.3 Support Tactile Enfant**
- Zones de clic: 44-48px minimum
- Pas de "double-tap to zoom" (désactiver)
- Pas de hover-required (mobile)
- Feedback: vibration + son obligatoire

### **4.4 Support Langue**
- TTS auto-détecte langue device (th-TH priorité)
- Fallback: anglais si thaï indisponible
- UI: français/anglais/thaï au choix

---

## 5. Événements & Analytics (Optionnel)

### **Événements à tracker** (pour analytics parent)
```javascript
{
  "session_start": { timestamp, level, category },
  "question": { correct, time_ms, level, word_id },
  "category_unlocked": { category, timestamp },
  "badge_earned": { badge_id, timestamp },
  "session_end": { duration, accuracy, badges_earned }
}
```

---

## 6. Checklist d'Implémentation

- [ ] Emojis ≥ 80px
- [ ] Boutons ≥ 60px × 60px (44px min)
- [ ] Child lock (timer 15min + gestion gestes)
- [ ] Smart distractors (niveau-dependent)
- [ ] Session summary screen
- [ ] Haptique feedback (vibration)
- [ ] Contraste WCAG AA tous éléments
- [ ] TTS thaï + English fallback
- [ ] No redirect/navigation hors app
- [ ] Pause après 10 bonnes réponses
- [ ] Analytics simples (JSON localStorage)

---

## 7. Test & Validation

### **Avec enfants réels** (3-5 ans)
- Tester avec 5-10 enfants (30 min chacun)
- Mesurer: engagement, frustration, compréhension
- Itérer sur timing (trop rapide?)

### **Avec parents**
- Vérifier stats session lisible
- Tester mode "secure" ne peut pas être contourné
- Feedback sur durée session idéale

---

**Version**: 1.0 | **Date**: 2026-04-20 | **Status**: Spécifications de base
