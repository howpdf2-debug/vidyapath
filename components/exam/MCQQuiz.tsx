'use client'

import { useState, useMemo } from 'react'
import {
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Trophy,
} from 'lucide-react'

interface MCQ {
  id: number
  question_html_hi: string
  options_hi: string[]
  correct_answer: string
  explanation_html_hi: string | null
  difficulty: string
}

interface MCQQuizProps {
  mcqs: MCQ[]
  topicTitle: string
}

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E']

export function MCQQuiz({ mcqs, topicTitle }: MCQQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [finished, setFinished] = useState(false)

  const total = mcqs.length
  const current = mcqs[currentIndex]

  // Score
  const score = useMemo(() => {
    let correct = 0
    for (const mcq of mcqs) {
      if (answers[mcq.id] === mcq.correct_answer) correct++
    }
    return correct
  }, [answers, mcqs])

  if (!mcqs || mcqs.length === 0) {
    return (
      <div className="surface-card text-center py-16 px-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 mb-4">
          <span className="text-4xl">✍️</span>
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          MCQ जल्द आ रहे हैं
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          {topicTitle} के practice questions तैयार किए जा रहे हैं।
        </p>
      </div>
    )
  }

  // Finished screen
  if (finished) {
    const percentage = Math.round((score / total) * 100)
    const isPass = percentage >= 60

    return (
      <div className="surface-card p-8 sm:p-12 text-center">
        <div
          className={`inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-6 ${
            isPass
              ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
              : 'bg-gradient-to-br from-amber-500 to-orange-500'
          } shadow-2xl`}
        >
          <Trophy className="w-12 h-12 text-white" />
        </div>

        <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-3">
          {isPass ? '🎉 शाबाश!' : '💪 और प्रयास करें'}
        </h3>

        <div className="inline-flex items-baseline gap-2 mb-8">
          <span className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">
            {score}
          </span>
          <span className="text-2xl text-slate-400 font-bold">/{total}</span>
        </div>

        <div className="max-w-xs mx-auto mb-8">
          <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isPass
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            {percentage}% सही
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => {
              setCurrentIndex(0)
              setSelectedAnswer(null)
              setRevealed(false)
              setAnswers({})
              setFinished(false)
            }}
            className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-brand-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition"
          >
            <RotateCcw className="w-4 h-4" />
            फिर से करें
          </button>
        </div>
      </div>
    )
  }

  const handleSelect = (label: string) => {
    if (revealed) return
    setSelectedAnswer(label)
  }

  const handleReveal = () => {
    if (!selectedAnswer) return
    setAnswers({ ...answers, [current.id]: selectedAnswer })
    setRevealed(true)
  }

  const handleNext = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswer(answers[mcqs[currentIndex + 1].id] || null)
      setRevealed(!!answers[mcqs[currentIndex + 1].id])
    } else {
      setFinished(true)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setSelectedAnswer(answers[mcqs[currentIndex - 1].id] || null)
      setRevealed(!!answers[mcqs[currentIndex - 1].id])
    }
  }

  const isCorrect = revealed && selectedAnswer === current.correct_answer

  return (
    <div className="surface-card p-5 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white text-sm font-black shadow-md">
            {currentIndex + 1}
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">
              प्रश्न
            </p>
            <p className="text-xs text-slate-400">
              {currentIndex + 1} / {total}
            </p>
          </div>
        </div>
        {current.difficulty && (
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
              current.difficulty === 'easy'
                ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                : current.difficulty === 'hard'
                  ? 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300'
                  : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
            }`}
          >
            {current.difficulty}
          </span>
        )}
      </div>

      {/* Question */}
      <div
        className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-slate-900 dark:text-white"
        dangerouslySetInnerHTML={{ __html: current.question_html_hi }}
      />

      {/* Options */}
      <div className="space-y-2.5">
        {current.options_hi.map((option, idx) => {
          const label = OPTION_LABELS[idx]
          const isSelected = selectedAnswer === label
          const isRight = revealed && label === current.correct_answer
          const isWrong = revealed && isSelected && label !== current.correct_answer

          return (
            <button
              key={label}
              onClick={() => handleSelect(label)}
              disabled={revealed}
              className={`w-full flex items-start gap-3 p-3.5 sm:p-4 rounded-xl border-2 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed ${
                isRight
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                  : isWrong
                    ? 'border-red-500 bg-red-50 dark:bg-red-950/30'
                    : isSelected
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-600 bg-white dark:bg-slate-900'
              }`}
            >
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs sm:text-sm font-black flex-shrink-0 ${
                  isRight
                    ? 'bg-emerald-500 text-white'
                    : isWrong
                      ? 'bg-red-500 text-white'
                      : isSelected
                        ? 'bg-brand-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {isRight ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isWrong ? (
                  <XCircle className="w-4 h-4" />
                ) : (
                  label
                )}
              </div>
              <span className="text-sm sm:text-base text-slate-700 dark:text-slate-200 flex-1 leading-relaxed">
                {option}
              </span>
            </button>
          )
        })}
      </div>

      {/* Explanation */}
      {revealed && current.explanation_html_hi && (
        <div
          className={`p-4 rounded-xl border-2 ${
            isCorrect
              ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/20'
              : 'border-amber-300 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/20'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {isCorrect ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                  सही उत्तर!
                </p>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <p className="text-sm font-bold text-red-700 dark:text-red-300">
                  सही उत्तर: {current.correct_answer}
                </p>
              </>
            )}
          </div>
          <div
            className="prose prose-sm dark:prose-invert max-w-none text-sm"
            dangerouslySetInnerHTML={{ __html: current.explanation_html_hi }}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-700 flex-wrap">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          पिछला
        </button>

        {!revealed ? (
          <button
            onClick={handleReveal}
            disabled={!selectedAnswer}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 text-white font-bold text-sm hover:shadow-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            जाँच करें
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 text-white font-bold text-sm hover:shadow-lg transition"
          >
            {currentIndex === total - 1 ? (
              <>
                <Trophy className="w-4 h-4" />
                परिणाम देखें
              </>
            ) : (
              <>
                अगला
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}