// Verbes thaï avec leurs conjugaisons
// Structure : id, verbe infinitif, conjugaisons au différents tenses/aspects, catégories

export const CONJUGATIONS = [
  // ========== VERBES DE BASE (PRÉSENT) ==========
  {
    id: 'c1',
    infinitive: 'ไป (bpai)',
    th: 'ไป',
    rom: 'bpai',
    fr: 'aller',
    meaning: 'aller',
    image: '🚶',
    forms: {
      present: 'ไป',
      presentCont: 'กำลังไป', // être en train d'aller
      past: 'ไปแล้ว',        // est allé(e)
      future: 'จะไป'        // ira
    },
    category: 'basic',
    difficulty: 1
  },
  {
    id: 'c2',
    th: 'มา',
    rom: 'maa',
    fr: 'venir',
    meaning: 'venir',
    image: '👋',
    forms: {
      present: 'มา',
      presentCont: 'กำลังมา',
      past: 'มาแล้ว',
      future: 'จะมา'
    },
    category: 'basic',
    difficulty: 1
  },
  {
    id: 'c3',
    th: 'ทำ',
    rom: 'tham',
    fr: 'faire',
    meaning: 'faire',
    image: '✋',
    forms: {
      present: 'ทำ',
      presentCont: 'กำลังทำ',
      past: 'ทำแล้ว',
      future: 'จะทำ'
    },
    category: 'basic',
    difficulty: 1
  },
  {
    id: 'c4',
    th: 'กิน',
    rom: 'kin',
    fr: 'manger',
    meaning: 'manger',
    image: '🍽️',
    forms: {
      present: 'กิน',
      presentCont: 'กำลังกิน',
      past: 'กินแล้ว',
      future: 'จะกิน'
    },
    category: 'food',
    difficulty: 1
  },
  {
    id: 'c5',
    th: 'ดื่ม',
    rom: 'duum',
    fr: 'boire',
    meaning: 'boire',
    image: '🥤',
    forms: {
      present: 'ดื่ม',
      presentCont: 'กำลังดื่ม',
      past: 'ดื่มแล้ว',
      future: 'จะดื่ม'
    },
    category: 'food',
    difficulty: 1
  },
  {
    id: 'c6',
    th: 'นอน',
    rom: 'non',
    fr: 'dormir',
    meaning: 'dormir',
    image: '😴',
    forms: {
      present: 'นอน',
      presentCont: 'กำลังนอน',
      past: 'นอนแล้ว',
      future: 'จะนอน'
    },
    category: 'daily',
    difficulty: 1
  },
  {
    id: 'c7',
    th: 'เล่น',
    rom: 'len',
    fr: 'jouer',
    meaning: 'jouer',
    image: '🎮',
    forms: {
      present: 'เล่น',
      presentCont: 'กำลังเล่น',
      past: 'เล่นแล้ว',
      future: 'จะเล่น'
    },
    category: 'daily',
    difficulty: 1
  },
  {
    id: 'c8',
    th: 'อ่าน',
    rom: 'aan',
    fr: 'lire',
    meaning: 'lire',
    image: '📖',
    forms: {
      present: 'อ่าน',
      presentCont: 'กำลังอ่าน',
      past: 'อ่านแล้ว',
      future: 'จะอ่าน'
    },
    category: 'daily',
    difficulty: 1
  },
  {
    id: 'c9',
    th: 'เขียน',
    rom: 'khian',
    fr: 'écrire',
    meaning: 'écrire',
    image: '✏️',
    forms: {
      present: 'เขียน',
      presentCont: 'กำลังเขียน',
      past: 'เขียนแล้ว',
      future: 'จะเขียน'
    },
    category: 'daily',
    difficulty: 1
  },
  {
    id: 'c10',
    th: 'ฟัง',
    rom: 'fang',
    fr: 'écouter',
    meaning: 'écouter',
    image: '👂',
    forms: {
      present: 'ฟัง',
      presentCont: 'กำลังฟัง',
      past: 'ฟังแล้ว',
      future: 'จะฟัง'
    },
    category: 'daily',
    difficulty: 1
  },
  // ========== VERBES INTERMÉDIAIRES ==========
  {
    id: 'c11',
    th: 'วิ่ง',
    rom: 'wing',
    fr: 'courir',
    meaning: 'courir',
    image: '🏃',
    forms: {
      present: 'วิ่ง',
      presentCont: 'กำลังวิ่ง',
      past: 'วิ่งแล้ว',
      future: 'จะวิ่ง'
    },
    category: 'sport',
    difficulty: 2
  },
  {
    id: 'c12',
    th: 'ขึ้น',
    rom: 'khuen',
    fr: 'monter',
    meaning: 'monter',
    image: '⛰️',
    forms: {
      present: 'ขึ้น',
      presentCont: 'กำลังขึ้น',
      past: 'ขึ้นแล้ว',
      future: 'จะขึ้น'
    },
    category: 'movement',
    difficulty: 2
  },
  {
    id: 'c13',
    th: 'ลง',
    rom: 'long',
    fr: 'descendre',
    meaning: 'descendre',
    image: '⬇️',
    forms: {
      present: 'ลง',
      presentCont: 'กำลังลง',
      past: 'ลงแล้ว',
      future: 'จะลง'
    },
    category: 'movement',
    difficulty: 2
  },
  {
    id: 'c14',
    th: 'นั่ง',
    rom: 'nang',
    fr: 'être assis',
    meaning: 'être assis',
    image: '🪑',
    forms: {
      present: 'นั่ง',
      presentCont: 'กำลังนั่ง',
      past: 'นั่งแล้ว',
      future: 'จะนั่ง'
    },
    category: 'daily',
    difficulty: 1
  },
  {
    id: 'c15',
    th: 'ยืน',
    rom: 'yuen',
    fr: 'se tenir debout',
    meaning: 'se tenir debout',
    image: '🧍',
    forms: {
      present: 'ยืน',
      presentCont: 'กำลังยืน',
      past: 'ยืนแล้ว',
      future: 'จะยืน'
    },
    category: 'daily',
    difficulty: 1
  },
  {
    id: 'c16',
    th: 'พูด',
    rom: 'phuut',
    fr: 'parler',
    meaning: 'parler',
    image: '💬',
    forms: {
      present: 'พูด',
      presentCont: 'กำลังพูด',
      past: 'พูดแล้ว',
      future: 'จะพูด'
    },
    category: 'daily',
    difficulty: 2
  },
  {
    id: 'c17',
    th: 'เห็น',
    rom: 'hen',
    fr: 'voir',
    meaning: 'voir',
    image: '👁️',
    forms: {
      present: 'เห็น',
      presentCont: 'กำลังเห็น',
      past: 'เห็นแล้ว',
      future: 'จะเห็น'
    },
    category: 'daily',
    difficulty: 2
  },
  {
    id: 'c18',
    th: 'ซื้อ',
    rom: 'seu',
    fr: 'acheter',
    meaning: 'acheter',
    image: '🛒',
    forms: {
      present: 'ซื้อ',
      presentCont: 'กำลังซื้อ',
      past: 'ซื้อแล้ว',
      future: 'จะซื้อ'
    },
    category: 'daily',
    difficulty: 2
  },
  {
    id: 'c19',
    th: 'ขาย',
    rom: 'khai',
    fr: 'vendre',
    meaning: 'vendre',
    image: '💰',
    forms: {
      present: 'ขาย',
      presentCont: 'กำลังขาย',
      past: 'ขายแล้ว',
      future: 'จะขาย'
    },
    category: 'daily',
    difficulty: 2
  },
  {
    id: 'c20',
    th: 'รัก',
    rom: 'rak',
    fr: 'aimer',
    meaning: 'aimer',
    image: '❤️',
    forms: {
      present: 'รัก',
      presentCont: 'กำลังรัก',
      past: 'รักแล้ว',
      future: 'จะรัก'
    },
    category: 'emotions',
    difficulty: 2
  }
]

