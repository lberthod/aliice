# 📖 Sentences Mode - Aliice

**Feature** : Mode "Complétez la Phrase" | **Déverrouillé** : À 5 catégories découvertes  
**Cible** : Enfants 3.5-5 ans | **Compétence** : Compréhension contextuelle

---

## 🎯 Concept

Après avoir appris les **mots isolés** via le mode classique, les enfants progressent vers **la compréhension en contexte** en complétant des phrases simples en thaï.

### **Avant (Mode Classique)**
```
Écran:  🔊 [Boîte avec mot thaï]
        [🐕] [🐈] [🦁] [🐯]
        
Tâche: "Clique sur le mot qui correspond"
```

### **Après (Sentences Mode)**
```
Écran:  🌳
        "ฉันเห็น ___ ในสวน"
        "Je vois ___ dans le jardin"
        
        [🦋] [🐝]
        [🌸] [🌻]
        
Tâche: "Clique sur ce qu'on voit dans le jardin"
       (Compréhension contextuelle, pas juste reconnaissance)
```

---

## 🎮 Mécanique

### **Déverrouillage**
- Accessible **après 5 catégories débloquées** (3 initiales + 2 par progression)
- Bouton 📖 "Phrases Mode" aparaît dans le picker principal
- Complément au mode classique, pas obligatoire

### **Gameplay**
1. **Écran contexte** : Emoji + phrase thaï + traduction française
2. **4 choix** : Emojis à sélectionner pour compléter la phrase
3. **Feedback** : Identique mode classique (succès/erreur, son, haptic)
4. **Score** : Crédité au score global + nouveau compteur `sentenceScore`

### **Progression**
- Score X / 5 catégories de phrases
- Compatible avec niveaux (niveaux appliqués aussi en mode phrases)
- Streaks et badges fonctionnent

---

## 📚 Types de Phrases

### **Catégories**
```javascript
SENTENCE_CATEGORIES = [
  { id: 'sentences-animal', name: 'Animaux', emoji: '🦁', th: 'สัตว์' },
  { id: 'sentences-fruit', name: 'Fruits', emoji: '🍎', th: 'ผลไม้' },
  { id: 'sentences-color', name: 'Couleurs', emoji: '🎨', th: 'สี' },
  { id: 'sentences-family', name: 'Famille', emoji: '👨‍👩‍👧', th: 'ครอบครัว' },
  { id: 'sentences-body', name: 'Corps', emoji: '👁️', th: 'ร่างกาย' }
]
```

### **Exemples de Phrases**

#### **Animaux**
```
"ฉันเห็น ___ ในสวน"
Je vois ___ dans le jardin
Réponse: 🦋 (papillon)

Contexte emoji: 🌳 (arbre/jardin)
```

#### **Fruits**
```
"___ เป็นผลไม้สีเหลืองและมีรสหวาน"
___ est un fruit jaune et sucré
Réponse: 🍌 (banane)
```

#### **Corps**
```
"ฉันใช้ ___ เพื่อมองเห็น"
J'utilise ___ pour voir
Réponse: 👁️ (oeil)
```

---

## 🧠 Bénéfices Pédagogiques

| Aspect | Classique | Sentences |
|--------|-----------|-----------|
| **Type d'apprentissage** | Reconnaissance image | Compréhension contextuelle |
| **Vocabulaire** | Mots isolés | Mots en contexte |
| **Transfert** | Limité (image seule) | Meilleur (phrase = contexte réel) |
| **Complexité cognitive** | Bas | Moyen |
| **Âge** | 2.5-4 ans | 3.5-5 ans |

**Impact** : 
- Les enfants apprennent à utiliser les mots dans un **contexte réel**
- Compréhension + mémorisation > simple reconnaissance
- Préparation pour la lecture de phrases plus tard

---

## 📊 Architecture Code

### **Fichiers**
- `src/sentences.js` : Banque de 16+ phrases avec logique
- `src/App.vue` : États + écrans `sentences`, `sentences-picker`, logique
- `src/styles-new.css` : Styles pour les deux écrans

### **États Vue**
```javascript
sentenceCategory       // Catégorie sélectionnée
currentSentence        // Phrase actuelle
sentenceChoices        // 4 choix (emojis + correctness)
sentenceFeedback       // 'success' | 'error' | null
sentenceLocked         // Verrouille pendant feedback
sentenceScore          // Compteur de réponses correctes
sessionQuestionsCount  // Partagé avec mode classique
```

### **Screens**
```
picker
├─ Catégories classiques (animaux, fruits, etc.)
├─ Bouton 📖 "Sentences Mode" (si 5+ cat débloquées)
├─→ sentences-picker
│  ├─ 5 catégories phrases (animaux, fruits, couleurs, etc.)
│  └─→ sentences (gameplay)
│     └─ Context emoji + Phrase thaï + 4 choix
```

---

## 🎨 UI/UX

### **Écran Picker Phrases**
- Même layout que picker classique
- Couleur fond : jaune doux (#fff9e6)
- Catégories avec gradient jaune

### **Écran Gameplay**
- Emoji contexte large (80px)
- Phrase thaï 24px + traduction française 14px italique
- 2×2 grid de choix emojis
- Feedback: bordure verte/rouge + confetti

---

## 🧪 Tests

### **Test 1 : Déverrouillage**
```
1. Jouer mode classique, débloquer 5 catégories
2. Vérifier bouton 📖 aparaît dans picker
3. Cliquer → sentences-picker avec 5 catégories
```

### **Test 2 : Gameplay**
```
1. Sélectionner catégorie (ex: "Animaux")
2. Voir phrase + emoji contexte
3. Cliquer bonne réponse → succès + confetti
4. Cliquer mauvaise → erreur + re-essai
5. Après 20Q → summary screen
```

### **Test 3 : Persistance**
```
1. Jouer phrases, gagner points
2. Fermer/recharger l'app
3. sentenceScore persiste
4. Compté dans score global
```

---

## 🚀 Évolutions Futures

### **Phase 2**
- [ ] Phrases plus longues (2-3 blancs)
- [ ] Mots à réordonner au lieu de sélectionner
- [ ] Enregistrement audio des phrases
- [ ] Phrases thématiques (école, maison, etc.)

### **Phase 3**
- [ ] Dialogue simple (phrase + réponse)
- [ ] Puzzle de mots (assembler phrase mot par mot)
- [ ] Custom phrases (parents créent leurs phrases)

---

**Version**: 1.0 | **Statut**: Production-ready ✅
