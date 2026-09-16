// ═══════════════════════════════════════════════════════
// COMPETITIVE EXAMS — Static Configuration
// Hindi-first content + Hindi/English category names
// ═══════════════════════════════════════════════════════

export interface ExamGroup {
  slug: string
  name_hi: string
  name_en: string
  full_name_hi: string
  full_name_en: string
  posts_hi: string[]
}

export interface Exam {
  slug: string
  name_hi: string
  name_en: string
  full_name_hi: string
  full_name_en: string
  emoji: string
  gradient: string
  glow: string
  description_hi: string
  groups: ExamGroup[]
}

export interface Subject {
  slug: string
  name_hi: string
  name_en: string
  short: string
  icon: string
  gradient: string
  is_gk: boolean
}

export interface Topic {
  slug: string
  name_hi: string
  name_en: string
  short: string
}

// ═══════════════════════════════════════════════════════
// EXAMS
// ═══════════════════════════════════════════════════════

export const EXAMS: Exam[] = [
  {
    slug: 'railway',
    name_hi: 'रेलवे',
    name_en: 'Railway',
    full_name_hi: 'भारतीय रेलवे भर्ती बोर्ड',
    full_name_en: 'Indian Railways Recruitment Board',
    emoji: '🚂',
    gradient: 'from-red-500 via-orange-500 to-amber-500',
    glow: 'shadow-red-500/30',
    description_hi: 'भारतीय रेलवे में नौकरी की तैयारी करें',
    groups: [
      {
        slug: 'group-c',
        name_hi: 'ग्रुप C',
        name_en: 'Group C',
        full_name_hi: 'ग्रुप C (NTPC)',
        full_name_en: 'Group C (NTPC)',
        posts_hi: ['स्टेशन मास्टर', 'क्लर्क', 'गुड्स गार्ड', 'जूनियर अकाउंट असिस्टेंट'],
      },
      {
        slug: 'group-d',
        name_hi: 'ग्रुप D',
        name_en: 'Group D',
        full_name_hi: 'ग्रुप D (Level 1)',
        full_name_en: 'Group D (Level 1)',
        posts_hi: ['ट्रैक मेंटेनर', 'हेल्पर', 'असिस्टेंट पॉइंट्समैन'],
      },
    ],
  },
  {
    slug: 'ssc',
    name_hi: 'SSC',
    name_en: 'SSC',
    full_name_hi: 'कर्मचारी चयन आयोग',
    full_name_en: 'Staff Selection Commission',
    emoji: '🎯',
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
    glow: 'shadow-blue-500/30',
    description_hi: 'केंद्र सरकार की नौकरी की तैयारी करें',
    groups: [
      {
        slug: 'cgl',
        name_hi: 'CGL',
        name_en: 'CGL',
        full_name_hi: 'CGL (संयुक्त स्नातक स्तरीय)',
        full_name_en: 'CGL (Combined Graduate Level)',
        posts_hi: ['इनकम टैक्स इंस्पेक्टर', 'असिस्टेंट ऑडिट ऑफिसर', 'सब-इंस्पेक्टर'],
      },
      {
        slug: 'chsl',
        name_hi: 'CHSL',
        name_en: 'CHSL',
        full_name_hi: 'CHSL (संयुक्त उच्चतर माध्यमिक स्तरीय)',
        full_name_en: 'CHSL (Combined Higher Secondary Level)',
        posts_hi: ['LDC', 'DEO', 'कोर्ट क्लर्क'],
      },
      {
        slug: 'mts',
        name_hi: 'MTS',
        name_en: 'MTS',
        full_name_hi: 'MTS (बहुकार्यीय कर्मचारी)',
        full_name_en: 'MTS (Multi-Tasking Staff)',
        posts_hi: ['मल्टी टास्किंग स्टाफ', 'हेल्पर'],
      },
    ],
  },
  {
    slug: 'bank',
    name_hi: 'बैंक',
    name_en: 'Bank',
    full_name_hi: 'बैंकिंग कार्मिक चयन संस्थान',
    full_name_en: 'Institute of Banking Personnel Selection',
    emoji: '🏦',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    glow: 'shadow-emerald-500/30',
    description_hi: 'बैंक में नौकरी की तैयारी करें',
    groups: [
      {
        slug: 'po',
        name_hi: 'PO',
        name_en: 'PO',
        full_name_hi: 'PO (प्रोबेशनरी ऑफिसर)',
        full_name_en: 'PO (Probationary Officer)',
        posts_hi: ['प्रोबेशनरी ऑफिसर', 'मैनेजमेंट ट्रेनी'],
      },
      {
        slug: 'clerk',
        name_hi: 'क्लर्क',
        name_en: 'Clerk',
        full_name_hi: 'क्लर्क',
        full_name_en: 'Clerk',
        posts_hi: ['क्लर्क', 'जूनियर असोसिएट'],
      },
    ],
  },
]

