import { createServerClient } from '@/lib/supabase'
import Link from 'next/link'

export default async function NCERTBrowser() {
  const supabase = createServerClient()
  
  const { data: classes } = await supabase
    .from('ncert')
    .select('class')
    .order('class', { ascending: true })
  
  const uniqueClasses = [...new Set(classes?.map(c => c.class) || [])]
  
  const classSubjects: Record<number, string[]> = {}
  for (const cls of uniqueClasses) {
    const { data: subjects } = await supabase
      .from('ncert')
      .select('subject')
      .eq('class', cls)
    classSubjects[cls] = [...new Set(subjects?.map(s => s.subject) || [])]
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold">📚 NCERT Books</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Choose your class and subject to access free PDFs and notes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {uniqueClasses.map((cls) => (
          <div key={cls} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6 hover:shadow-xl transition">
            <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">
              Class {cls}
            </h2>
            <div className="flex flex-wrap gap-2">
              {classSubjects[cls]?.map((subject) => (
                <Link
                  key={subject}
                  href={`/ncert/${cls}/${encodeURIComponent(subject)}`}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-full text-sm font-medium transition"
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