// Catégories de verbes
export const CONJUGATION_CATEGORIES = [
  { id: 'conj-basic', name: 'Basic Verbs', th: 'กริยาพื้นฐาน', emoji: '📝' },
  { id: 'conj-food', name: 'Food & Drink', th: 'อาหารและเครื่องดื่ม', emoji: '🍽️' },
  { id: 'conj-daily', name: 'Daily Actions', th: 'กิจกรรมประจำวัน', emoji: '⏰' },
  { id: 'conj-sport', name: 'Sport & Movement', th: 'กีฬาและการเคลื่อนไหว', emoji: '🏃' },
  { id: 'conj-movement', name: 'Movement', th: 'การเคลื่อนไหว', emoji: '🚶' },
  { id: 'conj-emotions', name: 'Emotions', th: 'อารมณ์', emoji: '😊' }
]

// Temps de conjugaison avec label
export const TENSE_INFO = {
  present: { th: 'ปัจจุบัน', rom: 'present', en: 'Present', label: 'Present Tense' },
  presentCont: { th: 'ปัจจุบัน (กำลัง)', rom: 'progressive', en: 'Present Progressive', label: 'Being (currently)' },
  past: { th: 'อดีต', rom: 'past', en: 'Past', label: 'Past Tense' },
  future: { th: 'อนาคต', rom: 'future', en: 'Future', label: 'Future Tense' }
}

export function getConjugationsByCategory(categoryId) {
  const catName = categoryId.replace('conj-', '')
  return CONJUGATIONS.filter(c => c.category === catName)
}

export function getConjugationFormLabel(tenseKey) {
  return TENSE_INFO[tenseKey] || { th: '?', en: '?' }
}