// ═══════════════════════════════════════════════════════
// SUBJECTS (11 flat — shared across all exams)
// ═══════════════════════════════════════════════════════

export const SUBJECTS: Subject[] = [
  {
    slug: 'math',
    name_hi: 'गणित',
    name_en: 'Math',
    short: 'Math',
    icon: '📐',
    gradient: 'from-blue-500 to-cyan-500',
    is_gk: false,
  },
  {
    slug: 'reasoning',
    name_hi: 'तर्कशक्ति',
    name_en: 'Reasoning',
    short: 'Reasoning',
    icon: '🧠',
    gradient: 'from-purple-500 to-indigo-500',
    is_gk: false,
  },
  {
    slug: 'english',
    name_hi: 'अंग्रेज़ी',
    name_en: 'English',
    short: 'English',
    icon: '📖',
    gradient: 'from-fuchsia-500 to-pink-500',
    is_gk: false,
  },
  {
    slug: 'ca',
    name_hi: 'करेंट अफेयर्स',
    name_en: 'Current Affairs',
    short: 'CA',
    icon: '📰',
    gradient: 'from-orange-500 to-red-500',
    is_gk: true,
  },
  {
    slug: 'static-gk',
    name_hi: 'स्टेटिक जीके',
    name_en: 'Static GK',
    short: 'Static GK',
    icon: '📚',
    gradient: 'from-amber-500 to-orange-500',
    is_gk: true,
  },
  {
    slug: 'history',
    name_hi: 'इतिहास',
    name_en: 'History',
    short: 'History',
    icon: '🏛️',
    gradient: 'from-yellow-600 to-amber-600',
    is_gk: true,
  },
  {
    slug: 'geo',
    name_hi: 'भूगोल',
    name_en: 'Geography',
    short: 'Geo',
    icon: '🌍',
    gradient: 'from-green-500 to-emerald-500',
    is_gk: true,
  },
  {
    slug: 'polity',
    name_hi: 'राजव्यवस्था',
    name_en: 'Polity',
    short: 'Polity',
    icon: '⚖️',
    gradient: 'from-slate-500 to-slate-700',
    is_gk: true,
  },
  {
    slug: 'economy',
    name_hi: 'अर्थव्यवस्था',
    name_en: 'Economy',
    short: 'Economy',
    icon: '💰',
    gradient: 'from-emerald-500 to-teal-500',
    is_gk: true,
  },
  {
    slug: 'science',
    name_hi: 'सामान्य विज्ञान',
    name_en: 'General Science',
    short: 'Science',
    icon: '🔬',
    gradient: 'from-cyan-500 to-blue-500',
    is_gk: true,
  },
  {
    slug: 'misc',
    name_hi: 'विविध',
    name_en: 'Miscellaneous',
    short: 'Misc',
    icon: '🎯',
    gradient: 'from-rose-500 to-pink-500',
    is_gk: true,
  },
]

// ═══════════════════════════════════════════════════════
// TOPICS (grouped by subject)
// ═══════════════════════════════════════════════════════

