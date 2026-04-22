// Phrases thaï pour mode "complétez la phrase" - OPTIMISÉ
// Structure : id, thaï, rom, français, image contexte, 4 choix, réponse, catégorie, difficulté

export const SENTENCES = [
  // ========== ANIMAUX (10 phrases) ==========
  {
    id: 's1',
    th: 'ฉันเห็น ___ ในสวน',
    rom: 'chan hen ___ nai suan',
    fr: 'Je vois ___ dans le jardin',
    image: '🌳',
    choices: ['🦋', '🐝', '🌸', '🌻'],
    choiceWords: { '🦋': 'ผีเสื้อ', '🐝': 'ผึ้ง', '🌸': 'ดอกไม้', '🌻': 'ดอกทานตะวัน' },
    answer: '🦋',
    answerWord: 'ผีเสื้อ',
    thComplete: 'ฉันเห็น ผีเสื้อ ในสวน',
    category: 'sentences-animal',
    difficulty: 1
  },
  {
    id: 's2',
    th: '___ มีปีกและได้บิน',
    rom: '___ mee peek aela dai bin',
    fr: '___ a des ailes et peut voler',
    image: '☁️',
    choices: ['🦁', '🦅', '🐁', '🐘'],
    answer: '🦅',
    category: 'sentences-animal',
    difficulty: 1
  },
  {
    id: 's3',
    th: '___ เป็นสัตว์ที่อาศัยในน้ำ',
    rom: '___ pen satwa tee aasai nai nam',
    fr: '___ est un animal qui vit dans l\'eau',
    image: '💧',
    choices: ['🐘', '🦁', '🐠', '🦅'],
    answer: '🐠',
    category: 'sentences-animal',
    difficulty: 2
  },
  {
    id: 's4',
    th: 'เด็กชอบเล่นกับ ___',
    rom: 'dek chop len kap ___',
    fr: 'L\'enfant aime jouer avec ___',
    image: '🎾',
    choices: ['🐈', '🍎', '📚', '🚗'],
    answer: '🐈',
    category: 'sentences-animal',
    difficulty: 1
  },
  {
    id: 's5',
    th: '___ มีงวงยาวและเป็นสิงโต',
    rom: '___ mee ngong yao aela pen singto',
    fr: '___ a une crinière longue et est un lion',
    image: '👑',
    choices: ['🐘', '🦁', '🐯', '🦊'],
    answer: '🦁',
    category: 'sentences-animal',
    difficulty: 2
  },
  {
    id: 's5b',
    th: '___ ส่งเสียงเหมือวเสือง "เม้ว"',
    rom: '___ song siang meuan siang "meow"',
    fr: '___ crie "miaou"',
    image: '🔊',
    choices: ['🐕', '🐈', '🦁', '🐭'],
    answer: '🐈',
    category: 'sentences-animal',
    difficulty: 1
  },
  {
    id: 's5c',
    th: '___ คือสัตว์ที่ร้องไห้งาน "โม่"',
    rom: '___ khue satwa tee rong hai ngarn "mo"',
    fr: '___ crie "meuh"',
    image: '🌾',
    choices: ['🐄', '🐕', '🐖', '🐑'],
    answer: '🐄',
    category: 'sentences-animal',
    difficulty: 1
  },
  {
    id: 's5d',
    th: '___ เป็นสัตว์ที่เดินด้วยสี่ขา',
    rom: '___ pen satwa tee doen duay see kha',
    fr: '___ marche sur quatre pattes',
    image: '🚶',
    choices: ['🦅', '🐕', '🐟', '🦜'],
    answer: '🐕',
    category: 'sentences-animal',
    difficulty: 2
  },
  {
    id: 's5e',
    th: '___ อาศัยอยู่ในเพิ่ง และลักษณ์เป็นสีน้ำตาล',
    rom: '___ aasai yu nai pheung aela laksana pen see nam tarn',
    fr: '___ vit dans une ruche et est marron',
    image: '🏠',
    choices: ['🦋', '🐝', '🐛', '🦗'],
    answer: '🐝',
    category: 'sentences-animal',
    difficulty: 2
  },

  // ========== FRUITS (10 phrases) ==========
  {
    id: 's6',
    th: '___ เป็นผลไม้สีเหลืองและมีรสหวาน',
    rom: '___ pen ponlamai see leung aela mee rot wan',
    fr: '___ est un fruit jaune et sucré',
    image: '🍌',
    choices: ['🍎', '🍊', '🍌', '🍇'],
    answer: '🍌',
    category: 'sentences-fruit',
    difficulty: 1
  },
  {
    id: 's7',
    th: 'ฉันกินผลไม้ ___ ทุกเช้า',
    rom: 'chan kin ponlamai ___ thuk chao',
    fr: 'Je mange des ___ tous les matins',
    image: '🌅',
    choices: ['🍕', '🥦', '🍎', '🧀'],
    answer: '🍎',
    category: 'sentences-fruit',
    difficulty: 1
  },
  {
    id: 's8',
    th: '___ เป็นผลไม้ที่มีเมล็ดเยอะ',
    rom: '___ pen ponlamai tee mee mlet yoe',
    fr: '___ est un fruit avec beaucoup de graines',
    image: '🌰',
    choices: ['🍇', '🥕', '🍌', '🥦'],
    answer: '🍇',
    category: 'sentences-fruit',
    difficulty: 2
  },
  {
    id: 's9',
    th: 'สีของ ___ คือสีแดง',
    rom: 'see kong ___ khue see daeng',
    fr: 'La couleur de ___ est rouge',
    image: '🔴',
    choices: ['🍌', '🍎', '🥕', '🌽'],
    answer: '🍎',
    category: 'sentences-fruit',
    difficulty: 1
  },
  {
    id: 's10',
    th: '___ โตในต้นไม้และอยู่ในกลุ่มหนาม',
    rom: '___ to nai ton mai aela yu nai klum nam',
    fr: '___ pousse sur l\'arbre et est épineux',
    image: '🌴',
    choices: ['🍓', '🍍', '🍊', '🥝'],
    answer: '🍍',
    category: 'sentences-fruit',
    difficulty: 2
  },
  {
    id: 's10b',
    th: '___ เป็นผลไม้ที่หวาน เหลือง และยาว',
    rom: '___ pen ponlamai tee wan leung aela yang',
    fr: '___ est sucré, jaune et long',
    image: '🌿',
    choices: ['🍊', '🍌', '🥝', '🍒'],
    answer: '🍌',
    category: 'sentences-fruit',
    difficulty: 1
  },
  {
    id: 's10c',
    th: '___ เป็นผลไม้ที่กลม และเป็นสีส้ม',
    rom: '___ pen ponlamai tee klom aela pen see som',
    fr: '___ est un fruit rond et orange',
    image: '🌞',
    choices: ['🍎', '🍊', '🍌', '🍓'],
    answer: '🍊',
    category: 'sentences-fruit',
    difficulty: 1
  },
  {
    id: 's10d',
    th: 'ผลไม้ ___ มีสีแดง และอยู่บนต้นเล็ก ๆ',
    rom: 'ponlamai ___ mee see daeng aela yu bon ton lek lek',
    fr: 'Le fruit ___ est rouge et pousse sur un petit arbuste',
    image: '🍓',
    choices: ['🍎', '🍓', '🍒', '🍑'],
    answer: '🍓',
    category: 'sentences-fruit',
    difficulty: 2
  },
  {
    id: 's10e',
    th: '___ เป็นผลไม้เขตร้อน มีลักษณ์เป็นด้วงหนาม',
    rom: '___ pen ponlamai khettron mee laksana pen duang naam',
    fr: '___ est un fruit tropical avec une peau épineuse',
    image: '🏝️',
    choices: ['🥝', '🍍', '🥭', '🍌'],
    answer: '🍍',
    category: 'sentences-fruit',
    difficulty: 2
  },

  // ========== COULEURS (8 phrases) ==========
  {
    id: 's11',
    th: 'ท้องฟ้า ___ ในวันที่อากาศดี',
    rom: 'thong fa ___ nai wan tee akaat dee',
    fr: 'Le ciel ___ par une belle journée',
    image: '☀️',
    choices: ['🔴', '🟢', '🔵', '🟡'],
    answer: '🔵',
    category: 'sentences-color',
    difficulty: 1
  },
  {
    id: 's12',
    th: '___ คือสีของหญ้า',
    rom: '___ khue see kong ya',
    fr: '___ est la couleur de l\'herbe',
    image: '🌱',
    choices: ['🔴', '🟢', '🔵', '🟡'],
    answer: '🟢',
    category: 'sentences-color',
    difficulty: 1
  },
  {
    id: 's12b',
    th: '___ คือสีของเลือด',
    rom: '___ khue see kong lueat',
    fr: '___ est la couleur du sang',
    image: '💔',
    choices: ['🟡', '🔴', '🔵', '🟢'],
    answer: '🔴',
    category: 'sentences-color',
    difficulty: 1
  },
  {
    id: 's12c',
    th: '___ คือสีของทะเล',
    rom: '___ khue see kong tha le',
    fr: '___ est la couleur de la mer',
    image: '🌊',
    choices: ['🟢', '🔴', '🔵', '🟡'],
    answer: '🔵',
    category: 'sentences-color',
    difficulty: 1
  },
  {
    id: 's12d',
    th: 'ป้ากันแดดเป็นสี ___',
    rom: 'pra kan daet pen see ___',
    fr: 'Le parasol est ___',
    image: '☂️',
    choices: ['🔵', '🟡', '🔴', '🟢'],
    answer: '🟡',
    category: 'sentences-color',
    difficulty: 2
  },
  {
    id: 's12e',
    th: 'หิมะเป็นสี ___',
    rom: 'hima pen see ___',
    fr: 'La neige est ___',
    image: '❄️',
    choices: ['🟢', '🔴', '⚪', '🔵'],
    answer: '⚪',
    category: 'sentences-color',
    difficulty: 2
  },
  {
    id: 's12f',
    th: '___ คือสีของทองคำ',
    rom: '___ khue see kong thong kham',
    fr: '___ est la couleur de l\'or',
    image: '✨',
    choices: ['🔵', '🟢', '🟡', '🔴'],
    answer: '🟡',
    category: 'sentences-color',
    difficulty: 2
  },

  // ========== FAMILLE (6 phrases) ==========
  {
    id: 's13',
    th: '___ เป็นคนที่เรามักจะดูแล',
    rom: '___ pen khon tee rao mak ja dulaeng',
    fr: '___ est la personne que nous prenons soin',
    image: '❤️',
    choices: ['👨', '👩', '👧', '👶'],
    answer: '👶',
    category: 'sentences-family',
    difficulty: 1
  },
  {
    id: 's14',
    th: 'ครอบครัว ___ บ้านคุณ',
    rom: 'khropkrua ___ baan khun',
    fr: 'La ___ famille habite votre maison',
    image: '🏠',
    choices: ['🐶', '👨', '🌳', '🚗'],
    answer: '👨',
    category: 'sentences-family',
    difficulty: 1
  },
  {
    id: 's14b',
    th: '___ คือผู้หญิงที่ให้กำเนิดแก่เรา',
    rom: '___ khue phu ying tee hai kamnoed kaeng rao',
    fr: '___ est la femme qui nous a donné naissance',
    image: '💕',
    choices: ['👧', '👩', '👶', '👨'],
    answer: '👩',
    category: 'sentences-family',
    difficulty: 2
  },
  {
    id: 's14c',
    th: '___ คือผู้ชายที่เป็นพ่อของเรา',
    rom: '___ khue phu chai tee pen pho kong rao',
    fr: '___ est l\'homme qui est notre père',
    image: '👔',
    choices: ['👧', '👶', '👨', '👩'],
    answer: '👨',
    category: 'sentences-family',
    difficulty: 2
  },
  {
    id: 's14d',
    th: '___ เป็นบุคคลที่อายุเท่ากับเรา',
    rom: '___ pen bukkhon tee ayou thaokaeb rao',
    fr: '___ est une personne du même âge que nous',
    image: '🤝',
    choices: ['👶', '👧', '👴', '👵'],
    answer: '👧',
    category: 'sentences-family',
    difficulty: 2
  },

  // ========== CORPS (6 phrases) ==========
  {
    id: 's15',
    th: 'ฉันใช้ ___ เพื่อมองเห็น',
    rom: 'chan chai ___ phuea mong hen',
    fr: 'J\'utilise ___ pour voir',
    image: '👁️',
    choices: ['👁️', '👂', '🦷', '👃'],
    answer: '👁️',
    category: 'sentences-body',
    difficulty: 1
  },
  {
    id: 's16',
    th: '___ ช่วยให้ฉันได้ยินเสียง',
    rom: '___ chuay hai chan dai yin siang',
    fr: '___ m\'aide à entendre le son',
    image: '🔊',
    choices: ['👁️', '👂', '🦷', '👃'],
    answer: '👂',
    category: 'sentences-body',
    difficulty: 1
  },
  {
    id: 's16b',
    th: 'ฉันใช้ ___ เพื่อรับกลิ่น',
    rom: 'chan chai ___ phuea rap klin',
    fr: 'J\'utilise ___ pour sentir les odeurs',
    image: '🌹',
    choices: ['👂', '👃', '👁️', '👅'],
    answer: '👃',
    category: 'sentences-body',
    difficulty: 1
  },
  {
    id: 's16c',
    th: 'ฉันใช้ ___ เพื่อชิมรส',
    rom: 'chan chai ___ phuea chim rot',
    fr: 'J\'utilise ___ pour goûter',
    image: '🍯',
    choices: ['👂', '👁️', '👅', '👃'],
    answer: '👅',
    category: 'sentences-body',
    difficulty: 1
  },
  {
    id: 's16d',
    th: '___ ช่วยให้เราเดิน',
    rom: '___ chuay hai rao doen',
    fr: '___ nous aide à marcher',
    image: '🚶',
    choices: ['🦷', '💪', '🦵', '💇'],
    answer: '🦵',
    category: 'sentences-body',
    difficulty: 1
  },
  {
    id: 's16e',
    th: '___ ช่วยให้เราหมุนศีรษะไปมา',
    rom: '___ chuay hai rao monn seersa pai maa',
    fr: '___ nous aide à tourner la tête',
    image: '🔄',
    choices: ['💪', '🦵', '🧠', '🧣'],
    answer: '🧠',
    category: 'sentences-body',
    difficulty: 2
  }
]

