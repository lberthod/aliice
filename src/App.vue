<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { WORDS } from './words.js'
import { SENTENCES, SENTENCE_CATEGORIES, getSentencesByCategory, SENTENCE_TRANSLATIONS_EN, getEnglishTranslation } from './sentences.js'
import { CONJUGATIONS, CONJUGATION_CATEGORIES, getConjugationsByCategory, getConjugationFormLabel } from './conjugations.js'
import { playSuccess, playError, playLevelUp, playTap } from './sounds.js'
import {
  firebaseEnabled,
  signInAnon,
  watchAuth,
  loadProfile,
  saveProfile
} from './firebase.js'

// ==================== Persistance ====================
const APP_VERSION = '0.10'
const STORAGE_KEY = 'thaibaby_v3'
const saved = (() => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }
  catch { return {} }
})()

// ==================== TTS ====================
const voices = ref([])
function loadVoices() {
  if (!('speechSynthesis' in window)) return
  voices.value = window.speechSynthesis.getVoices()
}
function pickThaiVoice() {
  const v = voices.value
  if (!v || !v.length) return null
  return v.find(x => /th-TH/i.test(x.lang)) || v.find(x => /^th/i.test(x.lang)) || null
}
const hasThaiVoice = computed(() => !!pickThaiVoice())

function speak(text) {
  if (!('speechSynthesis' in window)) return
  try {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    const voice = pickThaiVoice()
    if (voice) u.voice = voice
    u.lang = 'th-TH'
    u.rate = 0.85
    u.pitch = 1.1
    u.volume = 1
    window.speechSynthesis.speak(u)

    // Timeout de 3 secondes pour arrêter le TTS
    setTimeout(() => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel()
      }
    }, 3000)
  } catch (_) {}
}

function haptic(pattern) {
  if (navigator.vibrate) { try { navigator.vibrate(pattern) } catch (_) {} }
}

// ==================== Catégories (th + english only) ====================
const CATEGORY_META = {
  all:         { en: 'All',       th: 'ทั้งหมด',    emoji: '🌍', bg: 'linear-gradient(135deg,#ffd86b,#ff9d43)',   shadow: '#d9731a' },
  animaux:     { en: 'Animals',   th: 'สัตว์',      emoji: '🐘', bg: 'linear-gradient(135deg,#ffe9a8,#ffb347)',   shadow: '#d9902a' },
  couleurs:    { en: 'Colors',    th: 'สี',         emoji: '🎨', bg: 'linear-gradient(135deg,#ffccf0,#ff6bd5,#8c6bff)', shadow: '#a23ac2' },
  nombres:     { en: 'Numbers',   th: 'ตัวเลข',    emoji: '🔢', bg: 'linear-gradient(135deg,#d9d4ff,#7b6bff)',   shadow: '#4a3ac2' },
  fruits:      { en: 'Fruits',    th: 'ผลไม้',     emoji: '🍓', bg: 'linear-gradient(135deg,#ffcfe0,#ff7ca8)',   shadow: '#d85699' },
  famille:     { en: 'Family',    th: 'ครอบครัว', emoji: '👨‍👩‍👧', bg: 'linear-gradient(135deg,#ffe0c4,#ffa07a)', shadow: '#c96443' },
  corps:       { en: 'Body',      th: 'ร่างกาย',  emoji: '👁️', bg: 'linear-gradient(135deg,#ffd4d4,#ff8f8f)',   shadow: '#c94a4a' },
  nourriture:  { en: 'Food',      th: 'อาหาร',    emoji: '🍕', bg: 'linear-gradient(135deg,#ffe6b0,#ffa94d)',   shadow: '#d97b20' },
  vêtements:   { en: 'Clothes',   th: 'เสื้อผ้า',  emoji: '👕', bg: 'linear-gradient(135deg,#e6d7ff,#a78bfa)',   shadow: '#5f45c2' },
  jouets:      { en: 'Toys',      th: 'ของเล่น',  emoji: '🧸', bg: 'linear-gradient(135deg,#ffd6b8,#ff8f5c)',   shadow: '#d9652a' },
  maison:      { en: 'Home',      th: 'บ้าน',      emoji: '🏠', bg: 'linear-gradient(135deg,#ffe8c8,#e2a672)',   shadow: '#a67040' },
  transports:  { en: 'Transport', th: 'ยานพาหนะ', emoji: '🚗', bg: 'linear-gradient(135deg,#c9e1ff,#5a9bff)',   shadow: '#3566c9' },
  nature:      { en: 'Nature',    th: 'ธรรมชาติ', emoji: '🌳', bg: 'linear-gradient(135deg,#c8f0d5,#4dc87a)',   shadow: '#2a8a4a' },
  légumes:     { en: 'Vegetables',th: 'ผัก',        emoji: '🥕', bg: 'linear-gradient(135deg,#d7f7c9,#7bd85a)',   shadow: '#4a9a2e' },
  émotions:    { en: 'Feelings',  th: 'อารมณ์',   emoji: '😀', bg: 'linear-gradient(135deg,#fff2a8,#ffd04d)',   shadow: '#d9a92a' },
  musique:     { en: 'Music',     th: 'ดนตรี',    emoji: '🎸', bg: 'linear-gradient(135deg,#e6d0ff,#b079ff)',   shadow: '#7840c9' },
  sport:       { en: 'Sport',     th: 'กีฬา',      emoji: '⚽', bg: 'linear-gradient(135deg,#c0f0d0,#2fb870)',   shadow: '#1a6b40' },
  boissons:    { en: 'Drinks',    th: 'เครื่องดื่ม', emoji: '🥤', bg: 'linear-gradient(135deg,#d4eaff,#6fb3ff)', shadow: '#3b7ec9' },
  météo:       { en: 'Weather',   th: 'อากาศ',    emoji: '⛅', bg: 'linear-gradient(135deg,#d4eaff,#89c9ff,#fff0a8)', shadow: '#3b7ec9' },
  école:       { en: 'School',    th: 'โรงเรียน', emoji: '🏫', bg: 'linear-gradient(135deg,#ffe0a0,#ffb04d)',   shadow: '#c97e2a' },
  technologie: { en: 'Tech',      th: 'เทคโนโลยี', emoji: '💻', bg: 'linear-gradient(135deg,#c0d0e0,#5070a0)', shadow: '#2f4870' },
  métiers:     { en: 'Characters',th: 'ตัวละคร',  emoji: '🦸', bg: 'linear-gradient(135deg,#ffc0d5,#e05090)',   shadow: '#a02f6a' },
  mer:         { en: 'Sea Life',   th: 'ทะเล',      emoji: '🐙', bg: 'linear-gradient(135deg,#a8e6ff,#4d94ff)',   shadow: '#2a5cd9' },
  insectes:    { en: 'Insects',    th: 'แมลง',      emoji: '🦋', bg: 'linear-gradient(135deg,#f0ffcc,#9ed85a)',   shadow: '#5a9a2e' },
  espace:      { en: 'Space',      th: 'อวกาศ',    emoji: '🚀', bg: 'linear-gradient(135deg,#2c3e50,#4ca1af)',   shadow: '#1a252f' },
  outils:      { en: 'Tools',      th: 'เครื่องมือ', emoji: '🛠️', bg: 'linear-gradient(135deg,#bdc3c7,#2c3e50)',   shadow: '#1a252f' },
  lieux:       { en: 'Places',     th: 'สถานที่',    emoji: '📍', bg: 'linear-gradient(135deg,#ffe259,#ffa751)',   shadow: '#d97b20' },
  hygiène:     { en: 'Hygiene',    th: 'สุขอนามัย',  emoji: '🧼', bg: 'linear-gradient(135deg,#ccfbff,#ef96ff)',   shadow: '#9b59b6' },
  formes:      { en: 'Shapes',     th: 'รูปทรง',    emoji: '📐', bg: 'linear-gradient(135deg,#ff9a9e,#fecfef)',   shadow: '#d85699' },
  fêtes:       { en: 'Events',     th: 'เทศกาล',   emoji: '🎉', bg: 'linear-gradient(135deg,#ffecd2,#fcb69f)',   shadow: '#c96443' },
  dinosaures:  { en: 'Dinos',      th: 'ไดโนเสาร์', emoji: '🦖', bg: 'linear-gradient(135deg,#84fab0,#8fd3f4)',   shadow: '#3566c9' }
}

// Parcours d'apprentissage : ordre dans lequel les catégories se débloquent.
// Les 3 premières sont ouvertes dès le départ.
const LEARNING_PATH = [
  'animaux', 'couleurs', 'nombres',  // unlocked au départ
  'fruits', 'famille', 'corps',
  'nourriture', 'vêtements', 'jouets',
  'maison', 'transports', 'nature',
  'légumes', 'émotions', 'musique',
  'sport', 'boissons', 'météo',
  'école', 'technologie', 'métiers',
  'mer', 'insectes', 'espace',
  'outils', 'lieux', 'hygiène',
  'formes', 'fêtes', 'dinosaures'
]
const INITIAL_UNLOCKED = 3
// Seuil pour considérer une catégorie "maîtrisée" (débloque la suivante) :
// 60% des mots de la catégorie répondus correctement ≥ 3 fois.
const MASTERY_THRESHOLD = 0.6

// ==================== Badges (logique d'apprentissage) ====================
// Chaque badge expose progress(snap) -> { have, need }  pour affichage dans le profil.
const BADGES = [
  // --- Badges de premiers pas ---
  {
    id: 'first', emoji: '🌱', th: 'คำแรก', en: 'First word',
    progress: s => ({ have: Math.min(s.score, 1), need: 1 })
  },
  {
    id: 'words_10', emoji: '⭐', th: '10 คำ', en: '10 words',
    progress: s => ({ have: Math.min(s.score, 10), need: 10 })
  },
  {
    id: 'words_50', emoji: '🌟', th: '50 คำ', en: '50 words',
    progress: s => ({ have: Math.min(s.score, 50), need: 50 })
  },
  {
    id: 'words_100', emoji: '💫', th: '100 คำ', en: '100 words',
    progress: s => ({ have: Math.min(s.score, 100), need: 100 })
  },
  {
    id: 'words_250', emoji: '📚', th: '250 คำ', en: '250 words',
    progress: s => ({ have: Math.min(s.score, 250), need: 250 })
  },
  {
    id: 'words_500', emoji: '📖', th: '500 คำ', en: '500 words',
    progress: s => ({ have: Math.min(s.score, 500), need: 500 })
  },
  {
    id: 'words_1000', emoji: '🎓', th: '1000 คำ', en: '1000 words',
    progress: s => ({ have: Math.min(s.score, 1000), need: 1000 })
  },
  // --- Badges de série (Streak) ---
  {
    id: 'streak_5', emoji: '🔥', th: 'ต่อเนื่อง 5', en: 'Streak 5',
    progress: s => ({ have: Math.min(s.bestStreak, 5), need: 5 })
  },
  {
    id: 'streak_10', emoji: '💎', th: 'ต่อเนื่อง 10', en: 'Streak 10',
    progress: s => ({ have: Math.min(s.bestStreak, 10), need: 10 })
  },
  {
    id: 'streak_25', emoji: '🚀', th: 'ต่อเนื่อง 25', en: 'Streak 25',
    progress: s => ({ have: Math.min(s.bestStreak, 25), need: 25 })
  },
  {
    id: 'streak_50', emoji: '🦸', th: 'ต่อเนื่อง 50', en: 'Streak 50',
    progress: s => ({ have: Math.min(s.bestStreak, 50), need: 50 })
  },
  {
    id: 'streak_100', emoji: '⚡', th: 'ต่อเนื่อง 100', en: 'Streak 100',
    progress: s => ({ have: Math.min(s.bestStreak, 100), need: 100 })
  },
  // --- Badges de maîtrise par catégorie ---
  {
    id: 'master_1', emoji: '🎯', th: 'เซียน 1', en: 'Master 1 category',
    progress: s => ({ have: Math.min(s.masteredCats, 1), need: 1 })
  },
  {
    id: 'master_3', emoji: '🧩', th: 'เซียน 3', en: 'Master 3 categories',
    progress: s => ({ have: Math.min(s.masteredCats, 3), need: 3 })
  },
  {
    id: 'master_6', emoji: '🌈', th: 'เซียน 6', en: 'Master 6 categories',
    progress: s => ({ have: Math.min(s.masteredCats, 6), need: 6 })
  },
  {
    id: 'master_9', emoji: '🏅', th: 'เซียน 9', en: 'Master 9 categories',
    progress: s => ({ have: Math.min(s.masteredCats, 9), need: 9 })
  },
  {
    id: 'master_12', emoji: '�', th: 'เซียน 12', en: 'Master 12 categories',
    progress: s => ({ have: Math.min(s.masteredCats, 12), need: 12 })
  },
  {
    id: 'master_18', emoji: '👑', th: 'เซียน 18', en: 'Master 18 categories',
    progress: s => ({ have: Math.min(s.masteredCats, 18), need: 18 })
  },
  {
    id: 'master_all', emoji: '🤴', th: 'ราชาแห่งคำศัพท์', en: 'Vocabulary King',
    progress: s => ({ have: Math.min(s.masteredCats, LEARNING_PATH.length), need: LEARNING_PATH.length })
  },
  // --- Badges de collection ---
  {
    id: 'collector_100', emoji: '🗂️', th: 'เก็บ 100', en: 'Collect 100 words',
    progress: s => ({ have: Math.min(s.masteredWords, 100), need: 100 })
  },
  {
    id: 'collector_250', emoji: '📦', th: 'เก็บ 250', en: 'Collect 250 words',
    progress: s => ({ have: Math.min(s.masteredWords, 250), need: 250 })
  },
  {
    id: 'collector_500', emoji: '�', th: 'เก็บ 500', en: '500 words mastered',
    progress: s => ({ have: Math.min(s.masteredWords, 500), need: 500 })
  },
  {
    id: 'collector_750', emoji: '💎', th: 'เก็บ 750', en: 'Collect 750 words',
    progress: s => ({ have: Math.min(s.masteredWords, 750), need: 750 })
  },
  {
    id: 'collector_all', emoji: '🏅', th: 'นักสะสมสุดยอด', en: 'Ultimate Collector',
    progress: s => ({ have: Math.min(s.masteredWords, WORDS.length), need: WORDS.length })
  },
  // --- Badges de session parfaite ---
  {
    id: 'perfect_10', emoji: '✨', th: 'สมบูรณ์ 10', en: 'Perfect 10',
    progress: s => ({ have: Math.min(s.sessionPerfect || 0, 10), need: 10 })
  },
  {
    id: 'perfect_25', emoji: '🌟', th: 'สมบูรณ์ 25', en: 'Perfect 25',
    progress: s => ({ have: Math.min(s.sessionPerfect || 0, 25), need: 25 })
  },
  {
    id: 'perfect_50', emoji: '💯', th: 'สมบูรณ์ 50', en: 'Perfect 50',
    progress: s => ({ have: Math.min(s.sessionPerfect || 0, 50), need: 50 })
  },
  // --- Badges de rapidité ---
  {
    id: 'speed_demon', emoji: '⚡', th: 'เร็วเหมือนสายฟ้า', en: 'Speed Demon',
    progress: s => ({ have: Math.min(s.fastAnswers || 0, 50), need: 50 })
  },
  {
    id: 'speed_master', emoji: '🏎️', th: 'เจ้าความเร็ว', en: 'Speed Master',
    progress: s => ({ have: Math.min(s.fastAnswers || 0, 200), need: 200 })
  },
  // --- Badges de persévérance ---
  {
    id: 'comeback_kid', emoji: '🔄', th: 'ลุกขึ้นสู้', en: 'Comeback Kid',
    progress: s => ({ have: Math.min(s.comebacks || 0, 10), need: 10 })
  },
  {
    id: 'never_give_up', emoji: '💪', th: 'ไม่ยอมแพ้', en: 'Never Give Up',
    progress: s => ({ have: Math.min(s.comebacks || 0, 50), need: 50 })
  },
  // --- Badges de niveau ---
  {
    id: 'level_5', emoji: '📈', th: 'เลเวล 5', en: 'Level 5',
    progress: s => ({ have: Math.min(s.level, 5), need: 5 })
  },
  {
    id: 'level_10', emoji: '📊', th: 'เลเวล 10', en: 'Level 10',
    progress: s => ({ have: Math.min(s.level, 10), need: 10 })
  },
  {
    id: 'level_25', emoji: '🎯', th: 'เลเวล 25', en: 'Level 25',
    progress: s => ({ have: Math.min(s.level, 25), need: 25 })
  },
  {
    id: 'level_50', emoji: '🏔️', th: 'เลเวล 50', en: 'Level 50',
    progress: s => ({ have: Math.min(s.level, 50), need: 50 })
  },
  // --- Badges spéciaux ---
  {
    id: 'hint_master', emoji: '🧠', th: 'ไม่ใช้ตัวช่วย', en: 'No Hints Needed',
    progress: s => ({ have: Math.min(s.noHintSessions || 0, 10), need: 10 })
  },
  {
    id: 'explorer', emoji: '🗺️', th: 'นักสำรวจ', en: 'Explorer',
    progress: s => ({ have: Math.min(s.categoriesTried || 0, 10), need: 10 })
  },
  {
    id: 'polyglot', emoji: '🌍', th: 'โพลีกลอต', en: 'Polyglot',
    progress: s => ({ have: Math.min(s.categoriesTried || 0, LEARNING_PATH.length), need: LEARNING_PATH.length })
  }
]

