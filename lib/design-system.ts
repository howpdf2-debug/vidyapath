// lib/design-system.ts

export type Subject =
  | "math" | "science" | "physics" | "chemistry"
  | "biology" | "english" | "hindi";

export interface SubjectTheme {
  name: string;
  nameHindi: string;
  slug: string;
  className: string;
  color: string;
  lightColor: string;
  darkColor: string;
  gradient: string;
  emoji: string;
}

export const SUBJECT_THEMES: Record<Subject, SubjectTheme> = {
  math: {
    name: "Mathematics", nameHindi: "गणित", slug: "mathematics",
    className: "subject-math", color: "#2563EB",
    lightColor: "#EFF6FF", darkColor: "#1E3A8A",
    gradient: "from-blue-500 to-cyan-500", emoji: "📐",
  },
  science: {
    name: "Science", nameHindi: "विज्ञान", slug: "science",
    className: "subject-science", color: "#059669",
    lightColor: "#ECFDF5", darkColor: "#064E3B",
    gradient: "from-emerald-500 to-teal-500", emoji: "🔬",
  },
  physics: {
    name: "Physics", nameHindi: "भौतिक विज्ञान", slug: "physics",
    className: "subject-physics", color: "#7C3AED",
    lightColor: "#F5F3FF", darkColor: "#4C1D95",
    gradient: "from-purple-500 to-indigo-500", emoji: "⚛️",
  },
  chemistry: {
    name: "Chemistry", nameHindi: "रसायन विज्ञान", slug: "chemistry",
    className: "subject-chemistry", color: "#EA580C",
    lightColor: "#FFF7ED", darkColor: "#7C2D12",
    gradient: "from-orange-500 to-red-500", emoji: "🧪",
  },
  biology: {
    name: "Biology", nameHindi: "जीव विज्ञान", slug: "biology",
    className: "subject-biology", color: "#16A34A",
    lightColor: "#F0FDF4", darkColor: "#14532D",
    gradient: "from-green-500 to-emerald-500", emoji: "🧬",
  },
  english: {
    name: "English", nameHindi: "अंग्रेज़ी", slug: "english",
    className: "subject-english", color: "#C026D3",
    lightColor: "#FDF4FF", darkColor: "#701A75",
    gradient: "from-fuchsia-500 to-pink-500", emoji: "📖",
  },
  hindi: {
    name: "Hindi", nameHindi: "हिंदी", slug: "hindi",
    className: "subject-hindi", color: "#D97706",
    lightColor: "#FFF7ED", darkColor: "#78350F",
    gradient: "from-amber-500 to-orange-500", emoji: "🕉️",
  },
};

export function getSubjectKey(name: string | null | undefined): Subject | null {
  if (!name) return null;
  const raw = name.trim();
  const normalized = raw.toLowerCase();

  for (const [key, theme] of Object.entries(SUBJECT_THEMES)) {
    if (key === normalized) return key as Subject;
    if (theme.slug === normalized) return key as Subject;
    if (theme.name.toLowerCase() === normalized) return key as Subject;
    if (theme.nameHindi === raw) return key as Subject;
  }
  return null;
}

export function getSubjectTheme(name: string | null | undefined): SubjectTheme {
  const key = getSubjectKey(name);
  if (key) return SUBJECT_THEMES[key];

  return {
    name: name || "Subject",
    nameHindi: name || "विषय",
    slug: "general",
    className: "subject-general",
    color: "#4F46E5",
    lightColor: "#EEF2FF",
    darkColor: "#1E1B4B",
    gradient: "from-indigo-500 to-purple-500",
    emoji: "📚",
  };
}

export const DESIGN_TOKENS = {
  tapTarget: 44,
  radius: {
    sm: 8, md: 14, lg: 16, xl: 20, "2xl": 24, "3xl": 32, "4xl": 40,
  },
  contentWidth: { narrow: "42rem", default: "72rem", wide: "80rem" },
  motion: { fast: 180, normal: 240, slow: 320 },
} as const;