export const TOPICS: Record<string, Topic[]> = {
  math: [
    { slug: 'number', name_hi: 'संख्या पद्धति', name_en: 'Number System', short: 'Number' },
    { slug: 'percent', name_hi: 'प्रतिशत', name_en: 'Percentage', short: 'Percent' },
    { slug: 'profit-loss', name_hi: 'लाभ-हानि', name_en: 'Profit & Loss', short: 'Profit-Loss' },
    { slug: 'average', name_hi: 'औसत', name_en: 'Average', short: 'Average' },
    { slug: 'ratio', name_hi: 'अनुपात-समानुपात', name_en: 'Ratio & Proportion', short: 'Ratio' },
    { slug: 'time-work', name_hi: 'समय और कार्य', name_en: 'Time & Work', short: 'Time-Work' },
    { slug: 'speed', name_hi: 'गति, समय, दूरी', name_en: 'Speed, Time, Distance', short: 'Speed' },
    { slug: 'interest', name_hi: 'साधारण/चक्रवृद्धि ब्याज', name_en: 'Simple/Compound Interest', short: 'Interest' },
  ],
  reasoning: [
    { slug: 'analogy', name_hi: 'सादृश्यता', name_en: 'Analogy', short: 'Analogy' },
    { slug: 'classify', name_hi: 'वर्गीकरण', name_en: 'Classification', short: 'Classify' },
    { slug: 'series', name_hi: 'श्रृंखला', name_en: 'Series', short: 'Series' },
    { slug: 'coding', name_hi: 'कोडिंग-डिकोडिंग', name_en: 'Coding-Decoding', short: 'Coding' },
    { slug: 'blood', name_hi: 'रक्त संबंध', name_en: 'Blood Relations', short: 'Blood' },
    { slug: 'direction', name_hi: 'दिशा ज्ञान', name_en: 'Direction Sense', short: 'Direction' },
    { slug: 'syllogism', name_hi: 'न्याय-निगमन', name_en: 'Syllogism', short: 'Syllogism' },
    { slug: 'puzzle', name_hi: 'पहेली', name_en: 'Puzzles', short: 'Puzzle' },
  ],
  english: [
    { slug: 'grammar', name_hi: 'व्याकरण', name_en: 'Grammar', short: 'Grammar' },
    { slug: 'vocab', name_hi: 'शब्दावली', name_en: 'Vocabulary', short: 'Vocab' },
    { slug: 'comp', name_hi: 'गद्यांश', name_en: 'Comprehension', short: 'Comp' },
    { slug: 'fill', name_hi: 'रिक्त स्थान भरें', name_en: 'Fill in the Blanks', short: 'Fill' },
    { slug: 'error', name_hi: 'त्रुटि पहचान', name_en: 'Error Spotting', short: 'Error' },
  ],
  ca: [
    { slug: 'national', name_hi: 'राष्ट्रीय मामले', name_en: 'National Affairs', short: 'National' },
    { slug: 'intl', name_hi: 'अंतर्राष्ट्रीय मामले', name_en: 'International Affairs', short: 'Intl' },
    { slug: 'sports', name_hi: 'खेल', name_en: 'Sports', short: 'Sports' },
    { slug: 'awards', name_hi: 'पुरस्कार एवं सम्मान', name_en: 'Awards & Honors', short: 'Awards' },
    { slug: 'appoint', name_hi: 'नियुक्तियाँ', name_en: 'Appointments', short: 'Appoint' },
    { slug: 'summit', name_hi: 'शिखर सम्मेलन', name_en: 'Summits', short: 'Summit' },
  ],
  'static-gk': [
    { slug: 'places', name_hi: 'महत्वपूर्ण स्थान', name_en: 'Important Places', short: 'Places' },
    { slug: 'monuments', name_hi: 'स्मारक', name_en: 'Monuments', short: 'Monuments' },
    { slug: 'firsts', name_hi: 'भारत में प्रथम', name_en: 'First in India', short: 'Firsts' },
    { slug: 'records', name_hi: 'सर्वोच्च/सबसे बड़ा', name_en: 'Superlatives', short: 'Records' },
    { slug: 'symbols', name_hi: 'राष्ट्रीय प्रतीक', name_en: 'National Symbols', short: 'Symbols' },
  ],
  history: [
    { slug: 'ancient', name_hi: 'प्राचीन भारत', name_en: 'Ancient India', short: 'Ancient' },
    { slug: 'medieval', name_hi: 'मध्यकालीन भारत', name_en: 'Medieval India', short: 'Medieval' },
    { slug: 'modern', name_hi: 'आधुनिक भारत', name_en: 'Modern India', short: 'Modern' },
    { slug: 'freedom', name_hi: 'स्वतंत्रता संग्राम', name_en: 'Freedom Struggle', short: 'Freedom' },
  ],
  geo: [
    { slug: 'india', name_hi: 'भारत का भूगोल', name_en: 'Indian Geography', short: 'India' },
    { slug: 'world', name_hi: 'विश्व का भूगोल', name_en: 'World Geography', short: 'World' },
    { slug: 'physical', name_hi: 'भौतिक भूगोल', name_en: 'Physical Geography', short: 'Physical' },
    { slug: 'economic', name_hi: 'आर्थिक भूगोल', name_en: 'Economic Geography', short: 'Economic' },
  ],
  polity: [
    { slug: 'constitution', name_hi: 'संविधान', name_en: 'Constitution', short: 'Constitution' },
    { slug: 'parliament', name_hi: 'संसद', name_en: 'Parliament', short: 'Parliament' },
    { slug: 'judiciary', name_hi: 'न्यायपालिका', name_en: 'Judiciary', short: 'Judiciary' },
    { slug: 'amend', name_hi: 'संविधान संशोधन', name_en: 'Amendments', short: 'Amend' },
    { slug: 'rights', name_hi: 'मौलिक अधिकार', name_en: 'Fundamental Rights', short: 'Rights' },
  ],
  economy: [
    { slug: 'banking', name_hi: 'बैंकिंग', name_en: 'Banking', short: 'Banking' },
    { slug: 'budget', name_hi: 'बजट', name_en: 'Budget', short: 'Budget' },
    { slug: 'schemes', name_hi: 'सरकारी योजनाएँ', name_en: 'Government Schemes', short: 'Schemes' },
    { slug: 'gdp', name_hi: 'GDP', name_en: 'GDP', short: 'GDP' },
    { slug: 'committees', name_hi: 'समितियाँ', name_en: 'Committees', short: 'Committees' },
  ],
  science: [
    { slug: 'physics', name_hi: 'भौतिकी', name_en: 'Physics', short: 'Physics' },
    { slug: 'chem', name_hi: 'रसायन विज्ञान', name_en: 'Chemistry', short: 'Chem' },
    { slug: 'bio', name_hi: 'जीव विज्ञान', name_en: 'Biology', short: 'Bio' },
    { slug: 'daily', name_hi: 'दैनिक विज्ञान', name_en: 'Everyday Science', short: 'Daily' },
  ],
  misc: [
    { slug: 'books', name_hi: 'पुस्तकें एवं लेखक', name_en: 'Books & Authors', short: 'Books' },
    { slug: 'days', name_hi: 'महत्वपूर्ण दिवस', name_en: 'Important Days', short: 'Days' },
    { slug: 'orgs', name_hi: 'संगठन', name_en: 'Organizations', short: 'Orgs' },
    { slug: 'dances', name_hi: 'लोक नृत्य', name_en: 'Folk Dances', short: 'Dances' },
    { slug: 'symbols', name_hi: 'राष्ट्रीय प्रतीक', name_en: 'National Symbols', short: 'Symbols' },
  ],
}

// ═══════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════

export function getExam(slug: string): Exam | null {
  return EXAMS.find((e) => e.slug === slug) || null
}

export function getGroup(examSlug: string, groupSlug: string): ExamGroup | null {
  const exam = getExam(examSlug)
  if (!exam) return null
  return exam.groups.find((g) => g.slug === groupSlug) || null
}

export function getSubject(slug: string): Subject | null {
  return SUBJECTS.find((s) => s.slug === slug) || null
}

export function getTopics(subjectSlug: string): Topic[] {
  return TOPICS[subjectSlug] || []
}

export function getTopic(subjectSlug: string, topicSlug: string): Topic | null {
  const topics = getTopics(subjectSlug)
  return topics.find((t) => t.slug === topicSlug) || null
}

export function getSubjectDisplayName(subject: Subject): string {
  return `${subject.name_hi} (${subject.short})`
}

export function getTopicDisplayName(topic: Topic): string {
  return `${topic.name_hi} (${topic.short})`
}