// ==================== État ====================
// Niveaux progressifs : le XP requis double à chaque niveau (5, 10, 20, 40...)
function getXpForLevel(lvl) {
  return 5 * Math.pow(2, lvl - 1)
}
function getTotalXpToReachLevel(lvl) {
  return 5 * (Math.pow(2, lvl - 1) - 1)
}

// Profil
const AVATARS = ['🐼', '🐯', '🦊', '🐸', '🐵', '🦄', '🐙', '🦁', '🐨', '🐶', '🐱', '🦉', '🐧', '🐻', '🦋']
const uid = ref(null)
const profileName = ref(saved.profileName || '')
const profileAvatar = ref(saved.profileAvatar || '🐼')
const profileCreatedAt = ref(saved.profileCreatedAt || Date.now())

// Jeu
const screen = ref('start')          // start | picker | play | profile | sentences | sentences-picker | conjugation | conjugation-picker
const category = ref(saved.category || 'animaux')
const score = ref(saved.score || 0)
const bestStreak = ref(saved.bestStreak || 0)
const unlockedBadges = ref(saved.unlockedBadges || [])
const mastery = ref(saved.mastery || {})
const newlyUnlockedCats = ref([])    // pour popup de déblocage

// Stats pour les nouveaux badges
const sessionCorrect = ref(0)        // Bonnes réponses consécutives dans la session
const sessionPerfect = ref(saved.sessionPerfect || 0)  // Record de bonnes réponses consécutives
const fastAnswers = ref(saved.fastAnswers || 0)        // Réponses rapides (< 2s)
const comebacks = ref(saved.comebacks || 0)          // Rebonds après erreur
const noHintSessions = ref(saved.noHintSessions || 0) // Sessions sans utiliser d'indice
// Charger categoriesTried depuis le localStorage (convertir tableau en Set)
const savedCategories = saved.categoriesTried
const categoriesTried = ref(Array.isArray(savedCategories) ? new Set(savedCategories) : new Set())
const answerStartTime = ref(0)       // Pour mesurer le temps de réponse

const streak = ref(0)
const choices = ref([])
const correctId = ref(null)
const selectedId = ref(null)
const feedback = ref(null)
const locked = ref(false)
const questionKey = ref(0)
const confetti = ref([])
const celebrate = ref(null)
const levelUpVisible = ref(false)
const badgeUnlocked = ref(null)
const catUnlockedPopup = ref(null)
const mascotState = ref('idle')
const ripples = ref([])
const hintsLeft = ref(3)
const hiddenIds = ref([])

// ==================== Sentences Mode ====================
const sentenceCategory = ref(null)
const currentSentence = ref(null)
const sentenceChoices = ref([])
const sentenceSelectedId = ref(null)
const sentenceFeedback = ref(null)
const sentenceLocked = ref(false)
const sentenceKey = ref(0)
const sentenceScore = ref(saved.sentenceScore || 0)
const sentenceHintsLeft = ref(3)
const sentenceShowTranslation = ref(false)
const sentenceShowCompleteTranslations = ref(false)
const sentenceCurrentPool = ref([])
const sentenceCategoryStats = ref(saved.sentenceCategoryStats || {})

// ==================== Conjugation Mode ====================
const conjugationCategory = ref(null)
const currentConjugation = ref(null)
const currentTense = ref('present')
const conjugationChoices = ref([])
const conjugationSelectedId = ref(null)
const conjugationFeedback = ref(null)
const conjugationLocked = ref(false)
const conjugationKey = ref(0)
const conjugationScore = ref(saved.conjugationScore || 0)
const conjugationCurrentPool = ref([])
const conjugationCategoryStats = ref(saved.conjugationCategoryStats || {})

const level = computed(() => {
  if (score.value < 5) return 1
  return Math.floor(Math.log2(score.value / 5 + 1)) + 1
})
const xpToCurrentLevel = computed(() => getTotalXpToReachLevel(level.value))
const xpRequiredForNextLevel = computed(() => getXpForLevel(level.value))
const xpInLevel = computed(() => score.value - xpToCurrentLevel.value)
const xpPct = computed(() => (xpInLevel.value / xpRequiredForNextLevel.value) * 100)

const numChoices = computed(() => {
  if (level.value <= 1) return 2
  if (level.value <= 2) return 3
  return 4
})

const PRAISES = ['เก่งมาก!', 'ดีมาก!', 'สุดยอด!', 'เยี่ยม!', '✨', '🎉', '🌟', '⭐', '💖']
const MASCOT_EMOJI = {
  idle: '🐼', listen: '🦻', happy: '🥳', sad: '😢', party: '🤩'
}
const CARD_COLORS = [
  { bg: 'linear-gradient(180deg,#fff2a8,#ffd66b)', shadow: '#d99a2a' },
  { bg: 'linear-gradient(180deg,#ffd0e4,#ff98c4)', shadow: '#d85699' },
  { bg: 'linear-gradient(180deg,#cfe7ff,#8ec7ff)', shadow: '#4d93db' },
  { bg: 'linear-gradient(180deg,#d7f7c9,#9be57d)', shadow: '#5aa93e' },
  { bg: 'linear-gradient(180deg,#e6d7ff,#b79bff)', shadow: '#7e5fd9' },
  { bg: 'linear-gradient(180deg,#ffd6b8,#ff9d6b)', shadow: '#d9652a' }
]

// ==================== Calculs ====================
function catCount(cat) {
  return WORDS.filter(w => w.category === cat).length
}
function catMasteredWords(cat) {
  return WORDS.filter(w => w.category === cat && (mastery.value[w.id] || 0) >= 3).length
}
function catMasteryRatio(cat) {
  const total = catCount(cat)
  if (!total) return 0
  return catMasteredWords(cat) / total
}
function isCatMastered(cat) {
  return catMasteryRatio(cat) >= MASTERY_THRESHOLD
}

// Nombre de catégories du parcours débloquées.
const unlockedCount = computed(() => {
  let count = INITIAL_UNLOCKED
  for (let i = 0; i < LEARNING_PATH.length - 1; i++) {
    if (i < count && isCatMastered(LEARNING_PATH[i])) {
      if (count < LEARNING_PATH.length) count++
    }
  }
  return Math.min(count, LEARNING_PATH.length)
})

function isCatUnlocked(cat) {
  if (cat === 'all') return unlockedCount.value >= 2 // "Tout" dispo dès 2 déblocages
  const idx = LEARNING_PATH.indexOf(cat)
  if (idx < 0) return true
  return idx < unlockedCount.value
}

const masteredCatsCount = computed(() =>
  LEARNING_PATH.filter(isCatMastered).length
)
const masteredWordsCount = computed(() =>
  Object.values(mastery.value).filter(v => v >= 3).length
)

const targetWord = computed(() =>
  choices.value.find(c => c.id === correctId.value) || null
)
const currentCategoryMeta = computed(() => CATEGORY_META[category.value] || CATEGORY_META.all)

const wordPool = computed(() => {
  if (category.value === 'all') {
    // en mode "all", utilise uniquement les catégories débloquées
    const allowed = LEARNING_PATH.slice(0, unlockedCount.value)
    return WORDS.filter(w => allowed.includes(w.category))
  }
  return WORDS.filter(w => w.category === category.value)
})

// Info affichée dans le profil : snapshot pour les badges
const categoriesTriedCount = computed(() => categoriesTried.value.size || categoriesTried.value.length || 0)
const badgeSnapshot = computed(() => ({
  score: score.value,
  bestStreak: bestStreak.value,
  level: level.value,
  masteredCats: masteredCatsCount.value,
  masteredWords: masteredWordsCount.value,
  sessionPerfect: sessionPerfect.value,
  fastAnswers: fastAnswers.value,
  comebacks: comebacks.value,
  noHintSessions: noHintSessions.value,
  categoriesTried: categoriesTriedCount.value
}))

// ==================== Persistance + Firestore ====================
function persistLocal() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      profileName: profileName.value,
      profileAvatar: profileAvatar.value,
      profileCreatedAt: profileCreatedAt.value,
      score: score.value,
      bestStreak: bestStreak.value,
      unlockedBadges: unlockedBadges.value,
      category: category.value,
      mastery: mastery.value,
      sessionPerfect: sessionPerfect.value,
      fastAnswers: fastAnswers.value,
      comebacks: comebacks.value,
      noHintSessions: noHintSessions.value,
      categoriesTried: Array.from(categoriesTried.value),
      sentenceScore: sentenceScore.value,
      sentenceCategoryStats: sentenceCategoryStats.value,
      conjugationScore: conjugationScore.value,
      conjugationCategoryStats: conjugationCategoryStats.value
    }))
  } catch (_) {}
}
function persistRemote() {
  if (!uid.value) return
  saveProfile(uid.value, {
    name: profileName.value,
    avatar: profileAvatar.value,
    createdAt: profileCreatedAt.value,
    score: score.value,
    bestStreak: bestStreak.value,
    unlockedBadges: unlockedBadges.value,
    mastery: mastery.value,
    lastCategory: category.value,
    sessionPerfect: sessionPerfect.value,
    fastAnswers: fastAnswers.value,
    comebacks: comebacks.value,
    noHintSessions: noHintSessions.value,
    categoriesTried: Array.from(categoriesTried.value),
    sentenceScore: sentenceScore.value,
    sentenceCategoryStats: sentenceCategoryStats.value,
    conjugationScore: conjugationScore.value,
    conjugationCategoryStats: conjugationCategoryStats.value
  })
}
watch(
  [score, bestStreak, unlockedBadges, category, mastery, profileName, profileAvatar, sessionPerfect, fastAnswers, comebacks, noHintSessions, sentenceScore, sentenceCategoryStats, conjugationScore, conjugationCategoryStats],
  () => { persistLocal(); persistRemote() },
  { deep: true }
)

// ==================== Utilitaires ====================
function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
function svgUrl(hex) {
  return `${import.meta.env.BASE_URL}openmoji/${hex}.svg`
}

// ==================== Logique du jeu ====================
function pickDistractors(target, pool, n) {
  // Smart difficulty: progressively harder distractors based on level
  const sameCat = pool.filter(w => w.id !== target.id && w.category === target.category)
  const otherCat = pool.filter(w => w.id !== target.id && w.category !== target.category)

  let distractors = []

  // Level 1-2: Mostly different categories (easier)
  // Level 3+: 50% same category, 50% other (harder)
  if (level.value <= 2) {
    const ratioOther = 0.8 // 80% from other categories
    const needSame = Math.max(0, Math.ceil(n * (1 - ratioOther)))
    const needOther = n - needSame

    distractors = [
      ...shuffle(sameCat).slice(0, needSame),
      ...shuffle(otherCat).slice(0, needOther)
    ]
  } else {
    // Level 3+: 50/50 challenge
    const needSame = Math.ceil(n / 2)
    const needOther = n - needSame

    distractors = [
      ...shuffle(sameCat).slice(0, needSame),
      ...shuffle(otherCat).slice(0, needOther)
    ]
  }

  // Fallback: si pas assez de distracteurs, complète avec des mots aléatoires
  if (distractors.length < n) {
    const all = WORDS.filter(w => w.id !== target.id && !distractors.some(d => d.id === w.id))
    distractors = [...distractors, ...shuffle(all)].slice(0, n)
  }

  return distractors
}

let lastTargetId = null

// ==================== Session Management ====================
const sessionStartedAt = ref(0)
const sessionQuestionsCount = ref(0)
const sessionStats = ref({
  correct: 0,
  streak: 0,
  accuracy: 0,
  avgTime: 0,
  totalTime: 0,
  badgesEarned: [],
  wordsLearned: new Set()
})

// ==================== Child Lock ====================
const childLockEnabled = ref(false)
const childLockTimer = ref(null)
const lastInteractionTime = ref(Date.now())
const CHILD_LOCK_TIMEOUT = 5 * 60 * 1000 // 5 min inactivité
const MAX_SESSION_TIME = 15 * 60 * 1000 // 15 min max
const CLICK_COOLDOWN = 300 // ms

function trackInteraction() {
  lastInteractionTime.value = Date.now()
  if (childLockEnabled.value) {
    childLockEnabled.value = false
  }
}

function enableChildLock() {
  childLockEnabled.value = true
}

function startSessionTimer() {
  sessionStartedAt.value = Date.now()
  sessionQuestionsCount.value = 0
  if (childLockTimer.value) clearInterval(childLockTimer.value)

  childLockTimer.value = setInterval(() => {
    const elapsed = Date.now() - lastInteractionTime.value

    // Auto child lock après inactivité
    if (elapsed > CHILD_LOCK_TIMEOUT && screen.value === 'play' && !childLockEnabled.value) {
      enableChildLock()
    }

    // Session trop longue → summary
    const sessionDuration = Date.now() - sessionStartedAt.value
    if (sessionDuration > MAX_SESSION_TIME && screen.value === 'play') {
      endSessionSummary()
    }
  }, 3000)
}

function endSessionSummary() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()

  sessionStats.value = {
    correct: streak.value > 0 ? score.value : Math.max(0, score.value - streak.value),
    streak: streak.value,
    accuracy: sessionQuestionsCount.value > 0 ? Math.round((sessionStats.value.correct / sessionQuestionsCount.value) * 100) : 0,
    avgTime: sessionQuestionsCount.value > 0 ? Math.round((sessionStats.value.totalTime / sessionQuestionsCount.value) / 1000) : 0,
    totalTime: Math.round((Date.now() - sessionStartedAt.value) / 1000),
    badgesEarned: unlockedBadges.value.slice(-3),
    wordsLearned: new Set(Object.keys(mastery.value).filter(id => mastery.value[id] >= 1).slice(-10))
  }

  screen.value = 'summary'
  childLockEnabled.value = false
  streak.value = 0
  sessionCorrect.value = 0
}

function generateQuestion() {
  feedback.value = null
  selectedId.value = null
  locked.value = false
  hiddenIds.value = []
  mascotState.value = 'listen'
  answerStartTime.value = Date.now() // Track start time for speed badges

  const pool = wordPool.value
  if (!pool.length) return

  let target
  do {
    target = pool[Math.floor(Math.random() * pool.length)]
  } while (target && target.id === lastTargetId && pool.length > 1)
  lastTargetId = target.id

  const n = Math.min(numChoices.value, pool.length)
  const distractors = pickDistractors(target, pool, n - 1)
  const colors = shuffle(CARD_COLORS).slice(0, n)
  choices.value = shuffle([target, ...distractors]).map((w, i) => ({
    ...w, _color: colors[i]
  }))
  correctId.value = target.id
  questionKey.value++

  setTimeout(() => {
    speak(target.th)
    setTimeout(() => { mascotState.value = 'idle' }, 800)
  }, 280)
}

