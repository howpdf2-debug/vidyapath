'use client'

import { useState, useEffect, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { MessageCircle, Trash2, Send, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Comment {
  id: number
  user_id: string
  ncert_id: number
  comment: string
  created_at: string
  author_name: string | null
}

interface CommentSectionProps {
  chapterId: string | number
  language?: 'en' | 'hi'
}

export function CommentSection({
  chapterId,
  language = 'en',
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  // ✅ C1: typed User instead of any
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)

  const isHi = language === 'hi'
  const ncertId = Number(chapterId)

  const labels = {
    heading: isHi ? 'टिप्पणियाँ' : 'Comments',
    placeholder: isHi
      ? 'Kya sochte ho? Comment karo...'
      : 'What do you think? Comment...',
    post: isHi ? 'Post' : 'Post',
    posting: isHi ? 'Bhej rahe...' : 'Posting...',
    loginPrompt: isHi ? 'karke comment karo' : 'to post comments',
    loading: isHi ? 'Comments aa rahe hain...' : 'Loading comments...',
    empty: isHi
      ? 'Abhi tak koi comment nahi. Pehle tum bano! 💬'
      : 'No comments yet. Be the first! 💬',
    deleteBtn: isHi ? 'Hataao' : 'Delete',
    deleteConfirm: isHi
      ? 'Comment delete karna hai?'
      : 'Delete this comment?',
    postedToast: isHi ? 'Comment post ho gaya ✓' : 'Comment posted ✓',
    deletedToast: isHi ? 'Comment hata diya' : 'Comment deleted',
    loginError: isHi
      ? 'Comment karne ke liye login karo 💬'
      : 'Login to comment 💬',
    fallbackName: isHi ? 'Student' : 'Student',
    youLabel: isHi ? 'Aap' : 'You',
  }

  // ✅ C4: active flag cleanup for auth subscription
  useEffect(() => {
    setMounted(true)
    let active = true

    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (active) setUser(data.user)
    }
    fetchUser()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_e, session) => {
        if (active) setUser(session?.user ?? null)
      }
    )

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  // ✅ C2: useCallback + typed deps
  const fetchComments = useCallback(async () => {
    setFetching(true)
    try {
      if (!Number.isFinite(ncertId) || ncertId <= 0) {
        setComments([])
        setFetching(false)
        return
      }

      const { data: rawComments, error } = await supabase
        .from('chapter_comments')
        .select('id, user_id, ncert_id, comment, created_at')
        .eq('ncert_id', ncertId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.warn('[comments] Fetch error:', error.message)
        setComments([])
        setFetching(false)
        return
      }

      if (!rawComments || rawComments.length === 0) {
        setComments([])
        setFetching(false)
        return
      }

      const userIds = [...new Set(rawComments.map((c) => c.user_id))]

      const { data: profiles } = await supabase
        .from('public_profiles')
        .select('id, full_name')
        .in('id', userIds)

      const profileMap = new Map(
        (profiles ?? []).map((p) => [p.id, p.full_name])
      )

      const commentsWithAuthors: Comment[] = rawComments.map((c) => ({
        id: c.id,
        user_id: c.user_id,
        ncert_id: c.ncert_id,
        comment: c.comment,
        created_at: c.created_at,
        author_name: profileMap.get(c.user_id) || null,
      }))

      setComments(commentsWithAuthors)
    } catch (err) {
      console.error('[comments] Unexpected:', err)
      setComments([])
    } finally {
      setFetching(false)
    }
  }, [ncertId])

  useEffect(() => {
    void fetchComments()
  }, [fetchComments])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error(labels.loginError)
      return
    }
    if (!newComment.trim()) return

    setLoading(true)

    const { error } = await supabase.from('chapter_comments').insert({
      ncert_id: ncertId,
      user_id: user.id,
      comment: newComment.trim(),
    })

    if (error) {
      console.error('[comments] insert:', error)
      toast.error(
        isHi
          ? 'Comment save nahi hua. Dobara try karo'
          : 'Could not post. Try again'
      )
      setLoading(false)
      return
    }

    // ✅ C3: await fetch BEFORE setLoading(false)
    toast.success(labels.postedToast)
    setNewComment('')
    await fetchComments()
    setLoading(false)
  }

  const deleteComment = async (id: number) => {
    if (!confirm(labels.deleteConfirm)) return
    const { error } = await supabase
      .from('chapter_comments')
      .delete()
      .eq('id', id)
    if (error) {
      console.error('[comments] delete:', error)
      toast.error(
        isHi
          ? 'Delete nahi hua. Dobara try karo'
          : 'Could not delete. Try again'
      )
      return
    }
    toast.success(labels.deletedToast)
    await fetchComments()
  }

  const getDisplayName = (c: Comment): string => {
    if (user && c.user_id === user.id) {
      return (
        user.user_metadata?.full_name ||
        user.email?.split('@')[0] ||
        labels.youLabel
      )
    }
    if (c.author_name) return c.author_name
    return labels.fallbackName
  }

  const getInitial = (c: Comment): string =>
    getDisplayName(c).charAt(0).toUpperCase() || 'S'

  if (!mounted) return null

  // ✅ C2: language-aware date formatting
  const dateLocale = isHi ? 'hi-IN' : 'en-IN'

  return (
    <section className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          {labels.heading}
        </h3>
        {comments.length > 0 && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({comments.length})
          </span>
        )}
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={labels.placeholder}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                maxLength={500}
                className="w-full px-4 py-2.5 pr-16 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              />
              {/* ✅ C5: char counter shows when near limit */}
              {newComment.length > 400 && (
                <span
                  className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono tabular-nums ${
                    newComment.length >= 500
                      ? 'text-rose-500'
                      : 'text-gray-400'
                  }`}
                >
                  {newComment.length}/500
                </span>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || !newComment.trim()}
              className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 text-sm font-medium"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {labels.post}
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 text-center">
          <p className="text-sm text-indigo-700 dark:text-indigo-300">
            <Link href="/login" className="font-medium underline">
              Login
            </Link>{' '}
            {labels.loginPrompt}
          </p>
        </div>
      )}

      {fetching ? (
        <div className="text-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {labels.loading}
          </p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {labels.empty}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div
              key={c.id}
              className="bg-white/70 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                    {getInitial(c)}
                  </div>
                  <span className="font-medium text-sm text-gray-900 dark:text-white">
                    {getDisplayName(c)}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(c.created_at).toLocaleDateString(dateLocale, {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                {c.comment}
              </p>

              {user?.id === c.user_id && (
                <button
                  onClick={() => deleteComment(c.id)}
                  className="mt-2 inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {labels.deleteBtn}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}