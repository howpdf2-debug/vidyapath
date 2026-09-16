'use client'

import { useState } from 'react'
import { BookOpen, CheckCircle2, FileText } from 'lucide-react'
import { MCQQuiz } from './MCQQuiz'

interface Note {
  id: number
  section_title_hi: string | null
  content_html_hi: string
}

interface MCQ {
  id: number
  question_html_hi: string
  options_hi: string[]
  correct_answer: string
  explanation_html_hi: string | null
  difficulty: string
}

interface ContentTabsProps {
  notes: Note[]
  mcqs: MCQ[]
  topicTitle: string
}

type TabType = 'notes' | 'mcq' | 'pyq'

const TABS: { value: TabType; label_hi: string; label_en: string; icon: any }[] = [
  { value: 'notes', label_hi: 'नोट्स', label_en: 'Notes', icon: BookOpen },
  { value: 'mcq', label_hi: 'MCQ', label_en: 'Practice', icon: CheckCircle2 },
  { value: 'pyq', label_hi: 'PYQ', label_en: 'Previous Year', icon: FileText },
]

export function ContentTabs({ notes, mcqs, topicTitle }: ContentTabsProps) {
  const [tab, setTab] = useState<TabType>('notes')

  return (
    <div className="space-y-6">
      {/* Tab Bar */}
      <div
        role="tablist"
        aria-label="Content tabs"
        className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 sticky top-20 z-20 backdrop-blur-md max-w-fit"
      >
        {TABS.map((t) => {
          const Icon = t.icon
          const active = tab === t.value
          const count = t.value === 'notes' ? notes.length : t.value === 'mcq' ? mcqs.length : 0

          return (
            <button
              key={t.value}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.value)}
              className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                active
                  ? 'bg-gradient-to-r from-brand-600 to-purple-600 text-white shadow-lg'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label_hi}</span>
              <span
                className={`text-[10px] font-medium ${
                  active ? 'text-white/80' : 'text-slate-400'
                }`}
              >
                ({t.label_en})
              </span>
              {count > 0 && (
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    active
                      ? 'bg-white/25 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="min-h-[300px]">
        {tab === 'notes' && (
          <NotesPanel notes={notes} topicTitle={topicTitle} />
        )}
        {tab === 'mcq' && <MCQQuiz mcqs={mcqs} topicTitle={topicTitle} />}
        {tab === 'pyq' && (
          <EmptyPanel
            emoji="📄"
            title="PYQ जल्द आ रहे हैं"
            desc="Previous Year Questions इस topic के लिए जोड़े जा रहे हैं।"
          />
        )}
      </div>
    </div>
  )
}

function NotesPanel({ notes, topicTitle }: { notes: Note[]; topicTitle: string }) {
  if (!notes || notes.length === 0) {
    return (
      <EmptyPanel
        emoji="📝"
        title="नोट्स जल्द आ रहे हैं"
        desc={`${topicTitle} के नोट्स तैयार किए जा रहे हैं।`}
      />
    )
  }

  return (
    <div className="space-y-5">
      {notes.map((note) => (
        <article
          key={note.id}
          className="surface-card p-5 sm:p-6"
        >
          {note.section_title_hi && (
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-gradient-to-b from-brand-500 to-purple-500" />
              {note.section_title_hi}
            </h3>
          )}
          <div
            className="prose prose-sm sm:prose-base dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-li:text-slate-700 dark:prose-li:text-slate-300 prose-strong:text-slate-900 dark:prose-strong:text-white"
            dangerouslySetInnerHTML={{ __html: note.content_html_hi }}
          />
        </article>
      ))}
    </div>
  )
}

function EmptyPanel({
  emoji,
  title,
  desc,
}: {
  emoji: string
  title: string
  desc: string
}) {
  return (
    <div className="surface-card text-center py-16 px-6">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 mb-4">
        <span className="text-4xl">{emoji}</span>
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
        {desc}
      </p>
    </div>
  )
}