// Accès par catégorie pour sélection
export function getSentencesByCategory(cat) {
  return SENTENCES.filter(s => s.category === cat)
}

// Tous les types de phrases disponibles
export const SENTENCE_CATEGORIES = [
  { id: 'sentences-animal', name: 'Animaux', emoji: '🦁', th: 'สัตว์' },
  { id: 'sentences-fruit', name: 'Fruits', emoji: '🍎', th: 'ผลไม้' },
  { id: 'sentences-color', name: 'Couleurs', emoji: '🎨', th: 'สี' },
  { id: 'sentences-family', name: 'Famille', emoji: '👨‍👩‍👧', th: 'ครอบครัว' },
  { id: 'sentences-body', name: 'Corps', emoji: '👁️', th: 'ร่างกาย' }
]

// Traductions anglaises (ajoutées après les phrases)
export const SENTENCE_TRANSLATIONS_EN = {
  's1': 'I see ___ in the garden',
  's2': '___ has wings and can fly',
  's3': '___ is an animal that lives in water',
  's4': 'The child loves to play with ___',
  's5': '___ has a long mane and is a lion',
  's5b': '___ makes a sound like "meow"',
  's5c': '___ is an animal that cries "moo"',
  's5d': '___ is an animal that walks on four legs',
  's5e': '___ lives in a hive and is brown',
  's6': '___ is a yellow and sweet fruit',
  's7': 'I eat ___ fruit every morning',
  's8': '___ is a fruit with many seeds',
  's9': 'The color of ___ is red',
  's10': '___ grows on a tree and is spiky',
  's10b': '___ is sweet, yellow and long',
  's10c': '___ is a round and orange fruit',
  's10d': 'The ___ fruit is red and grows on a small bush',
  's10e': '___ is a tropical fruit with a spiky skin',
  's11': 'The sky is ___ on a nice day',
  's12': '___ is the color of grass',
  's12b': '___ is the color of blood',
  's12c': '___ is the color of the sea',
  's12d': 'The umbrella is ___',
  's12e': 'Snow is ___',
  's12f': '___ is the color of gold',
  's13': '___ is the person we take care of',
  's14': 'The ___ family lives in your house',
  's14b': '___ is the woman who gave birth to us',
  's14c': '___ is the man who is our father',
  's14d': '___ is a person the same age as us',
  's15': 'I use ___ to see',
  's16': '___ helps me hear sounds',
  's16b': 'I use ___ to smell odors',
  's16c': 'I use ___ to taste',
  's16d': '___ helps us walk',
  's16e': '___ helps us turn our head'
}

export function getEnglishTranslation(sentenceId) {
  return SENTENCE_TRANSLATIONS_EN[sentenceId] || ''
}
