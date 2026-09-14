import { createServerClient } from '@/lib/supabase'
import Link from 'next/link'
import { LanguageToggle } from '@/components/LanguageToggle'

function getSubjectColor(subject: string): string {
  const colors: Record<string, string> = {
    'Mathematics': 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900/50',
    'Science': 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800 dark:hover:bg-emerald-900/50',
    'Social Science': 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800 dark:hover:bg-amber-900/50',
    'Hindi': 'bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800 dark:hover:bg-rose-900/50',
    'English': 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-800 dark:hover:bg-purple-900/50',
    'Sanskrit': 'bg-cyan-100 text-cyan-700 border-cyan-200 hover:bg-cyan-200 dark:bg-cyan-950/30 dark:text-cyan-300 dark:border-cyan-800 dark:hover:bg-cyan-900/50',
    'Economics': 'bg-teal-100 text-teal-700 border-teal-200 hover:bg-teal-200 dark:bg-teal-950/30 dark:text-teal-300 dark:border-teal-800 dark:hover:bg-teal-900/50',
    'Geography': 'bg-lime-100 text-lime-700 border-lime-200 hover:bg-lime-200 dark:bg-lime-950/30 dark:text-lime-300 dark:border-lime-800 dark:hover:bg-lime-900/50',
    'History': 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200 dark:bg-orange-950/30 dark:text-orange-300 dark:border-orange-800 dark:hover:bg-orange-900/50',
    'Civics': 'bg-sky-100 text-sky-700 border-sky-200 hover:bg-sky-200 dark:bg-sky-950/30 dark:text-sky-300 dark:border-sky-800 dark:hover:bg-sky-900/50',
    'Political Science': 'bg-sky-100 text-sky-700 border-sky-200 hover:bg-sky-200 dark:bg-sky-950/30 dark:text-sky-300 dark:border-sky-800 dark:hover:bg-sky-900/50',
  }
  const lower = subject.toLowerCase()
  for (const [key, value] of Object.entries(colors)) {
    if (lower.includes(key.toLowerCase())) return value
  }
  return 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700'
}

export default async function NotesBrowser({
  searchParams,
}: {
  searchParams: { lang?: string }
}) {
  const lang = searchParams.lang || 'english'
  const supabase = createServerClient()

  // Get classes that have notes (by checking existence in chapter_notes via ncert join)
  // For simplicity, we use ncert table and later we can filter by notes existence
  const { data: classes } = await supabase
    .from('ncert')
    .select('class')
    .eq('language', lang)
    .order('class', { ascending: true })

  const uniqueClasses = [...new Set(classes?.map(c => c.class) || [])]

  const classSubjects: Record<number, string[]> = {}
  for (const cls of uniqueClasses) {
    const { data: subjects } = await supabase
      .from('ncert')
      .select('subject')
      .eq('class', cls)
      .eq('language', lang)
    classSubjects[cls] = [...new Set(subjects?.map(s => s.subject) || [])]
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">📝 Study Notes</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Browse notes by class and subject – {lang === 'hindi' ? 'हिंदी' : 'English'} medium
          </p>
        </div>
        <LanguageToggle />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {uniqueClasses.map((cls) => (
          <div
            key={cls}
            className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6 hover:shadow-xl transition"
          >
            <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">
              Class {cls}
            </h2>
            <div className="flex flex-wrap gap-2">
              {classSubjects[cls]?.map((subject) => (
                <Link
                  key={subject}
                  href={`/notes/${cls}/${encodeURIComponent(subject)}?lang=${lang}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${getSubjectColor(subject)}`}
                >
                  {subject}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}