// ==================== Sentences Mode Logic ====================
function generateSentenceQuestion() {
  sentenceFeedback.value = null
  sentenceSelectedId.value = null
  sentenceLocked.value = false
  sentenceShowTranslation.value = false
  sentenceShowCompleteTranslations.value = false
  mascotState.value = 'listen'
  answerStartTime.value = Date.now()

  // Pool intelligente : adaptive selon streak & difficulté
  let pool = sentenceCategory.value
    ? getSentencesByCategory(`sentences-${sentenceCategory.value}`)
    : SENTENCES

  // Si streak >= 5, filtrer phrases plus difficiles
  if (streak.value >= 5) {
    const hardPool = pool.filter(s => s.difficulty >= 2)
    if (hardPool.length) pool = hardPool
  }

  sentenceCurrentPool.value = pool
  if (!pool.length) return

  const sentence = pool[Math.floor(Math.random() * pool.length)]
  currentSentence.value = sentence

  // Mélange les choix
  sentenceChoices.value = shuffle(sentence.choices).map((c, i) => ({
    emoji: c,
    isCorrect: c === sentence.answer,
    _color: CARD_COLORS[i % CARD_COLORS.length]
  }))
  sentenceKey.value++

  setTimeout(() => {
    speak(sentence.th)
    setTimeout(() => { mascotState.value = 'idle' }, 800)
  }, 280)
}

function useSentenceHint() {
  if (sentenceHintsLeft.value <= 0 || sentenceLocked.value) return
  // Afficher la traduction française comme indice
  sentenceShowTranslation.value = true
  sentenceHintsLeft.value--
  playTap()
  haptic(30)
}

function replaySentencePhrase() {
  // Rejoint la phrase SANS générer une nouvelle
  if (!currentSentence.value) return
  mascotState.value = 'listen'
  setTimeout(() => {
    speak(currentSentence.value.th)
    setTimeout(() => { mascotState.value = 'idle' }, 800)
  }, 100)
}

function playCompleteSentence() {
  // Rejoint la phrase COMPLÈTE avec la bonne réponse
  if (!currentSentence.value) return

  // Remplace le blank par le mot réponse (enlever le "___")
  let completeSentence = currentSentence.value.th.replace('___', '')

  mascotState.value = 'listen'
  setTimeout(() => {
    speak(completeSentence)
    setTimeout(() => {
      mascotState.value = 'idle'
      // Afficher les traductions FR + EN après la phrase
      sentenceShowCompleteTranslations.value = true
    }, 1200)
  }, 100)
}

function selectSentenceChoice(isCorrect) {
  if (sentenceLocked.value) return
  trackInteraction()

  sentenceSelectedId.value = isCorrect
  playTap()

  sessionQuestionsCount.value += 1

  if (isCorrect) {
    sentenceFeedback.value = 'success'
    sentenceLocked.value = true
    sentenceShowTranslation.value = true  // Afficher traduction en succès

    // Rejouer la phrase complète (avec le bon mot)
    setTimeout(() => {
      playCompleteSentence()
    }, 500)
    const prevLevel = level.value
    score.value += 1
    sentenceScore.value += 1
    streak.value += 1

    // Track stats par catégorie
    const catKey = `${sentenceCategory.value}-correct`
    sentenceCategoryStats.value[catKey] = (sentenceCategoryStats.value[catKey] || 0) + 1

    sessionCorrect.value += 1
    if (sessionCorrect.value > sessionPerfect.value) {
      sessionPerfect.value = sessionCorrect.value
    }

    const answerTime = Date.now() - answerStartTime.value
    if (answerTime < 2000) {
      fastAnswers.value += 1
    }

    if (sessionCorrect.value === 1 && score.value > 1) {
      comebacks.value += 1
    }

    if (streak.value > bestStreak.value) bestStreak.value = streak.value
    playSuccess()
    haptic([30, 40, 60])
    mascotState.value = streak.value >= 3 ? 'party' : 'happy'
    celebrate.value = PRAISES[Math.floor(Math.random() * PRAISES.length)]
    launchConfetti()

    const leveledUp = level.value > prevLevel
    if (leveledUp) {
      setTimeout(() => {
        levelUpVisible.value = true
        playLevelUp()
        haptic([50, 60, 50, 60, 80])
      }, 700)
      setTimeout(() => { levelUpVisible.value = false }, 1700)
    }
    checkBadges()

    if (sessionQuestionsCount.value >= 20) {
      const delay = leveledUp ? 1800 : 1200
      setTimeout(() => {
        endSessionSummary()
      }, delay)
    } else {
      const delay = leveledUp ? 1800 : 1200
      setTimeout(() => {
        celebrate.value = null
        mascotState.value = 'idle'
        generateSentenceQuestion()
      }, delay)
    }
  } else {
    sentenceFeedback.value = 'error'
    streak.value = 0
    sessionCorrect.value = 0
    playError()
    haptic(120)
    mascotState.value = 'sad'
    setTimeout(() => {
      if (currentSentence.value) speak(currentSentence.value.th)
      sentenceFeedback.value = null
      sentenceSelectedId.value = null
      mascotState.value = 'listen'
      setTimeout(() => { mascotState.value = 'idle' }, 800)
    }, 900)
  }
}

// ==================== CONJUGATION MODE FUNCTIONS ====================
function enterConjugationPicker() {
  screen.value = 'conjugation-picker'
  try { new (window.AudioContext || window.webkitAudioContext)().resume?.() } catch (_) {}
}

function chooseConjugationCategory(cat) {
  conjugationCategory.value = cat
  screen.value = 'conjugation'
  streak.value = 0
  sessionCorrect.value = 0
  childLockEnabled.value = false
  lastInteractionTime.value = Date.now()
  startSessionTimer()
  generateConjugationQuestion()
}

function goHomeConjugation() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
  screen.value = 'picker'
  streak.value = 0
  sessionCorrect.value = 0
}

function generateConjugationQuestion() {
  conjugationFeedback.value = null
  conjugationSelectedId.value = null
  conjugationLocked.value = false
  mascotState.value = 'listen'
  answerStartTime.value = Date.now()

  // Récupérer le pool de verbes pour cette catégorie
  let pool = conjugationCategory.value
    ? getConjugationsByCategory(`conj-${conjugationCategory.value}`)
    : CONJUGATIONS

  // Si streak >= 5, plus de variété dans les temps
  if (streak.value >= 5) {
    // Garder le pool tel quel pour plus de défi
  }

  conjugationCurrentPool.value = pool
  if (!pool.length) return

  const verb = pool[Math.floor(Math.random() * pool.length)]
  currentConjugation.value = verb

  // Sélectionner un temps aléatoire (present, presentCont, past, future)
  const tenses = ['present', 'presentCont', 'past', 'future']
  currentTense.value = tenses[Math.floor(Math.random() * tenses.length)]

  // Préparer les choix : la bonne réponse + 3 mauvaises réponses
  const correctAnswer = verb.forms[currentTense.value]
  const otherVerbs = pool.filter(v => v.id !== verb.id).slice(0, 3)
  const wrongAnswers = otherVerbs.map(v => v.forms[currentTense.value])

  const allChoices = [correctAnswer, ...wrongAnswers]
  conjugationChoices.value = shuffle(allChoices).map((choice, i) => ({
    text: choice,
    isCorrect: choice === correctAnswer,
    _color: CARD_COLORS[i % CARD_COLORS.length]
  }))
  conjugationKey.value++

  setTimeout(() => {
    speak(verb.th)
    setTimeout(() => { mascotState.value = 'idle' }, 800)
  }, 280)
}

function replayConjugationPhrase() {
  if (!currentConjugation.value) return
  mascotState.value = 'listen'
  setTimeout(() => {
    speak(currentConjugation.value.th)
    setTimeout(() => { mascotState.value = 'idle' }, 800)
  }, 100)
}

function selectConjugationChoice(isCorrect) {
  if (conjugationLocked.value) return
  trackInteraction()

  conjugationSelectedId.value = isCorrect
  playTap()

  sessionQuestionsCount.value += 1

  if (isCorrect) {
    conjugationFeedback.value = 'success'
    conjugationLocked.value = true

    const prevLevel = level.value
    score.value += 1
    conjugationScore.value += 1
    streak.value += 1

    // Track stats par catégorie
    const catKey = `${conjugationCategory.value}-correct`
    conjugationCategoryStats.value[catKey] = (conjugationCategoryStats.value[catKey] || 0) + 1

    sessionCorrect.value += 1
    if (sessionCorrect.value > sessionPerfect.value) {
      sessionPerfect.value = sessionCorrect.value
    }

    const answerTime = Date.now() - answerStartTime.value
    if (answerTime < 2000) {
      fastAnswers.value += 1
    }

    if (sessionCorrect.value === 1 && score.value > 1) {
      comebacks.value += 1
    }

    if (streak.value > bestStreak.value) bestStreak.value = streak.value
    playSuccess()
    haptic([30, 40, 60])
    mascotState.value = streak.value >= 3 ? 'party' : 'happy'
    celebrate.value = PRAISES[Math.floor(Math.random() * PRAISES.length)]
    launchConfetti()

    const leveledUp = level.value > prevLevel
    if (leveledUp) {
      setTimeout(() => {
        levelUpVisible.value = true
        playLevelUp()
        haptic([50, 60, 50, 60, 80])
      }, 700)
      setTimeout(() => { levelUpVisible.value = false }, 1700)
    }
    checkBadges()

    if (sessionQuestionsCount.value >= 20) {
      const delay = leveledUp ? 1800 : 1200
      setTimeout(() => {
        endSessionSummary()
      }, delay)
    } else {
      const delay = leveledUp ? 1800 : 1200
      setTimeout(() => {
        celebrate.value = null
        mascotState.value = 'idle'
        generateConjugationQuestion()
      }, delay)
    }
  } else {
    conjugationFeedback.value = 'error'
    streak.value = 0
    sessionCorrect.value = 0
    playError()
    haptic(120)
    mascotState.value = 'sad'
    setTimeout(() => {
      if (currentConjugation.value) speak(currentConjugation.value.th)
      conjugationFeedback.value = null
      conjugationSelectedId.value = null
      mascotState.value = 'listen'
      setTimeout(() => { mascotState.value = 'idle' }, 800)
    }, 900)
  }
}

function enterSentencesPicker() {
  screen.value = 'sentences-picker'
  try { new (window.AudioContext || window.webkitAudioContext)().resume?.() } catch (_) {}
}

function chooseSentenceCategory(cat) {
  sentenceCategory.value = cat
  screen.value = 'sentences'
  streak.value = 0
  sessionCorrect.value = 0
  sentenceHintsLeft.value = 3
  sentenceShowTranslation.value = false
  sentenceShowCompleteTranslations.value = false
  childLockEnabled.value = false
  lastInteractionTime.value = Date.now()
  startSessionTimer()
  generateSentenceQuestion()
}

function goHomeSentences() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
  if (!hintsUsedThisSession.value && sessionCorrect.value >= 5) {
    noHintSessions.value += 1
  }
  screen.value = 'picker'
  streak.value = 0
  sessionCorrect.value = 0
}

function launchConfetti() {
  const colors = ['#ffd86b', '#ff6b9d', '#6bb6ff', '#7be06b', '#b79bff', '#ff9d6b']
  const emojis = ['🎉', '⭐', '✨', '🌟', '💖', '🎊']
  const parts = []
  for (let i = 0; i < 32; i++) {
    const useEmoji = Math.random() > 0.55
    parts.push({
      id: Math.random().toString(36).slice(2),
      left: 50 + (Math.random() - 0.5) * 20,
      tx: (Math.random() - 0.5) * 160,
      ty: -70 - Math.random() * 40,
      rot: (Math.random() - 0.5) * 720,
      size: useEmoji ? 24 + Math.random() * 14 : 10 + Math.random() * 14,
      color: colors[Math.floor(Math.random() * colors.length)],
      emoji: useEmoji ? emojis[Math.floor(Math.random() * emojis.length)] : null,
      delay: Math.random() * 140,
      shape: Math.random() > 0.5 ? 'c' : 's'
    })
  }
  confetti.value = parts
  setTimeout(() => { confetti.value = [] }, 1500)
}

function addRipple(e, cardEl) {
  const rect = cardEl.getBoundingClientRect()
  const x = (e.clientX ?? e.touches?.[0]?.clientX ?? rect.left + rect.width / 2) - rect.left
  const y = (e.clientY ?? e.touches?.[0]?.clientY ?? rect.top + rect.height / 2) - rect.top
  const id = Math.random().toString(36).slice(2)
  ripples.value.push({ id, x, y })
  setTimeout(() => { ripples.value = ripples.value.filter(r => r.id !== id) }, 600)
}

function checkBadges() {
  const snap = badgeSnapshot.value
  for (const b of BADGES) {
    if (unlockedBadges.value.includes(b.id)) continue
    const { have, need } = b.progress(snap)
    if (have >= need) {
      unlockedBadges.value = [...unlockedBadges.value, b.id]
      setTimeout(() => {
        badgeUnlocked.value = b
        playLevelUp()
        haptic([40, 60, 40, 60])
        setTimeout(() => { badgeUnlocked.value = null }, 2500)
      }, 1500)
      break
    }
  }
}

function checkCategoryUnlock(prevUnlocked) {
  const newUnlocked = unlockedCount.value
  if (newUnlocked > prevUnlocked) {
    const newCat = LEARNING_PATH[newUnlocked - 1]
    setTimeout(() => {
      catUnlockedPopup.value = newCat
      playLevelUp()
      haptic([60, 80, 60, 80])
      setTimeout(() => { catUnlockedPopup.value = null }, 2800)
    }, 2000)
  }
}

function selectChoice(id, e) {
  if (locked.value) return
  if (hiddenIds.value.includes(id)) return
  if (childLockEnabled.value) return // Block interaction if child lock active

  trackInteraction() // Reset inactivity timer

  selectedId.value = id
  if (e?.currentTarget) addRipple(e, e.currentTarget)
  playTap()

  // Track category tried
  if (category.value !== 'all') {
    categoriesTried.value = new Set([...Array.from(categoriesTried.value), category.value])
  }

  sessionQuestionsCount.value += 1

  if (id === correctId.value) {
    const prevUnlocked = unlockedCount.value
    feedback.value = 'success'
    locked.value = true
    const prevLevel = level.value
    score.value += 1
    streak.value += 1

    // Track session perfect (consecutive correct answers)
    sessionCorrect.value += 1
    if (sessionCorrect.value > sessionPerfect.value) {
      sessionPerfect.value = sessionCorrect.value
    }

    // Track fast answers (< 2 seconds)
    const answerTime = Date.now() - answerStartTime.value
    if (answerTime < 2000) {
      fastAnswers.value += 1
    }

    // Track comebacks (correct answer after an error)
    // This is tracked when streak was reset to 0 previously and now we're correct again
    if (sessionCorrect.value === 1 && score.value > 1) {
      comebacks.value += 1
    }

    mastery.value = {
      ...mastery.value,
      [correctId.value]: (mastery.value[correctId.value] || 0) + 1
    }
    if (streak.value > bestStreak.value) bestStreak.value = streak.value
    playSuccess()
    haptic([30, 40, 60])
    mascotState.value = streak.value >= 3 ? 'party' : 'happy'
    celebrate.value = PRAISES[Math.floor(Math.random() * PRAISES.length)]
    launchConfetti()

    const leveledUp = level.value > prevLevel
    if (leveledUp) {
      setTimeout(() => {
        levelUpVisible.value = true
        playLevelUp()
        haptic([50, 60, 50, 60, 80])
      }, 700)
      setTimeout(() => { levelUpVisible.value = false }, 1700)
    }
    checkBadges()
    checkCategoryUnlock(prevUnlocked)

    // Session summary after 20 questions
    if (sessionQuestionsCount.value >= 20) {
      const delay = leveledUp ? 1800 : 1200
      setTimeout(() => {
        endSessionSummary()
      }, delay)
    } else {
      const delay = leveledUp ? 1800 : 1200
      setTimeout(() => {
        celebrate.value = null
        mascotState.value = 'idle'
        generateQuestion()
      }, delay)
    }
  } else {
    feedback.value = 'error'
    streak.value = 0
    sessionCorrect.value = 0 // Reset session correct count on error
    playError()
    haptic(120)
    mascotState.value = 'sad'
    setTimeout(() => {
      if (targetWord.value) speak(targetWord.value.th)
      feedback.value = null
      selectedId.value = null
      mascotState.value = 'listen'
      setTimeout(() => { mascotState.value = 'idle' }, 800)
    }, 900)
  }
}

