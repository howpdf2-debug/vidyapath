'use client'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ChapterContent() {
  const searchParams = useSearchParams()
  const classNum = searchParams.get('class')
  const subject = searchParams.get('subject')
  const chapterNum = searchParams.get('chapter')

  const [chapter, setChapter] = useState<any>(null)
  const [notesHtml, setNotesHtml] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!classNum || !subject || !chapterNum) {
      setLoading(false)
      return
    }
    Promise.all([
      supabase
        .from('ncert')
        .select('*')
        .eq('class', parseInt(classNum))
        .eq('subject', subject)
        .eq('chapter_num', parseInt(chapterNum))
        .single(),
      supabase
        .from('chapter_notes')
        .select('content_html')
        .eq('class', parseInt(classNum))
        .eq('subject', subject)
        .eq('chapter_num', parseInt(chapterNum))
        .maybeSingle()
    ]).then(([chapterRes, notesRes]) => {
      if (chapterRes.data) setChapter(chapterRes.data)
      if (notesRes.data) setNotesHtml(notesRes.data.content_html)
      setLoading(false)
    })
  }, [classNum, subject, chapterNum])

  if (!classNum || !subject || !chapterNum) {
    return <div className="p-8 text-center text-red-600">Invalid URL</div>
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>
  if (!chapter) return <div className="p-8 text-center">Chapter not found</div>

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold">Class {chapter.class} {chapter.subject}</h1>
      <h2 className="text-xl mt-2">Chapter {chapter.chapter_num}: {chapter.chapter_title}</h2>
      
      {chapter.pdf_url && (
        <a href={chapter.pdf_url} target="_blank" className="text-blue-600 underline mt-4 inline-block">
          Download PDF
        </a>
      )}

      {/* Notes Section */}
      <div className="mt-8">
        {notesHtml ? (
          <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: notesHtml }} />
        ) : (
          <div className="bg-gray-100 p-6 rounded-lg text-center">
            <p className="text-gray-600">
              📝 Detailed notes for this chapter are being prepared. They will be added soon.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}