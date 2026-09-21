'use client'

import { useState } from 'react'
import { FileText, Bell, BookOpen, Video } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

interface NotesSectionProps {
  chapterId?: string | number
  chapterTitle?: string
  className?: string
  notesAvailable?: boolean
  pdfUrl?: string | null
  youtubeId?: string | null
  isLoggedIn?: boolean
  youtubeChannelUrl?: string
  language?: string
}

const DEFAULT_CHANNEL_URL = 'https://youtube.com/@vidyapath'

export function NotesSection({
  chapterId,
  notesAvailable = false,
  pdfUrl,
  youtubeId,
  isLoggedIn = false,
  youtubeChannelUrl = DEFAULT_CHANNEL_URL,
}: NotesSectionProps) {
  const [notifyLoading, setNotifyLoading] = useState(false)
  const [notified, setNotified] = useState(false)

  if (notesAvailable) return null

  const handleNotify = async () => {
    if (!isLoggedIn) {
      toast.error('Notify karne ke liye login karo')
      return
    }
    if (!chapterId) {
      toast.error('Chapter information missing')
      return
    }

    setNotifyLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Please login first')
        setNotifyLoading(false)
        return
      }

      // ✅ FIX: ncert_id (not chapter_id)
      const { error } = await supabase.from('notes_notifications').insert({
        user_id: user.id,
        ncert_id: chapterId,
      })

      if (error) {
        if (error.code === '23505') {
          setNotified(true)
          toast.success('Aap pehle se subscribed ho!')
        } else if (error.code === '42P01') {
          setNotified(true)
          toast.success("We'll keep you posted! 🔔")
        } else {
          console.error('[notes-notify] Error:', error)
          toast.error('Something went wrong')
        }
      } else {
        setNotified(true)
        toast.success('Notes ready hone pe notify karenge! 🔔')
      }
    } catch (err) {
      console.error('[notes-notify] Unexpected:', err)
      toast.error('Network error')
    } finally {
      setNotifyLoading(false)
    }
  }

  return (
    <section className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
      <div className="p-5">
        <div className="flex items-center gap-2 text-lg font-semibold mb-4">
          <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          Chapter Notes
        </div>

        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 mb-4">
            <FileText className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            📝 Notes coming soon!
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            Is chapter ke notes abhi taiyaar kiye ja rahe hain. Jab ready
            honge, aap isi page pe padh payenge.
          </p>

          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <button
              onClick={handleNotify}
              disabled={notifyLoading || notified}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {notified ? (
                <>
                  <Bell className="w-4 h-4 fill-current" />
                  Subscribed!
                </>
              ) : notifyLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Wait...
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4" />
                  Notify me
                </>
              )}
            </button>

            {pdfUrl && (
              <Link
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 transition text-sm font-medium"
              >
                <BookOpen className="w-4 h-4" />
                NCERT PDF
              </Link>
            )}

            {youtubeId ? (
              <Link
                href={`https://youtube.com/watch?v=${youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800 hover:bg-red-50 transition text-sm font-medium"
              >
                <Video className="w-4 h-4" />
                Video dekho
              </Link>
            ) : (
              <Link
                href={youtubeChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800 hover:bg-red-50 transition text-sm font-medium"
              >
                <Video className="w-4 h-4" />
                YouTube
              </Link>
            )}
          </div>

          {!isLoggedIn && (
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              💡 Notify karne ke liye{' '}
              <Link href="/login" className="text-indigo-600 hover:underline font-medium">
                login karo
              </Link>
            </p>
          )}
        </div>
      </div>
    </section>
  )
}