function repeatWord() {
  if (targetWord.value) speak(targetWord.value.th)
  mascotState.value = 'listen'
  setTimeout(() => { mascotState.value = 'idle' }, 800)
}

function useHint() {
  if (hintsLeft.value <= 0 || locked.value) return
  const wrongs = choices.value.filter(c => c.id !== correctId.value && !hiddenIds.value.includes(c.id))
  if (wrongs.length <= 1) return
  const toHide = Math.max(1, Math.floor(wrongs.length / 2))
  hiddenIds.value = [...hiddenIds.value, ...shuffle(wrongs).slice(0, toHide).map(w => w.id)]
  hintsLeft.value--
  hintsUsedThisSession.value = true // Mark that hints were used
  playTap()
  haptic(30)
}

function enterPicker() {
  screen.value = 'picker'
  try { new (window.AudioContext || window.webkitAudioContext)().resume?.() } catch (_) {}
}

// Flag pour tracker si l'utilisateur a utilisé des indices dans la session
const hintsUsedThisSession = ref(false)

function chooseCategory(cat) {
  if (!isCatUnlocked(cat)) return
  category.value = cat
  screen.value = 'play'
  streak.value = 0
  hintsLeft.value = 3
  sessionCorrect.value = 0 // Reset session correct counter
  hintsUsedThisSession.value = false // Reset hint tracking
  childLockEnabled.value = false
  lastInteractionTime.value = Date.now()
  startSessionTimer() // Start inactivity & duration tracking
  generateQuestion()
}

function goHome() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
  // Track no-hint session badge
  if (!hintsUsedThisSession.value && sessionCorrect.value >= 5) {
    noHintSessions.value += 1
  }
  screen.value = 'picker'
  streak.value = 0
  sessionCorrect.value = 0
}

function goProfile() { screen.value = 'profile' }

function resetAll() {
  if (!confirm('Reset all progress?')) return
  score.value = 0
  bestStreak.value = 0
  unlockedBadges.value = []
  mastery.value = {}
  streak.value = 0
  sessionCorrect.value = 0
  sessionPerfect.value = 0
  fastAnswers.value = 0
  comebacks.value = 0
  noHintSessions.value = 0
  categoriesTried.value = new Set()
  try { localStorage.removeItem(STORAGE_KEY) } catch (_) {}
}

// ==================== Mascotte & UI helpers ====================
const streakStars = computed(() => {
  const n = Math.min(streak.value, 5)
  return Array.from({ length: 5 }, (_, i) => i < n)
})
const streakFire = computed(() => streak.value >= 3)

function badgeProgress(b) { return b.progress(badgeSnapshot.value) }
function pct(have, need) {
  return Math.min(100, Math.round((have / need) * 100))
}

function formatDate(ts) {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
const daysPlayed = computed(() => {
  const ms = Date.now() - profileCreatedAt.value
  return Math.max(1, Math.floor(ms / (1000 * 60 * 60 * 24)) + 1)
})

// ==================== Cache offline des emojis ====================
const cacheSupported = typeof caches !== 'undefined'
const cachedCount = ref(0)
const precaching = ref(false)
const precacheProgress = ref(0)

async function refreshCacheCount() {
  if (!cacheSupported) return
  try {
    const cache = await caches.open('emoji-v1')
    const keys = await cache.keys()
    cachedCount.value = keys.length
  } catch (_) {}
}

async function precacheAllEmojis() {
  if (!cacheSupported || precaching.value) return
  precaching.value = true
  precacheProgress.value = 0
  try {
    const cache = await caches.open('emoji-v1')
    const urls = WORDS.map(w => svgUrl(w.hex))
    let done = 0
    const concurrency = 8
    for (let i = 0; i < urls.length; i += concurrency) {
      const batch = urls.slice(i, i + concurrency)
      await Promise.all(batch.map(async url => {
        try {
          const hit = await cache.match(url)
          if (!hit) {
            const res = await fetch(url, { cache: 'reload' })
            if (res && res.ok) await cache.put(url, res.clone())
          }
        } catch (_) {}
        done++
        precacheProgress.value = Math.round((done / urls.length) * 100)
      }))
    }
    await refreshCacheCount()
  } finally {
    precaching.value = false
    setTimeout(() => { precacheProgress.value = 0 }, 1500)
  }
}

async function clearEmojiCache() {
  if (!cacheSupported) return
  if (!confirm('Clear cached images?')) return
  try {
    await caches.delete('emoji-v1')
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage('clear-cache')
    }
    cachedCount.value = 0
  } catch (_) {}
}

// ==================== Fullscreen ====================
const isFullscreen = ref(false)
const fullscreenSupported = typeof document !== 'undefined' &&
  !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen)

function toggleFullscreen() {
  try {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      const el = document.documentElement
      if (el.requestFullscreen) el.requestFullscreen()
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen()
    } else {
      if (document.exitFullscreen) document.exitFullscreen()
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen()
    }
  } catch (e) {
    console.warn('[fullscreen] failed:', e)
  }
}
function onFsChange() {
  isFullscreen.value = !!(document.fullscreenElement || document.webkitFullscreenElement)
}

// ==================== Auth Firebase ====================
async function initAuth() {
  if (!firebaseEnabled) return
  const newUid = await signInAnon()
  if (!newUid) return
  uid.value = newUid
  // fusionne les données distantes si plus récentes
  const remote = await loadProfile(newUid)
  if (remote && remote.updatedAt && remote.updatedAt > (saved.updatedAt || 0)) {
    if (remote.name) profileName.value = remote.name
    if (remote.avatar) profileAvatar.value = remote.avatar
    if (remote.createdAt) profileCreatedAt.value = remote.createdAt
    if (typeof remote.score === 'number') score.value = remote.score
    if (typeof remote.bestStreak === 'number') bestStreak.value = remote.bestStreak
    if (Array.isArray(remote.unlockedBadges)) unlockedBadges.value = remote.unlockedBadges
    if (remote.mastery) mastery.value = remote.mastery
    // New badge stats
    if (typeof remote.sessionPerfect === 'number') sessionPerfect.value = remote.sessionPerfect
    if (typeof remote.fastAnswers === 'number') fastAnswers.value = remote.fastAnswers
    if (typeof remote.comebacks === 'number') comebacks.value = remote.comebacks
    if (typeof remote.noHintSessions === 'number') noHintSessions.value = remote.noHintSessions
    if (Array.isArray(remote.categoriesTried)) categoriesTried.value = new Set(remote.categoriesTried)
  }
}

onMounted(() => {
  loadVoices()
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = loadVoices
  }
  initAuth()
  refreshCacheCount()
  document.addEventListener('fullscreenchange', onFsChange)
  document.addEventListener('webkitfullscreenchange', onFsChange)
})
onUnmounted(() => {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
  document.removeEventListener('fullscreenchange', onFsChange)
  document.removeEventListener('webkitfullscreenchange', onFsChange)
})
</script>

<template>
  <div class="game" :class="{ 'child-lock-active': childLockEnabled }">
    <!-- Child Lock Overlay -->
    <transition name="fade">
      <div v-if="childLockEnabled" class="child-lock-overlay" @click="childLockEnabled = false">
        <div class="child-lock-message">
          <div class="lock-emoji">🔒</div>
          <p class="thai">โปรแกรมรักษาความปลอดภัย</p>
          <p>CHILD LOCK ACTIVE</p>
          <p class="small">Tap anywhere to unlock</p>
        </div>
      </div>
    </transition>

    <!-- Fond décoratif -->
    <div class="bubbles" aria-hidden="true">
      <span class="bubble b1">⭐</span>
      <span class="bubble b2">🌈</span>
      <span class="bubble b3">☁️</span>
      <span class="bubble b4">✨</span>
      <span class="bubble b5">🎈</span>
      <span class="bubble b6">💫</span>
    </div>

    <!-- ========== START ========== -->
    <div v-if="screen === 'start'" class="start">
      <div class="start-card">
        <div class="start-mascot">{{ profileAvatar }}</div>
        <h1 class="thai">เรียนภาษาไทย</h1>
        <p class="sub">LEARN THAI</p>
        <p v-if="profileName" class="greet thai">สวัสดี {{ profileName }}!</p>
        <div v-if="score > 0" class="stats-mini">
          <div><span class="stats-n">{{ score }}</span><span class="stats-l">WORDS</span></div>
          <div><span class="stats-n">LVL {{ level }}</span><span class="stats-l">LEVEL</span></div>
          <div><span class="stats-n">{{ bestStreak }}</span><span class="stats-l">STREAK</span></div>
        </div>
        <button class="start-btn" @click="enterPicker">
          <span class="thai">{{ score > 0 ? 'เล่นต่อ' : 'เริ่มเลย !' }}</span>
          <small>{{ score > 0 ? 'CONTINUE' : 'START' }}</small>
        </button>
        <button class="link-btn" @click="goProfile">
          <span>👤</span>
          <span class="thai">โปรไฟล์</span>
          <span>· PROFILE</span>
        </button>
        <p v-if="!hasThaiVoice" class="warn">
          ⚠️ No Thai voice detected. Install a « ไทย / Thai » voice
          in system settings for correct pronunciation.
        </p>
      </div>
    </div>

    <!-- ========== PROFILE ========== -->
    <div v-else-if="screen === 'profile'" class="profile">
      <header class="picker-header">
        <button class="icon-btn" @click="screen = 'start'" aria-label="Back">←</button>
        <h2 class="thai">โปรไฟล์</h2>
        <div class="level-mini">LVL {{ level }}</div>
      </header>

      <!-- Avatar + nom -->
      <div class="profile-card">
        <div class="avatar-big" @click="profileAvatar = AVATARS[(AVATARS.indexOf(profileAvatar) + 1) % AVATARS.length]">
          {{ profileAvatar }}
        </div>
        <div class="avatar-list">
          <button
            v-for="a in AVATARS"
            :key="a"
            class="avatar-choice"
            :class="{ on: profileAvatar === a }"
            @click="profileAvatar = a"
          >{{ a }}</button>
        </div>
        <input
          class="name-input"
          v-model="profileName"
          placeholder="ชื่อ · Your name"
          maxlength="20"
        />
        <div class="profile-meta">
          <div>📅 {{ formatDate(profileCreatedAt) }}</div>
          <div>🗓️ {{ daysPlayed }} days</div>
          <div v-if="uid" class="cloud-ok">☁️ synced</div>
          <div v-else-if="firebaseEnabled" class="cloud-pending">☁️ offline</div>
        </div>
      </div>

      <!-- Badges récents (affichage épinglé) -->
      <div v-if="unlockedBadges.length > 0" class="recent-badges">
        <div class="recent-badges-title">🏅 Derniers badges · Latest badges</div>
        <div class="recent-badges-list">
          <div
            v-for="badgeId in unlockedBadges.slice(-3).reverse()"
            :key="badgeId"
            class="recent-badge"
          >
            <div class="recent-badge-emoji">{{ BADGES.find(b => b.id === badgeId)?.emoji }}</div>
            <div class="recent-badge-name">{{ BADGES.find(b => b.id === badgeId)?.th }}</div>
          </div>
        </div>
      </div>

      <!-- Stats principales -->
      <div class="stats-box">
        <div class="stat">
          <span class="stat-emoji">🏆</span>
          <span class="stat-n">{{ score }}</span>
          <span class="stat-l">CORRECT</span>
        </div>
        <div class="stat">
          <span class="stat-emoji">📖</span>
          <span class="stat-n">{{ masteredWordsCount }}/{{ WORDS.length }}</span>
          <span class="stat-l">MASTERED</span>
        </div>
        <div class="stat">
          <span class="stat-emoji">🗂️</span>
          <span class="stat-n">{{ masteredCatsCount }}/{{ LEARNING_PATH.length }}</span>
          <span class="stat-l">CATEGORIES</span>
        </div>
        <div class="stat">
          <span class="stat-emoji">🔥</span>
          <span class="stat-n">{{ bestStreak }}</span>
          <span class="stat-l">BEST STREAK</span>
        </div>
      </div>

      <!-- Progression catégories -->
      <div class="section-title thai">ความคืบหน้า · PROGRESS</div>
      <div class="cat-progress-list">
        <div
          v-for="(cat, i) in LEARNING_PATH"
          :key="cat"
          class="cat-progress"
          :class="{ locked: i >= unlockedCount, done: isCatMastered(cat) }"
        >
          <div class="cat-prog-head">
            <span class="cat-prog-emoji">{{ CATEGORY_META[cat].emoji }}</span>
            <div class="cat-prog-info">
              <div class="cat-prog-th thai">{{ CATEGORY_META[cat].th }}</div>
              <div class="cat-prog-en">{{ CATEGORY_META[cat].en }}</div>
            </div>
            <span v-if="i >= unlockedCount" class="lock-mini">🔒</span>
            <span v-else-if="isCatMastered(cat)" class="done-mini">✓</span>
            <span class="cat-prog-num">{{ catMasteredWords(cat) }}/{{ catCount(cat) }}</span>
          </div>
          <div class="cat-prog-bar">
            <div class="cat-prog-fill" :style="{ width: Math.min(100, catMasteryRatio(cat) * 100) + '%' }"></div>
          </div>
        </div>
      </div>

      <!-- Badges -->
      <div class="section-title thai">
        เหรียญ · BADGES · {{ unlockedBadges.length }}/{{ BADGES.length }}
      </div>
      <div class="badges-grid">
        <div
          v-for="b in BADGES"
          :key="b.id"
          class="badge-box"
          :class="{ unlocked: unlockedBadges.includes(b.id) }"
        >
          <div class="badge-emoji">{{ unlockedBadges.includes(b.id) ? b.emoji : '🔒' }}</div>
          <div class="badge-th thai">{{ b.th }}</div>
          <div class="badge-en">{{ b.en }}</div>
          <div class="badge-bar">
            <div
              class="badge-bar-fill"
              :style="{ width: pct(badgeProgress(b).have, badgeProgress(b).need) + '%' }"
            ></div>
          </div>
          <div class="badge-num">{{ badgeProgress(b).have }}/{{ badgeProgress(b).need }}</div>
        </div>
      </div>

      <!-- Paramètres / optimisation -->
      <div class="section-title thai">ตั้งค่า · SETTINGS</div>

      <div class="settings-card">
        <!-- Plein écran -->
        <div class="setting-row">
          <div class="setting-info">
            <div class="setting-emoji">📱</div>
            <div>
              <div class="setting-title thai">เต็มจอ</div>
              <div class="setting-desc">FULLSCREEN</div>
            </div>
          </div>
          <button
            class="setting-btn"
            :class="{ on: isFullscreen }"
            :disabled="!fullscreenSupported"
            @click="toggleFullscreen"
          >{{ isFullscreen ? 'ON' : 'OFF' }}</button>
        </div>

        <!-- Téléchargement emojis -->
        <div class="setting-row column">
          <div class="setting-info">
            <div class="setting-emoji">📥</div>
            <div>
              <div class="setting-title thai">โหลดรูปภาพ</div>
              <div class="setting-desc">
                DOWNLOAD {{ WORDS.length }} IMAGES · {{ cachedCount }}/{{ WORDS.length }}
              </div>
            </div>
            <button
              v-if="cachedCount > 0 && !precaching"
              class="setting-mini"
              @click="clearEmojiCache"
              title="Clear cache"
            >🗑</button>
          </div>
          <div v-if="precaching" class="dl-progress">
            <div class="dl-bar"><div class="dl-fill" :style="{ width: precacheProgress + '%' }"></div></div>
            <div class="dl-pct">{{ precacheProgress }}%</div>
          </div>
          <button
            v-else
            class="setting-cta"
            :disabled="!cacheSupported || cachedCount >= WORDS.length"
            @click="precacheAllEmojis"
          >
            <span v-if="!cacheSupported">NOT SUPPORTED</span>
            <span v-else-if="cachedCount >= WORDS.length" class="thai">✓ ดาวน์โหลดแล้ว</span>
            <span v-else class="thai">⬇️ ดาวน์โหลดทั้งหมด · DOWNLOAD ALL</span>
          </button>
          <div v-if="cachedCount > 0 && cachedCount < WORDS.length && !precaching" class="dl-hint">
            Some images already cached. Tap to finish.
          </div>
        </div>
      </div>

      <button class="reset-btn" @click="resetAll">Reset progress</button>
    </div>

    <!-- ========== PICKER ========== -->
    <div v-else-if="screen === 'picker'" class="picker">
      <header class="picker-header">
        <button class="icon-btn" @click="screen = 'start'" aria-label="Back">←</button>
        <h2 class="thai">เลือกหมวด</h2>
        <button class="icon-btn" @click="goProfile" aria-label="Profile">👤</button>
      </header>

      <div class="unlock-info">
        <span class="thai">{{ unlockedCount }} / {{ LEARNING_PATH.length }}</span>
        <span class="unlock-info-en">CATEGORIES UNLOCKED</span>
      </div>

      <div class="picker-grid">
        <button
          class="cat-card cat-featured"
          :disabled="!isCatUnlocked('all')"
          :style="{ background: CATEGORY_META.all.bg, boxShadow: `0 8px 0 ${CATEGORY_META.all.shadow}, 0 14px 24px rgba(0,0,0,0.1)` }"
          @click="chooseCategory('all')"
        >
          <span class="cat-emoji">🌍</span>
          <span class="cat-th thai">ทั้งหมด</span>
          <span class="cat-label">ALL</span>
          <span class="cat-count">{{ wordPool.length }}</span>
          <span v-if="!isCatUnlocked('all')" class="cat-lock">🔒</span>
        </button>
        <button
          v-for="(cat, i) in LEARNING_PATH"
          :key="cat"
          class="cat-card"
          :class="{ locked: !isCatUnlocked(cat), mastered: isCatMastered(cat) }"
          :disabled="!isCatUnlocked(cat)"
          :style="{ background: CATEGORY_META[cat].bg, boxShadow: `0 8px 0 ${CATEGORY_META[cat].shadow}, 0 14px 24px rgba(0,0,0,0.08)` }"
          @click="chooseCategory(cat)"
        >
          <span class="cat-emoji">{{ CATEGORY_META[cat].emoji }}</span>
          <span class="cat-th thai">{{ CATEGORY_META[cat].th }}</span>
          <span class="cat-label">{{ CATEGORY_META[cat].en }}</span>
          <span class="cat-count">{{ catMasteredWords(cat) }}/{{ catCount(cat) }}</span>
          <span v-if="!isCatUnlocked(cat)" class="cat-lock">🔒</span>
          <span v-else-if="isCatMastered(cat)" class="cat-done">★</span>
          <span v-if="isCatUnlocked(cat) && catMasteryRatio(cat) > 0" class="cat-mastery-bar">
            <span class="mb-fill" :style="{ width: Math.min(100, catMasteryRatio(cat) * 100) + '%' }"></span>
          </span>
        </button>
      </div>

      <!-- Sentences Mode Button (si 5+ catégories débloquées) -->
      <button
        v-if="unlockedCount >= 5"
        class="sentences-mode-btn"
        @click="enterSentencesPicker"
      >
        <span class="emoji">📖</span>
        <span class="label thai">โหมดประโยค</span>
        <span class="sublabel">SENTENCES</span>
      </button>

      <!-- Conjugation Mode Button (si 5+ catégories débloquées) -->
      <button
        v-if="unlockedCount >= 5"
        class="sentences-mode-btn"
        @click="enterConjugationPicker"
      >
        <span class="emoji">📚</span>
        <span class="label thai">โหมดคำกริยา</span>
        <span class="sublabel">CONJUGATION</span>
      </button>
    </div>

    <!-- ========== SENTENCES PICKER ========== -->
    <div v-else-if="screen === 'sentences-picker'" class="picker">
      <header class="picker-header">
        <button class="icon-btn" @click="screen = 'picker'" aria-label="Back">←</button>
        <h2 class="thai">เลือกประโยค</h2>
        <button class="icon-btn" @click="goProfile" aria-label="Profile">👤</button>
      </header>

      <div class="unlock-info">
        <span class="thai">📖 โหมดประโยค</span>
        <span class="unlock-info-en">SENTENCE MODE</span>
      </div>

      <div class="picker-grid">
        <button
          v-for="cat in SENTENCE_CATEGORIES"
          :key="cat.id"
          class="cat-card"
          :style="{ background: `linear-gradient(135deg, #fff9e6, #ffecb3)`, boxShadow: `0 8px 0 #d9a92a, 0 14px 24px rgba(0,0,0,0.08)` }"
          @click="chooseSentenceCategory(cat.id.replace('sentences-', ''))"
        >
          <span class="cat-emoji">{{ cat.emoji }}</span>
          <span class="cat-th thai">{{ cat.th }}</span>
          <span class="cat-label">{{ cat.name }}</span>
        </button>
      </div>
    </div>

    <!-- ========== SENTENCES PLAY ========== -->
    <div v-else-if="screen === 'sentences'" class="sentences-game">
      <header class="top">
        <div class="top-row">
          <button class="home-btn" @click="goHomeSentences" aria-label="Home">🏠</button>
          <div class="level-box">
            <div class="level-badge">
              <span class="level-num">{{ level }}</span>
              <span class="level-label">LVL</span>
            </div>
          </div>
          <div class="right-stats">
            <div class="streak" aria-label="streak">
              <span v-if="streakFire" class="fire">🔥</span>
              <span v-for="(on, i) in streakStars" :key="i" class="streak-star" :class="{ on }">★</span>
            </div>
          </div>
        </div>

        <div class="cat-pill">
          <span class="cat-pill-emoji">📖</span>
          <span class="thai">ประโยค</span>
          <span class="cat-pill-en">· SENTENCES</span>
          <span class="cat-pill-spacer"></span>
          <span class="score-inline">🏆 {{ sentenceScore }}</span>
        </div>

        <div class="replay-row">
          <div class="mascot" :class="'mascot-' + mascotState">{{ MASCOT_EMOJI[mascotState] }}</div>
          <button class="replay" @click="replaySentencePhrase" :aria-label="'Replay phrase'">
            <div class="replay-icon-wrapper">
              <span class="replay-icon">🔊</span>
            </div>
            <span class="replay-text">
              <span class="word thai" v-if="currentSentence">{{ currentSentence.th }}</span>
              <span class="rom" v-if="currentSentence">{{ currentSentence.rom }}</span>
            </span>
            <span class="replay-waves"><span></span><span></span><span></span><span></span></span>
          </button>
        </div>
      </header>

      <main class="sentences-grid" :key="sentenceKey">
        <div class="sentence-context" v-if="currentSentence">
          <span class="context-emoji">{{ currentSentence.image }}</span>

          <!-- Traductions FR + EN EN DESSUS du Thai romanisé (visibles tout le temps) -->
          <div class="sentence-translations-top">
            <div class="translation-row fr-row">
              <span class="flag">🇫🇷</span>
              <p>{{ currentSentence.fr }}</p>
            </div>
            <div class="translation-row en-row">
              <span class="flag">🇬🇧</span>
              <p>{{ getEnglishTranslation(currentSentence.id) }}</p>
            </div>
          </div>

          <!-- Phrase Thai avec texte romanisé -->
          <p class="sentence-text thai">{{ currentSentence.th }}</p>
          <p class="sentence-text romanized">{{ currentSentence.rom }}</p>

          <!-- Difficulté badge -->
          <div class="difficulty-badge" :class="`diff-${currentSentence.difficulty}`">
            {{ currentSentence.difficulty === 1 ? '⭐ Facile' : '⭐⭐ Difficile' }}
          </div>
        </div>

        <div class="sentences-choices">
          <button
            v-for="(choice, i) in sentenceChoices"
            :key="i"
            class="sentence-choice"
            :class="{
              success: sentenceFeedback === 'success' && choice.isCorrect,
              error: sentenceFeedback === 'error' && sentenceSelectedId === choice.isCorrect,
              dim: sentenceFeedback === 'success' && !choice.isCorrect
            }"
            :style="{ background: choice._color.bg, boxShadow: `0 8px 0 ${choice._color.shadow}` }"
            :disabled="sentenceLocked"
            @click="selectSentenceChoice(choice.isCorrect)"
          >
            <span class="choice-emoji">{{ choice.emoji }}</span>
          </button>
        </div>

        <!-- Hint Button -->
        <button
          class="sentence-hint-btn"
          :disabled="sentenceHintsLeft <= 0 || sentenceLocked"
          @click="useSentenceHint"
        >
          <span class="hint-emoji">💡</span>
          <span class="hint-count">{{ sentenceHintsLeft }}</span>
        </button>
      </main>

      <Transition name="celebrate">
        <div v-if="celebrate" class="celebrate" aria-hidden="true">
          <span class="celebrate-text thai">{{ celebrate }}</span>
        </div>
      </Transition>

      <div v-if="confetti.length" class="confetti" aria-hidden="true">
        <span
          v-for="p in confetti"
          :key="p.id"
          class="confetti-piece"
          :class="[p.emoji ? 'emoji' : (p.shape === 'c' ? 'circle' : 'square')]"
          :style="{
            left: p.left + '%',
            '--tx': p.tx + 'vw',
            '--ty': p.ty + 'vh',
            '--rot': p.rot + 'deg',
            width: p.emoji ? 'auto' : p.size + 'px',
            height: p.emoji ? 'auto' : p.size + 'px',
            background: p.emoji ? 'transparent' : p.color,
            fontSize: p.emoji ? p.size + 'px' : null,
            animationDelay: p.delay + 'ms'
          }"
        >{{ p.emoji }}</span>
      </div>
    </div>

    <!-- ========== CONJUGATION PICKER ========== -->
    <div v-else-if="screen === 'conjugation-picker'" class="picker">
      <header class="picker-header">
        <button class="icon-btn" @click="screen = 'picker'" aria-label="Back">←</button>
        <h2 class="thai">เลือกกริยา</h2>
        <button class="icon-btn" @click="goProfile" aria-label="Profile">👤</button>
      </header>

      <div class="unlock-info">
        <span class="thai">📚 โหมดคำกริยา</span>
        <span class="unlock-info-en">CONJUGATION MODE</span>
      </div>

      <div class="picker-grid">
        <button
          v-for="cat in CONJUGATION_CATEGORIES"
          :key="cat.id"
          class="cat-card"
          :style="{ background: `linear-gradient(135deg, #e6d7ff, #a78bfa)`, boxShadow: `0 8px 0 #5f45c2, 0 14px 24px rgba(0,0,0,0.08)` }"
          @click="chooseConjugationCategory(cat.id.replace('conj-', ''))"
        >
          <span class="cat-emoji">{{ cat.emoji }}</span>
          <span class="cat-th thai">{{ cat.th }}</span>
          <span class="cat-label">{{ cat.name }}</span>
        </button>
      </div>
    </div>

    <!-- ========== CONJUGATION PLAY ========== -->
    <div v-else-if="screen === 'conjugation'" class="sentences-game">
      <header class="top">
        <div class="top-row">
          <button class="home-btn" @click="goHomeConjugation" aria-label="Home">🏠</button>
          <div class="level-box">
            <div class="level-badge">
              <span class="level-num">{{ level }}</span>
              <span class="level-label">LVL</span>
            </div>
          </div>
          <div class="right-stats">
            <div class="streak" aria-label="streak">
              <span v-if="streakFire" class="fire">🔥</span>
              <span v-for="(on, i) in streakStars" :key="i" class="streak-star" :class="{ on }">★</span>
            </div>
          </div>
        </div>

        <div class="cat-pill">
          <span class="cat-pill-emoji">📚</span>
          <span class="thai">คำกริยา</span>
          <span class="cat-pill-en">· CONJUGATION</span>
          <span class="cat-pill-spacer"></span>
          <span class="score-inline">🏆 {{ conjugationScore }}</span>
        </div>

        <div class="replay-row">
          <div class="mascot" :class="'mascot-' + mascotState">{{ MASCOT_EMOJI[mascotState] }}</div>
          <button class="replay" @click="replayConjugationPhrase" :aria-label="'Replay verb'">
            <div class="replay-icon-wrapper">
              <span class="replay-icon">🔊</span>
            </div>
            <span class="replay-text">
              <span class="word thai" v-if="currentConjugation">{{ currentConjugation.th }}</span>
              <span class="rom" v-if="currentConjugation">{{ currentConjugation.rom }}</span>
            </span>
            <span class="replay-waves"><span></span><span></span><span></span><span></span></span>
          </button>
        </div>
      </header>

      <main class="sentences-grid" :key="conjugationKey">
        <div class="sentence-context" v-if="currentConjugation">
          <span class="context-emoji">{{ currentConjugation.image }}</span>

          <!-- Verbe Thai - Main Display -->
          <p class="sentence-text thai" style="font-size: 52px; margin: 20px 0 4px; font-weight: 800;">{{ currentConjugation.th }}</p>

          <!-- Traduction FR + EN -->
          <div class="sentence-translations-top" style="margin-bottom: 16px; display: flex; gap: 10px;">
            <div class="translation-row fr-row" style="background: #f0f8ff; padding: 8px 12px; border-radius: 8px; flex: 1; text-align: center;">
              <span class="flag" style="display: block; font-size: 16px; margin-bottom: 4px;">🇫🇷</span>
              <p style="margin: 0; font-size: 12px; color: #2c3e50;">{{ currentConjugation.fr }}</p>
            </div>
            <div class="translation-row en-row" style="background: #f0fff0; padding: 8px 12px; border-radius: 8px; flex: 1; text-align: center;">
              <span class="flag" style="display: block; font-size: 16px; margin-bottom: 4px;">🇬🇧</span>
              <p style="margin: 0; font-size: 12px; color: #2c3e50;">{{ currentConjugation.meaning }}</p>
            </div>
          </div>

          <!-- Tense label -->
          <div class="difficulty-badge" :class="`diff-1`" style="background: linear-gradient(135deg, #a8e6a1, #5dc96f); box-shadow: 0 4px 0 #3a9a3f; margin-bottom: 16px;">
            <span style="font-weight: 800; font-size: 13px;">{{ getConjugationFormLabel(currentTense).en }}</span>
          </div>
        </div>

        <!-- Romanized text above choices -->
        <p class="sentence-text romanized" style="font-size: 13px; color: #999; margin-bottom: 12px; font-style: italic; text-align: center;">{{ currentConjugation.rom }}</p>

        <!-- Choix de conjugaisons - 3 columns -->
        <div class="sentence-choices" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 8px;">
          <button
            v-for="(choice, i) in conjugationChoices"
            :key="i"
            class="choice"
            :class="{
              selected: conjugationSelectedId === choice.isCorrect,
              correct: conjugationFeedback === 'success' && choice.isCorrect,
              wrong: conjugationFeedback === 'error' && conjugationSelectedId === choice.isCorrect
            }"
            :style="{
              background: choice._color,
              borderRadius: '14px',
              padding: '14px 8px',
              border: 'none',
              cursor: conjugationLocked ? 'not-allowed' : 'pointer',
              minHeight: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 0 rgba(0,0,0,0.1)',
              transition: 'transform 0.1s, box-shadow 0.1s',
              fontSize: '24px',
              fontWeight: '700'
            }"
            @click="selectConjugationChoice(choice.isCorrect)"
            :disabled="conjugationLocked"
          >
            {{ choice.text }}
          </button>
        </div>

        <!-- Feedback -->
        <div v-if="conjugationFeedback" class="feedback" :class="conjugationFeedback">
          <span v-if="conjugationFeedback === 'success'" class="feedback-text">✓ Correct!</span>
          <span v-else class="feedback-text">✗ Try again</span>
        </div>
      </main>

      <!-- Confetti & celebration -->
      <div class="confetti-container">
        <span
          v-for="p in confetti"
          :key="p.id"
          class="confetti"
          :style="{
            left: p.left + '%',
            transform: `translate(${p.tx}px, ${p.ty}px) rotate(${p.rot}deg)`,
            width: p.size + 'px',
            height: p.emoji ? 'auto' : p.size + 'px',
            background: p.emoji ? 'transparent' : p.color,
            fontSize: p.emoji ? p.size + 'px' : null,
            animationDelay: p.delay + 'ms'
          }"
        >{{ p.emoji }}</span>
      </div>
    </div>

    <!-- ========== SUMMARY ========== -->
    <div v-else-if="screen === 'summary'" class="summary">
      <div class="summary-card">
        <div class="summary-celebrate">🎉 🎊 🎉</div>
        <h2 class="thai">เสร็จสิ้น</h2>
        <p class="summary-subtitle">SESSION COMPLETE</p>

        <div class="summary-stats">
          <div class="stat-row">
            <span class="stat-emoji">✅</span>
            <span class="stat-label">Correct answers</span>
            <span class="stat-value">{{ sessionStats.correct }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-emoji">🔥</span>
            <span class="stat-label">Best streak</span>
            <span class="stat-value">{{ sessionStats.streak }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-emoji">🎯</span>
            <span class="stat-label">Accuracy</span>
            <span class="stat-value">{{ sessionStats.accuracy }}%</span>
          </div>
          <div class="stat-row">
            <span class="stat-emoji">⏱️</span>
            <span class="stat-label">Total time</span>
            <span class="stat-value">{{ sessionStats.totalTime }}s</span>
          </div>
          <div class="stat-row">
            <span class="stat-emoji">⚡</span>
            <span class="stat-label">Avg answer time</span>
            <span class="stat-value">{{ sessionStats.avgTime }}s</span>
          </div>
        </div>

        <div v-if="sessionStats.badgesEarned.length > 0" class="summary-badges">
          <p class="summary-section-title thai">เหรียญใหม่ · NEW BADGES</p>
          <div class="badges-row">
            <div v-for="badgeId in sessionStats.badgesEarned" :key="badgeId" class="summary-badge">
              {{ BADGES.find(b => b.id === badgeId)?.emoji }}
            </div>
          </div>
        </div>

        <div class="summary-actions">
          <button class="summary-btn btn-home" @click="goHome">
            <span class="thai">🏠 หน้าแรก</span>
            <small>HOME</small>
          </button>
          <button class="summary-btn btn-continue" @click="screen = 'picker'">
            <span class="thai">🔄 เลือกหมวดใหม่</span>
            <small>ANOTHER CATEGORY</small>
          </button>
        </div>

        <div class="summary-meta">
          <p class="thai">สุดยอด!</p>
          <p>You learned {{ sessionStats.wordsLearned.size }} words today! 🌟</p>
        </div>
      </div>
    </div>

    <!-- ========== PLAY ========== -->
    <template v-else>
      <header class="top">
        <div class="top-row">
          <button class="home-btn" @click="goHome" aria-label="Home">🏠</button>
          <div class="level-box">
            <div class="level-badge">
              <span class="level-num">{{ level }}</span>
              <span class="level-label">LVL</span>
            </div>
            <div class="xp-bar">
              <div class="xp-fill" :style="{ width: xpPct + '%' }"></div>
              <span class="xp-text">{{ xpInLevel }}/{{ xpRequiredForNextLevel }}</span>
            </div>
          </div>
          <div class="right-stats">
            <div class="streak" aria-label="streak">
              <span v-if="streakFire" class="fire">🔥</span>
              <span v-for="(on, i) in streakStars" :key="i" class="streak-star" :class="{ on }">★</span>
            </div>
          </div>
        </div>

        <div class="cat-pill">
          <span class="cat-pill-emoji">{{ currentCategoryMeta.emoji }}</span>
          <span class="thai">{{ currentCategoryMeta.th }}</span>
          <span class="cat-pill-en">· {{ currentCategoryMeta.en }}</span>
          <span class="cat-pill-spacer"></span>
          <span class="score-inline">🏆 {{ score }}</span>
        </div>

        <div class="replay-row">
          <div class="mascot" :class="'mascot-' + mascotState">{{ MASCOT_EMOJI[mascotState] }}</div>
          <button class="replay" :class="{ playing: mascotState === 'happy' }" @click="repeatWord" :aria-label="'Replay ' + (targetWord?.th || '')">
            <div class="replay-icon-wrapper">
              <span class="replay-icon">🔊</span>
            </div>
            <span class="replay-text">
              <span class="word thai">{{ targetWord?.th }}</span>
              <span class="rom">{{ targetWord?.rom }}</span>
            </span>
            <span class="replay-waves"><span></span><span></span><span></span><span></span></span>
          </button>
        </div>
      </header>

      <main
        class="grid"
        :key="questionKey"
        :class="{ 'grid-2': choices.length === 2, 'grid-3': choices.length === 3, 'grid-4': choices.length === 4 }"
      >
        <button
          v-for="(c, i) in choices"
          :key="c.id + '-' + questionKey"
          class="card"
          :class="{
            success: feedback === 'success' && selectedId === c.id,
            error: feedback === 'error' && selectedId === c.id,
            dim: feedback === 'success' && selectedId !== c.id,
            hidden: hiddenIds.includes(c.id)
          }"
          :style="{
            background: c._color.bg,
            boxShadow: `0 8px 0 ${c._color.shadow}, 0 14px 24px rgba(0,0,0,0.08)`,
            animationDelay: (i * 70) + 'ms'
          }"
          :disabled="locked || hiddenIds.includes(c.id)"
          @click="selectChoice(c.id, $event)"
        >
          <img class="emoji-img" :src="svgUrl(c.hex)" :alt="c.th" draggable="false" />
          <div class="card-translations" v-if="!(feedback === 'success' && c.id === correctId)">
            {{ c.fr }} · {{ c.en }}
          </div>
          <span v-if="feedback === 'success' && c.id === correctId" class="card-word thai">{{ c.th }}</span>
          <span v-for="r in ripples" :key="r.id" class="ripple" :style="{ left: r.x + 'px', top: r.y + 'px' }"></span>
        </button>
      </main>

      <button
        class="hint-btn"
        :disabled="hintsLeft <= 0 || locked || choices.length <= 2"
        @click="useHint"
      >
        <span class="hint-emoji">💡</span>
        <span class="hint-count">{{ hintsLeft }}</span>
      </button>

      <Transition name="celebrate">
        <div v-if="celebrate" class="celebrate" aria-hidden="true">
          <span class="celebrate-text thai">{{ celebrate }}</span>
        </div>
      </Transition>

      <Transition name="levelup">
        <div v-if="levelUpVisible" class="levelup" aria-hidden="true">
          <div class="levelup-card">
            <div class="levelup-arrow">↑</div>
            <div class="levelup-big">LVL {{ level }}</div>
            <div class="levelup-sub thai">ขึ้นเลเวล!</div>
          </div>
        </div>
      </Transition>

      <Transition name="levelup">
        <div v-if="badgeUnlocked" class="levelup" aria-hidden="true">
          <div class="levelup-card badge-card">
            <div class="badge-ribbon">✨ NEW ✨</div>
            <div class="levelup-emoji big">{{ badgeUnlocked.emoji }}</div>
            <div class="levelup-sub thai">{{ badgeUnlocked.th }}</div>
          </div>
        </div>
      </Transition>

      <Transition name="levelup">
        <div v-if="catUnlockedPopup" class="levelup" aria-hidden="true">
          <div class="levelup-card">
            <div class="badge-ribbon">🔓 UNLOCKED</div>
            <div class="levelup-emoji big">{{ CATEGORY_META[catUnlockedPopup].emoji }}</div>
            <div class="levelup-sub thai">{{ CATEGORY_META[catUnlockedPopup].th }}</div>
            <div class="levelup-en-sub">{{ CATEGORY_META[catUnlockedPopup].en }}</div>
          </div>
        </div>
      </Transition>

      <div v-if="confetti.length" class="confetti" aria-hidden="true">
        <span
          v-for="p in confetti"
          :key="p.id"
          class="confetti-piece"
          :class="[p.emoji ? 'emoji' : (p.shape === 'c' ? 'circle' : 'square')]"
          :style="{
            left: p.left + '%',
            '--tx': p.tx + 'vw',
            '--ty': p.ty + 'vh',
            '--rot': p.rot + 'deg',
            width: p.emoji ? 'auto' : p.size + 'px',
            height: p.emoji ? 'auto' : p.size + 'px',
            background: p.emoji ? 'transparent' : p.color,
            fontSize: p.emoji ? p.size + 'px' : null,
            animationDelay: p.delay + 'ms'
          }"
        >{{ p.emoji }}</span>
      </div>
    </template>

    <!-- Version Footer -->
    <div class="version-footer">v{{ APP_VERSION }}</div>
  </div>
</template>

<style scoped>
.game {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.bubbles { position: absolute; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
.bubble { position: absolute; font-size: 44px; opacity: 0.5; animation: float 9s ease-in-out infinite; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.08)); }
.b1 { top: 8%; left: 6%; } .b2 { top: 18%; right: 8%; animation-delay: 1.5s; font-size: 54px; }
.b3 { top: 48%; left: 4%; animation-delay: 3s; font-size: 64px; } .b4 { top: 62%; right: 6%; animation-delay: 4.5s; }
.b5 { top: 80%; left: 14%; animation-delay: 2s; font-size: 50px; } .b6 { top: 34%; right: 24%; animation-delay: 6s; }
@keyframes float { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-22px) rotate(8deg); } }

/* ============ START ============ */
.start { flex: 1; display: flex; align-items: center; justify-content: center; padding: 24px; position: relative; z-index: 1; overflow-y: auto; }
.start-card {
  background: #fff; border-radius: 32px; padding: 34px 28px; text-align: center;
  box-shadow: 0 14px 40px rgba(0,0,0,0.12); max-width: 460px; width: 100%;
  animation: card-pop 0.6s cubic-bezier(.34,1.56,.64,1);
}
@keyframes card-pop { 0% { transform: scale(0.7); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
.start-mascot { font-size: 96px; line-height: 1; animation: mascot-bounce 1.4s ease-in-out infinite; filter: drop-shadow(0 6px 10px rgba(0,0,0,0.15)); cursor: pointer; }
@keyframes mascot-bounce { 0%,100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-12px) rotate(3deg); } }
.start-card h1 { margin: 10px 0 2px; font-size: 44px; color: #3b3b4f; }
.start-card .sub { margin: 0 0 10px; color: #8a6ad6; font-weight: 800; font-size: 14px; letter-spacing: 3px; }
.start-card .greet { margin: 0 0 14px; color: #6a6a80; font-size: 20px; font-weight: 800; }
.stats-mini { display: flex; justify-content: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
.stats-mini > div { background: #faf4ff; border-radius: 16px; padding: 8px 12px; display: flex; flex-direction: column; align-items: center; min-width: 70px; box-shadow: 0 3px 0 #e5d5ff; }
.stats-n { font-size: 18px; font-weight: 800; color: #7c5fe6; line-height: 1; }
.stats-l { font-size: 10px; color: #8a8aa0; letter-spacing: 1px; margin-top: 2px; font-weight: 800; }
.start-btn {
  border: none; background: linear-gradient(180deg, #ffcf5c, #ff9d43);
  color: #3b2a00; font-weight: 800; padding: 16px 34px; border-radius: 999px; cursor: pointer;
  box-shadow: 0 8px 0 #d9731a, 0 14px 22px rgba(255,160,50,0.45);
  display: flex; flex-direction: column; align-items: center; gap: 2px; margin: 0 auto;
  animation: pulse-btn 1.8s ease-in-out infinite;
}
.start-btn span { font-size: 26px; line-height: 1; }
.start-btn small { font-size: 11px; opacity: 0.8; font-weight: 800; letter-spacing: 2px; }
.start-btn:active { transform: translateY(5px); box-shadow: 0 3px 0 #d9731a; animation: none; }
@keyframes pulse-btn { 0%,100% { transform: scale(1); } 50% { transform: scale(1.04); } }
.link-btn {
  margin-top: 16px; background: #faf4ff; border: none;
  color: #7c5fe6; padding: 10px 20px; border-radius: 999px;
  font-size: 14px; font-weight: 800; cursor: pointer;
  display: inline-flex; align-items: center; gap: 6px;
  box-shadow: 0 3px 0 #e5d5ff;
}
.link-btn:active { transform: translateY(2px); box-shadow: 0 1px 0 #e5d5ff; }
.warn { margin-top: 18px; font-size: 12px; color: #b0651a; background: #fff6e4; border-radius: 12px; padding: 10px 12px; line-height: 1.3; }

/* ============ PICKER ============ */
.picker { flex: 1; display: flex; flex-direction: column; z-index: 1; overflow-y: auto; padding: 16px 16px 24px; }
.picker-header { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 12px; margin-bottom: 10px; }
.picker-header h2 { margin: 0; text-align: center; font-size: 26px; color: #3b3b4f; }
.level-mini { background: linear-gradient(180deg, #a78bfa, #7c5fe6); border-radius: 999px; padding: 6px 14px; font-size: 14px; font-weight: 800; color: #fff; box-shadow: 0 3px 0 #5f45c2; }
.icon-btn {
  background: #fff; border: none; width: 46px; height: 46px; border-radius: 50%;
  font-size: 22px; font-weight: 800; cursor: pointer;
  box-shadow: 0 4px 0 #e5d5ff, 0 6px 12px rgba(0,0,0,0.08); color: #3b3b4f;
}
.icon-btn:active { transform: translateY(3px); box-shadow: 0 1px 0 #e5d5ff; }

.unlock-info {
  text-align: center; font-size: 13px; color: #7c5fe6;
  font-weight: 800; margin-bottom: 12px; letter-spacing: 1px;
}
.unlock-info-en { opacity: 0.7; margin-left: 8px; font-size: 11px; }

.picker-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 14px; margin-bottom: 20px; }
.cat-card {
  border: none; border-radius: 26px; padding: 18px 12px 14px;
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  cursor: pointer; transition: transform 0.12s cubic-bezier(.34,1.56,.64,1);
  animation: card-in 0.5s cubic-bezier(.34,1.56,.64,1) backwards;
  position: relative; overflow: hidden; min-height: 150px;
}
.cat-card::before {
  content: ''; position: absolute; top: -60%; left: -60%; width: 220%; height: 220%;
  background: radial-gradient(ellipse at center, rgba(255,255,255,0.35) 0%, transparent 55%); pointer-events: none;
}
.cat-card:hover:not(:disabled) { transform: translateY(-4px) rotate(-1deg); }
.cat-card:active:not(:disabled) { transform: translateY(4px); }
.cat-card.locked { cursor: not-allowed; filter: grayscale(0.6) brightness(0.85); opacity: 0.55; }
.cat-card.mastered::after {
  content: ''; position: absolute; inset: 0;
  border: 4px solid #ffd86b; border-radius: 26px; pointer-events: none;
  box-shadow: inset 0 0 0 2px #fff, 0 0 20px rgba(255, 216, 107, 0.6);
}
.cat-featured { grid-column: 1 / -1; min-height: 120px; flex-direction: row; justify-content: center; gap: 16px; padding: 14px 20px; }
.cat-featured .cat-emoji { font-size: 64px; }
.cat-featured .cat-th { font-size: 28px; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.15); }
.cat-featured .cat-label { font-size: 14px; color: rgba(255,255,255,0.9); letter-spacing: 2px; }
.cat-featured .cat-count { background: rgba(255,255,255,0.35); color: #fff; margin-top: 0; }
.cat-emoji { font-size: 54px; line-height: 1; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.2)); z-index: 1; transition: transform 0.3s ease; }
.cat-card:hover .cat-emoji { transform: scale(1.15) rotate(-5deg); }
.cat-th { font-size: 20px; color: #fff; font-weight: 800; text-shadow: 0 2px 3px rgba(0,0,0,0.2); z-index: 1; }
.cat-label { font-size: 11px; font-weight: 800; color: rgba(255,255,255,0.85); text-transform: uppercase; letter-spacing: 1.5px; z-index: 1; }
.cat-count { font-size: 11px; color: #fff; background: rgba(255,255,255,0.3); backdrop-filter: blur(4px); border-radius: 999px; padding: 2px 10px; margin-top: 4px; font-weight: 800; z-index: 1; }
.cat-lock {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  font-size: 48px; background: rgba(40, 30, 60, 0.45); backdrop-filter: blur(3px);
  border-radius: 26px; z-index: 3; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));
}
.cat-done {
  position: absolute; top: 8px; right: 8px;
  font-size: 22px; color: #ffd86b;
  text-shadow: 0 2px 4px rgba(0,0,0,0.4);
  z-index: 3; animation: star-spin 2s linear infinite;
}
@keyframes star-spin { 0%,100% { transform: scale(1) rotate(0); } 50% { transform: scale(1.2) rotate(20deg); } }
.cat-mastery-bar {
  position: absolute; bottom: 0; left: 0; right: 0; height: 5px;
  background: rgba(0,0,0,0.15); z-index: 2;
}
.mb-fill { display: block; height: 100%; background: linear-gradient(90deg, #ffd86b, #fff); box-shadow: 0 0 8px rgba(255,216,107,0.6); }

/* ============ PROFILE ============ */
.profile { flex: 1; display: flex; flex-direction: column; z-index: 1; overflow-y: auto; padding: 14px 14px 30px; gap: 12px; }
.profile-card {
  background: #fff; border-radius: 26px; padding: 20px; text-align: center;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
}
.avatar-big {
  font-size: 96px; line-height: 1; cursor: pointer;
  animation: mascot-bounce 2s ease-in-out infinite;
  filter: drop-shadow(0 6px 10px rgba(0,0,0,0.15));
}
.avatar-list {
  display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; margin: 10px 0;
}
.avatar-choice {
  background: #faf4ff; border: 2px solid transparent; border-radius: 12px;
  width: 42px; height: 42px; font-size: 22px; cursor: pointer; padding: 0;
  display: flex; align-items: center; justify-content: center;
}
.avatar-choice.on { border-color: #7c5fe6; background: #fff; box-shadow: 0 3px 0 #e5d5ff; transform: scale(1.1); }
.name-input {
  width: 100%; border: 2px solid #e5d5ff; background: #faf4ff;
  border-radius: 16px; padding: 12px 16px; font-size: 18px; font-weight: 800;
  color: #3b3b4f; text-align: center; font-family: inherit;
  box-sizing: border-box;
}
.name-input:focus { outline: none; border-color: #7c5fe6; }
.profile-meta {
  display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;
  font-size: 12px; color: #8a8aa0; font-weight: 700; margin-top: 10px;
}
.cloud-ok { color: #2a8a4a; }
.cloud-pending { color: #b0651a; }

/* Recent badges highlight section */
.recent-badges {
  background: linear-gradient(135deg, rgba(255,215,107,0.15), rgba(255,107,157,0.1));
  border-radius: 22px;
  padding: 16px;
  margin: 0 10px 10px;
  border: 2px dashed rgba(255,168,43,0.4);
}
.recent-badges-title {
  font-size: 12px;
  font-weight: 700;
  color: #8a6ad6;
  text-align: center;
  margin-bottom: 12px;
  letter-spacing: 1px;
}
.recent-badges-list {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}
.recent-badge {
  background: linear-gradient(180deg, #fff 0%, #fff9e6 100%);
  border-radius: 16px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 0 #ffd86b, 0 6px 12px rgba(255,168,43,0.25);
  border: 2px solid #ffd86b;
  animation: recent-badge-pulse 2s ease-in-out infinite;
  min-width: 70px;
}
@keyframes recent-badge-pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 4px 0 #ffd86b, 0 6px 12px rgba(255,168,43,0.25); }
  50% { transform: scale(1.03); box-shadow: 0 4px 0 #ffd86b, 0 8px 20px rgba(255,168,43,0.4); }
}
.recent-badge-emoji {
  font-size: 42px;
  line-height: 1;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
  animation: recent-emoji-bounce 1.5s ease-in-out infinite;
}
@keyframes recent-emoji-bounce {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-4px) rotate(5deg); }
}
.recent-badge-name {
  font-size: 11px;
  font-weight: 700;
  color: #3b3b4f;
  margin-top: 4px;
  text-align: center;
}

.stats-box {
  background: rgba(255,255,255,0.85); border-radius: 22px; padding: 12px;
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
.stat { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 6px 2px; }
.stat-emoji { font-size: 26px; line-height: 1; }
.stat-n { font-size: 16px; font-weight: 800; color: #3b3b4f; line-height: 1.1; }
.stat-l { font-size: 9px; font-weight: 800; letter-spacing: 1px; color: #8a8aa0; text-align: center; }

.section-title {
  font-size: 14px; font-weight: 800; color: #7c5fe6;
  letter-spacing: 1.5px; margin: 10px 4px 2px;
}

.cat-progress-list { display: flex; flex-direction: column; gap: 6px; }
.cat-progress {
  background: rgba(255,255,255,0.85); border-radius: 14px; padding: 8px 12px;
  transition: opacity 0.3s ease;
}
.cat-progress.locked { opacity: 0.5; filter: grayscale(0.6); }
.cat-progress.done { background: linear-gradient(90deg, #fff4d6, #fff); border: 2px solid #ffd86b; }
.cat-prog-head { display: flex; align-items: center; gap: 8px; }
.cat-prog-emoji { font-size: 24px; line-height: 1; }
.cat-prog-info { flex: 1; min-width: 0; }
.cat-prog-th { font-size: 16px; font-weight: 800; color: #3b3b4f; line-height: 1; }
.cat-prog-en { font-size: 10px; color: #8a8aa0; letter-spacing: 1px; font-weight: 700; }
.cat-prog-num { font-size: 12px; font-weight: 800; color: #7c5fe6; }
.lock-mini, .done-mini { font-size: 16px; }
.done-mini { color: #2a8a4a; }
.cat-prog-bar { height: 6px; background: #f0e7ff; border-radius: 999px; margin-top: 4px; overflow: hidden; }
.cat-prog-fill { height: 100%; background: linear-gradient(90deg, #ffd86b, #ff9d43); border-radius: 999px; transition: width 0.5s ease; }

.badges-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 10px;
}
.badge-box {
  background: rgba(245,245,250,0.9); border-radius: 18px; padding: 12px 8px;
  display: flex; flex-direction: column; align-items: center; gap: 3px; text-align: center;
  opacity: 0.55; transition: all 0.3s ease; border: 2px solid transparent;
  transform: scale(0.95);
}
.badge-box.unlocked {
  opacity: 1;
  background: linear-gradient(180deg, #fff 0%, #fff9e6 50%, #fff4d6 100%);
  box-shadow: 0 6px 0 #ffd86b, 0 10px 24px rgba(255,160,0,0.35);
  border-color: #ffd86b;
  transform: scale(1);
  animation: badge-glow 2s ease-in-out infinite;
}
@keyframes badge-glow {
  0%, 100% { box-shadow: 0 6px 0 #ffd86b, 0 10px 24px rgba(255,160,0,0.35); }
  50% { box-shadow: 0 6px 0 #ffd86b, 0 10px 30px rgba(255,160,0,0.5), 0 0 20px rgba(255,214,107,0.4); }
}
.badge-emoji {
  font-size: 38px; line-height: 1;
  filter: drop-shadow(0 3px 6px rgba(0,0,0,0.15));
  transition: transform 0.3s ease;
}
.badge-box.unlocked .badge-emoji {
  animation: badge-bounce 1.5s ease-in-out infinite;
}
@keyframes badge-bounce {
  0%, 100% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.1) rotate(-5deg); }
  75% { transform: scale(1.1) rotate(5deg); }
}
.badge-th { font-size: 13px; font-weight: 800; color: #3b3b4f; margin-top: 2px; }
.badge-en { font-size: 9px; color: #8a8aa0; letter-spacing: 0.5px; font-weight: 700; text-transform: uppercase; }
.badge-bar { height: 5px; background: #e8e0f5; border-radius: 999px; width: 85%; overflow: hidden; margin-top: 6px; }
.badge-bar-fill { height: 100%; background: linear-gradient(90deg, #b8a8e0, #9a7fd6); transition: width 0.5s ease; border-radius: 999px; }
.badge-box.unlocked .badge-bar-fill { background: linear-gradient(90deg, #ffd86b, #ff9d43, #ff7c43); }
.badge-num { font-size: 11px; font-weight: 800; color: #8b7bc6; margin-top: 3px; }
.badge-box.unlocked .badge-num { color: #d98720; }

.reset-btn {
  margin-top: 16px; background: none; border: 1px solid #e5d5ff;
  color: #8a6ad6; padding: 8px 16px; border-radius: 999px;
  font-size: 12px; font-weight: 700; cursor: pointer; align-self: center;
  letter-spacing: 1px;
}

/* ============ SETTINGS ============ */
.settings-card {
  background: rgba(255,255,255,0.9); border-radius: 22px; padding: 14px;
  display: flex; flex-direction: column; gap: 14px;
  box-shadow: 0 4px 14px rgba(0,0,0,0.06);
}
.setting-row {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
}
.setting-row.column { flex-direction: column; align-items: stretch; gap: 10px; }
.setting-info { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
.setting-emoji { font-size: 32px; line-height: 1; }
.setting-title { font-size: 16px; font-weight: 800; color: #3b3b4f; line-height: 1.1; }
.setting-desc { font-size: 10px; color: #8a8aa0; letter-spacing: 1.5px; font-weight: 800; margin-top: 2px; }
.setting-btn {
  border: none; background: #f0e7ff; color: #8a6ad6;
  padding: 8px 20px; border-radius: 999px; font-weight: 800; font-size: 13px;
  letter-spacing: 2px; cursor: pointer; box-shadow: 0 3px 0 #d5c0f5; min-width: 72px;
}
.setting-btn.on { background: linear-gradient(180deg, #7be06b, #4dc87a); color: #fff; box-shadow: 0 3px 0 #2a8a4a; }
.setting-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.setting-btn:active:not(:disabled) { transform: translateY(2px); box-shadow: 0 1px 0 #d5c0f5; }
.setting-mini {
  background: #ffeef2; border: none; border-radius: 50%;
  width: 34px; height: 34px; font-size: 16px; cursor: pointer;
  box-shadow: 0 2px 0 #ffc0d5;
}
.setting-mini:active { transform: translateY(1px); box-shadow: 0 1px 0 #ffc0d5; }
.setting-cta {
  border: none; background: linear-gradient(180deg, #8ec7ff, #5a9bff); color: #fff;
  padding: 14px 20px; border-radius: 16px; font-weight: 800; font-size: 15px;
  cursor: pointer; box-shadow: 0 5px 0 #3566c9; width: 100%;
  display: flex; align-items: center; justify-content: center; gap: 6px;
}
.setting-cta:disabled {
  background: linear-gradient(180deg, #d7f7c9, #9be57d); color: #2a7a3a;
  box-shadow: 0 5px 0 #5aa93e; cursor: default;
}
.setting-cta:not(:disabled):active { transform: translateY(3px); box-shadow: 0 2px 0 #3566c9; }
.dl-progress { display: flex; align-items: center; gap: 10px; }
.dl-bar { flex: 1; height: 14px; background: #e0e8f5; border-radius: 999px; overflow: hidden; }
.dl-fill { height: 100%; background: linear-gradient(90deg, #8ec7ff, #5a9bff); transition: width 0.2s ease; box-shadow: inset 0 -3px 0 rgba(0,0,0,0.1); }
.dl-pct { font-size: 14px; font-weight: 800; color: #3566c9; min-width: 44px; text-align: right; }
.dl-hint { font-size: 11px; color: #8a8aa0; text-align: center; font-weight: 700; }

/* ============ TOP BAR ============ */
.top { position: relative; z-index: 2; display: flex; flex-direction: column; gap: 6px; padding: 8px 12px 4px; }
.top-row { display: grid; grid-template-columns: auto 1fr auto; gap: 8px; align-items: center; }
.home-btn { width: 40px; height: 40px; border: none; border-radius: 50%; background: #fff; font-size: 20px; cursor: pointer; box-shadow: 0 3px 0 #e5d5ff; }
.home-btn:active { transform: translateY(2px); box-shadow: 0 1px 0 #e5d5ff; }
.level-box { display: flex; align-items: center; gap: 8px; background: #fff; border-radius: 999px; padding: 4px 12px 4px 4px; box-shadow: 0 3px 0 #e5d5ff; }
.level-badge { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(180deg, #a78bfa, #7c5fe6); color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 3px 0 #5f45c2, inset 0 -4px 0 rgba(0,0,0,0.15); flex-shrink: 0; }
.level-num { font-size: 18px; font-weight: 800; line-height: 1; }
.level-label { font-size: 8px; opacity: 0.8; letter-spacing: 1px; }
.xp-bar { position: relative; flex: 1; height: 14px; background: #f0e7ff; border-radius: 999px; overflow: hidden; min-width: 50px; }
.xp-fill { position: absolute; inset: 0 auto 0 0; background: linear-gradient(90deg, #ffd86b, #ff9d43); border-radius: 999px; transition: width 0.5s cubic-bezier(.34,1.56,.64,1); box-shadow: inset 0 -3px 0 rgba(0,0,0,0.1); }
.xp-text { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; color: #3b2a00; text-shadow: 0 1px 0 rgba(255,255,255,0.6); }

.right-stats { display: flex; align-items: center; gap: 6px; }
.streak { display: flex; align-items: center; gap: 1px; }
.fire { font-size: 18px; animation: fire-flick 0.5s ease-in-out infinite alternate; margin-right: 2px; }
@keyframes fire-flick { 0% { transform: scale(1) rotate(-4deg); } 100% { transform: scale(1.15) rotate(4deg); } }
.streak-star { font-size: 16px; color: #e5d5ff; transition: color 0.3s; }
.streak-star.on { color: #ffc93c; text-shadow: 0 2px 4px rgba(255,201,60,0.5); animation: star-pop 0.4s ease; }
@keyframes star-pop { 0% { transform: scale(0.5) rotate(-20deg); } 60% { transform: scale(1.3) rotate(10deg); } 100% { transform: scale(1) rotate(0); } }

.cat-pill {
  background: rgba(255,255,255,0.85); border-radius: 999px; padding: 4px 12px;
  display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 800;
  color: #3b3b4f; box-shadow: 0 2px 6px rgba(0,0,0,0.06);
}
.cat-pill-emoji { font-size: 18px; }
.cat-pill-en { color: #8a6ad6; font-weight: 700; letter-spacing: 1px; font-size: 10px; }
.cat-pill-spacer { flex: 1; }
.score-inline { color: #d99a2a; font-weight: 800; }

/* ============ REPLAY ============ */
.replay-row { display: grid; grid-template-columns: auto 1fr; gap: 10px; align-items: stretch; }
.mascot { width: 70px; height: 92px; display: flex; align-items: center; justify-content: center; font-size: 56px; background: #fff; border-radius: 22px; box-shadow: 0 6px 0 #d5c0f5, 0 10px 18px rgba(0,0,0,0.08); line-height: 1; animation: mascot-idle 2.8s ease-in-out infinite; }
@keyframes mascot-idle { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
.mascot-happy { animation: mascot-happy 0.6s ease; }
.mascot-party { animation: mascot-party 0.6s ease infinite; }
.mascot-sad { animation: mascot-sad 0.5s ease; }
.mascot-listen { animation: mascot-listen 0.9s ease-in-out infinite; }
@keyframes mascot-happy { 0%,100% { transform: scale(1) rotate(0); } 50% { transform: scale(1.2) rotate(-8deg); } }
@keyframes mascot-party { 0%,100% { transform: scale(1.1) rotate(-10deg); } 50% { transform: scale(1.2) rotate(10deg); } }
@keyframes mascot-sad { 0%,100% { transform: translateY(0) rotate(0); } 30% { transform: translateY(2px) rotate(-5deg); } 60% { transform: translateY(2px) rotate(5deg); } }
@keyframes mascot-listen { 0%,100% { transform: rotate(-6deg); } 50% { transform: rotate(6deg); } }

.replay {
  border: none; background: linear-gradient(180deg, #ffffff, #fff4d6);
  border-radius: 28px; padding: 12px 20px;
  display: flex; align-items: center; gap: 16px; cursor: pointer;
  box-shadow: 0 8px 0 #ffd86b, 0 12px 24px rgba(255,160,0,0.15);
  width: 100%; min-height: 92px; position: relative; overflow: hidden;
  transition: all 0.2s ease;
}
.replay:hover { transform: translateY(-2px); box-shadow: 0 10px 0 #ffd86b, 0 14px 28px rgba(255,160,0,0.2); }
.replay:active { transform: translateY(6px); box-shadow: 0 2px 0 #ffd86b; }

.replay-icon-wrapper {
  width: 54px; height: 54px; background: #ffd86b; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 0 #d9a92a; flex-shrink: 0;
}
.replay-icon { font-size: 32px; line-height: 1; z-index: 1; }
.replay.playing .replay-icon { animation: pulse-icon 0.5s ease-in-out infinite; }

@keyframes pulse-icon { 0%,100% { transform: scale(1); } 50% { transform: scale(1.2); } }

.replay-text { display: flex; flex-direction: column; align-items: flex-start; flex: 1; min-width: 0; z-index: 1; }
.word { font-size: 38px; font-weight: 900; color: #3b2a00; line-height: 1; letter-spacing: -0.5px; }
.rom { 
  font-size: 13px; color: #d9731a; font-weight: 700; margin-top: 4px;
  background: rgba(255,216,107,0.2); padding: 2px 10px; border-radius: 8px;
  letter-spacing: 0.5px;
}
.replay-waves { display: flex; gap: 4px; align-items: center; height: 24px; padding-right: 4px; }
.replay-waves span { display: block; width: 3px; background: #ffd86b; border-radius: 2px; height: 60%; transition: height 0.3s ease; }
.replay.playing .replay-waves span { background: #ff9d43; animation: wave 0.8s ease-in-out infinite; }
.replay-waves span:nth-child(1) { height: 40%; animation-delay: 0s; }
.replay-waves span:nth-child(2) { height: 80%; animation-delay: 0.15s; }
.replay-waves span:nth-child(3) { height: 55%; animation-delay: 0.3s; }
@keyframes wave { 0%,100% { transform: scaleY(0.5); } 50% { transform: scaleY(1.2); } }

/* ============ GRILLE ============ */
.grid { flex: 1; display: grid; gap: 12px; padding: 8px 14px 14px; min-height: 0; z-index: 1; }
.grid-2 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr; }
.grid-3 { grid-template-columns: 1fr 1fr 1fr; grid-template-rows: 1fr; }
.grid-4 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }
.card {
  border: none; border-radius: 26px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: transform 0.12s ease, filter 0.2s, opacity 0.25s;
  padding: 10px; min-height: 0; min-width: 0; overflow: hidden;
  animation: card-in 0.5s cubic-bezier(.34,1.56,.64,1) backwards; position: relative;
}
@keyframes card-in { 0% { transform: translateY(40px) scale(0.6) rotate(-5deg); opacity: 0; } 100% { transform: translateY(0) scale(1) rotate(0); opacity: 1; } }
.card:hover:not(:disabled) { transform: translateY(-3px) rotate(-1deg); }
.card:active:not(:disabled) { transform: translateY(3px) scale(0.97); }
.card:disabled { cursor: default; }
.card.hidden { opacity: 0.15; filter: grayscale(1); transform: scale(0.9); pointer-events: none; }
.emoji-img { width: 75%; height: 75%; max-width: 130px; max-height: 130px; object-fit: contain; pointer-events: none; filter: drop-shadow(0 6px 8px rgba(0,0,0,0.2)); transition: transform 0.3s ease; }
.card:hover:not(:disabled) .emoji-img { transform: scale(1.08) rotate(-3deg); }
.card.success { animation: success-bounce 0.6s ease; filter: brightness(1.1) saturate(1.2); }
.card.success::after { content: '✓'; position: absolute; top: 8px; right: 12px; font-size: 28px; color: #1b8a3a; font-weight: 900; animation: check-in 0.4s ease; }
@keyframes check-in { 0% { transform: scale(0) rotate(-40deg); opacity: 0; } 100% { transform: scale(1) rotate(0); opacity: 1; } }
@keyframes success-bounce { 0% { transform: scale(1); } 30% { transform: scale(1.15) rotate(-4deg); } 60% { transform: scale(0.95) rotate(2deg); } 100% { transform: scale(1); } }
.card.error { animation: shake 0.5s ease; filter: saturate(0.6); }
.card.error::after { content: '✗'; position: absolute; top: 8px; right: 12px; font-size: 28px; color: #c43535; font-weight: 900; }
.card.dim { opacity: 0.3; filter: grayscale(0.6); }
@keyframes shake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-10px) rotate(-2deg); } 40% { transform: translateX(10px) rotate(2deg); } 60% { transform: translateX(-8px); } 80% { transform: translateX(8px); } }

.card-word {
  position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%);
  background: rgba(255,255,255,0.95); color: #3b2a00;
  padding: 4px 14px; border-radius: 999px; font-size: 20px; font-weight: 800;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  animation: word-reveal 0.5s cubic-bezier(.34,1.56,.64,1);
  white-space: nowrap; max-width: 90%; overflow: hidden; text-overflow: ellipsis; z-index: 3;
}

.card-translations {
  position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%);
  background: rgba(255,255,255,0.35);
  padding: 2px 10px; border-radius: 6px;
  font-size: 10px; font-weight: 700; color: rgba(0,0,0,0.5);
  white-space: nowrap; pointer-events: none;
  backdrop-filter: blur(2px);
  z-index: 1;
  transition: opacity 0.3s ease;
}
@keyframes word-reveal { 0% { transform: translate(-50%, 20px) scale(0.5); opacity: 0; } 100% { transform: translate(-50%, 0) scale(1); opacity: 1; } }

.ripple { position: absolute; width: 10px; height: 10px; border-radius: 50%; background: rgba(255,255,255,0.6); pointer-events: none; transform: translate(-50%, -50%); animation: ripple-expand 0.6s ease-out forwards; z-index: 2; }
@keyframes ripple-expand { 0% { width: 10px; height: 10px; opacity: 0.7; } 100% { width: 300px; height: 300px; opacity: 0; } }

/* ============ HINT / CELEBRATE / LEVELUP ============ */
.hint-btn {
  position: absolute; right: 16px; bottom: 16px;
  width: 64px; height: 64px; border: none; border-radius: 50%;
  background: linear-gradient(180deg, #fff8b0, #ffd86b); cursor: pointer;
  box-shadow: 0 6px 0 #d99a2a, 0 10px 18px rgba(0,0,0,0.15);
  display: flex; align-items: center; justify-content: center; z-index: 5;
  animation: pulse-btn 2s ease-in-out infinite;
}
.hint-btn:active:not(:disabled) { transform: translateY(4px); box-shadow: 0 2px 0 #d99a2a; animation: none; }
.hint-btn:disabled { filter: grayscale(0.8) brightness(0.9); opacity: 0.5; animation: none; cursor: default; }
.hint-emoji { font-size: 32px; line-height: 1; }
.hint-count { position: absolute; top: -4px; right: -4px; background: #ff6b9d; color: #fff; border-radius: 50%; min-width: 22px; height: 22px; font-size: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; padding: 0 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }

.celebrate { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; z-index: 10; }
.celebrate-text { font-size: 72px; font-weight: 800; color: #fff; text-shadow: -3px -3px 0 #ff6b9d, 3px -3px 0 #ff6b9d, -3px 3px 0 #ff6b9d, 3px 3px 0 #ff6b9d, 0 10px 20px rgba(0,0,0,0.3); padding: 20px 40px; }
.celebrate-enter-active { animation: celeb-in 0.5s cubic-bezier(.34,1.56,.64,1); }
.celebrate-leave-active { animation: celeb-out 0.3s ease; }
@keyframes celeb-in { 0% { transform: scale(0.3) rotate(-15deg); opacity: 0; } 60% { transform: scale(1.2) rotate(8deg); opacity: 1; } 100% { transform: scale(1) rotate(-3deg); opacity: 1; } }
@keyframes celeb-out { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(1.4); opacity: 0; } }

.levelup { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; z-index: 20; background: rgba(50,30,90,0.4); backdrop-filter: blur(8px); }
.levelup-card { background: linear-gradient(180deg, #fff 0%, #fff4d6 100%); border-radius: 32px; padding: 30px 40px; text-align: center; box-shadow: 0 14px 40px rgba(0,0,0,0.3), inset 0 -6px 0 #ffd86b; border: 4px solid #ffc93c; position: relative; animation: card-bounce 0.6s cubic-bezier(.34,1.56,.64,1); }
.badge-card {
  border-color: #ff6b9d;
  box-shadow: 0 14px 50px rgba(255,107,157,0.4), inset 0 -6px 0 #ffc0d5, 0 0 40px rgba(255,107,157,0.3);
  background: linear-gradient(180deg, #fff 0%, #fff0f5 50%, #ffe8f0 100%);
  animation: badge-unlock-bounce 0.8s cubic-bezier(.34,1.56,.64,1);
}
@keyframes card-bounce { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
@keyframes badge-unlock-bounce {
  0% { transform: scale(0.3) rotate(-10deg); opacity: 0; }
  50% { transform: scale(1.15) rotate(5deg); }
  70% { transform: scale(0.95) rotate(-2deg); }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}
.badge-ribbon {
  position: absolute; top: -16px; left: 50%; transform: translateX(-50%);
  background: linear-gradient(180deg, #ff6b9d, #d85699); color: #fff;
  padding: 6px 20px; border-radius: 999px; font-size: 14px; font-weight: 800;
  text-transform: uppercase; letter-spacing: 2px;
  box-shadow: 0 6px 16px rgba(255,107,157,0.4);
  white-space: nowrap; animation: ribbon-pulse 1.5s ease-in-out infinite;
}
@keyframes ribbon-pulse {
  0%, 100% { transform: translateX(-50%) scale(1); box-shadow: 0 6px 16px rgba(255,107,157,0.4); }
  50% { transform: translateX(-50%) scale(1.05); box-shadow: 0 8px 24px rgba(255,107,157,0.6); }
}
.levelup-emoji { font-size: 86px; line-height: 1; animation: medal-spin 1s ease; filter: drop-shadow(0 8px 12px rgba(0,0,0,0.2)); }
.levelup-emoji.big { font-size: 140px; animation: badge-emoji-entrance 1s cubic-bezier(.34,1.56,.64,1); }
@keyframes medal-spin { 0% { transform: scale(0) rotate(-360deg); } 60% { transform: scale(1.2) rotate(20deg); } 100% { transform: scale(1) rotate(0); } }
@keyframes badge-emoji-entrance {
  0% { transform: scale(0) rotate(-180deg); filter: drop-shadow(0 0 0 rgba(255,215,0,0)); }
  40% { transform: scale(1.3) rotate(15deg); filter: drop-shadow(0 0 30px rgba(255,215,0,0.8)); }
  60% { transform: scale(1.1) rotate(-10deg); filter: drop-shadow(0 0 50px rgba(255,215,0,1)); }
  100% { transform: scale(1) rotate(0); filter: drop-shadow(0 8px 12px rgba(0,0,0,0.2)); }
}
.levelup-arrow { font-size: 54px; color: #ffc93c; font-weight: 900; text-shadow: 0 4px 8px rgba(255,200,60,0.5); animation: arrow-up 0.6s ease; }
@keyframes arrow-up { 0% { transform: translateY(30px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
.levelup-big { font-size: 56px; font-weight: 800; color: #7c5fe6; letter-spacing: 2px; line-height: 1; margin-top: 4px; }
.levelup-sub { font-size: 26px; color: #3b2a00; font-weight: 800; margin-top: 6px; }
.levelup-en-sub { font-size: 14px; color: #8a6ad6; font-weight: 800; letter-spacing: 2px; margin-top: 4px; }
.levelup-enter-active { animation: lvl-in 0.45s cubic-bezier(.34,1.56,.64,1); }
.levelup-leave-active { animation: lvl-out 0.3s ease; }
@keyframes lvl-in { 0% { transform: scale(0); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
@keyframes lvl-out { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(1.2); opacity: 0; } }

/* ============ CONFETTIS ============ */
.confetti { position: absolute; inset: 0; pointer-events: none; z-index: 9; overflow: hidden; }
.confetti-piece { position: absolute; top: 60%; animation: confetti-fly 1.4s cubic-bezier(.2,.6,.4,1) forwards; line-height: 1; }
.confetti-piece.circle { border-radius: 50%; }
.confetti-piece.square { border-radius: 3px; }
.confetti-piece.emoji { filter: drop-shadow(0 2px 3px rgba(0,0,0,0.15)); }
@keyframes confetti-fly { 0% { transform: translate(0, 0) rotate(0deg) scale(0); opacity: 1; } 20% { transform: translate(0, 0) rotate(90deg) scale(1); opacity: 1; } 100% { transform: translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(1); opacity: 0; } }

/* ============ RESPONSIVE ============ */
@media (min-width: 600px) and (orientation: portrait) {
  .top { padding: 16px 20px 6px; gap: 10px; }
  .replay { min-height: 120px; padding: 16px 22px; border-radius: 28px; }
  .replay-icon { font-size: 64px; }
  .word { font-size: 48px; }
  .rom { font-size: 15px; }
  .mascot { width: 90px; height: 120px; font-size: 72px; border-radius: 28px; }
  .grid { gap: 18px; padding: 12px 20px 22px; }
  .emoji-img { max-width: 200px; max-height: 200px; }
  .card { border-radius: 32px; padding: 16px; }
  .card-word { font-size: 26px; padding: 6px 18px; bottom: 14px; }
  .cat-pill { font-size: 16px; padding: 6px 16px; }
  .home-btn { width: 52px; height: 52px; font-size: 24px; }
  .level-badge { width: 52px; height: 52px; }
  .level-num { font-size: 22px; }
  .xp-bar { height: 18px; }
  .streak-star { font-size: 22px; }
  .hint-btn { width: 80px; height: 80px; bottom: 24px; right: 24px; }
  .hint-emoji { font-size: 38px; }
  .celebrate-text { font-size: 110px; }
  .stats-box { grid-template-columns: repeat(4, 1fr); gap: 14px; padding: 18px; }
  .stat-emoji { font-size: 36px; }
  .stat-n { font-size: 22px; }
}

@media (min-width: 1024px) {
  .top { padding: 20px 28px 8px; }
  .replay { min-height: 140px; padding: 20px 26px; }
  .replay-icon { font-size: 78px; }
  .word { font-size: 60px; }
  .rom { font-size: 17px; }
  .mascot { width: 110px; height: 140px; font-size: 90px; }
  .grid { gap: 22px; padding: 14px 32px 28px; }
  .emoji-img { max-width: 260px; max-height: 260px; }
  .card { border-radius: 36px; padding: 20px; }
  .card-word { font-size: 32px; padding: 8px 22px; bottom: 18px; }
  .celebrate-text { font-size: 140px; }
  .hint-btn { width: 92px; height: 92px; bottom: 32px; right: 32px; }
  .hint-emoji { font-size: 44px; }
  .bubble { font-size: 64px; }
  .picker, .profile { padding: 28px 40px 40px; max-width: 1100px; margin: 0 auto; width: 100%; }
  .picker-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 18px; }
  .cat-card { min-height: 180px; }
  .cat-emoji { font-size: 72px; }
  .cat-th { font-size: 26px; }
}

@media (max-width: 380px) {
  .picker-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .cat-card { min-height: 130px; padding: 14px 8px 12px; }
  .cat-emoji { font-size: 44px; }
  .cat-th { font-size: 18px; }
  .cat-label { font-size: 10px; }
  .stats-box { grid-template-columns: repeat(2, 1fr); }
}

@media (orientation: landscape) and (max-height: 520px) {
  .top { padding: 4px 8px; gap: 4px; }
  .replay { min-height: 64px; padding: 6px 12px; }
  .replay-icon { font-size: 32px; }
  .word { font-size: 22px; }
  .mascot { width: 56px; height: 64px; font-size: 40px; }
  .grid-4 { grid-template-columns: repeat(4, 1fr); grid-template-rows: 1fr; }
  .grid-3 { grid-template-columns: repeat(3, 1fr); }
  .emoji-img { max-width: 90px; max-height: 90px; }
  .celebrate-text { font-size: 44px; }
  .bubble { font-size: 28px; }
  .levelup-card { padding: 16px 26px; }
  .levelup-emoji { font-size: 52px; }
  .levelup-emoji.big { font-size: 80px; }
  .levelup-big { font-size: 38px; }
  .levelup-arrow { font-size: 36px; }
  .hint-btn { width: 52px; height: 52px; bottom: 10px; right: 10px; }
  .hint-emoji { font-size: 26px; }
  .picker, .profile { padding: 10px 16px 16px; }
  .picker-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 10px; }
  .cat-card { min-height: 110px; padding: 10px 8px; }
  .cat-emoji { font-size: 40px; }
  .cat-th { font-size: 16px; }
  .cat-featured { min-height: 90px; }
}
</style>
