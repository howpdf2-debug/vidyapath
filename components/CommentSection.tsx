'use client'

import { useState, useEffect } from 'react'
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
  author_name?: string
  author_email?: string
}

export function CommentSection({ chapterId }: { chapterId: number }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    // Fetch comments
    fetchComments()
  }, [chapterId])

  const fetchComments = async () => {
    setFetching(true)
    try {
      // ✅ FIX 1: ncert_id instead of chapter_id
      // ✅ FIX 2: No join with users — fetch comments only
      const { data: rawComments, error } = await supabase
        .from('chapter_comments')
        .select('id, user_id, ncert_id, comment, created_at')
        .eq('ncert_id', chapterId)
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

      // ✅ FIX 3: Fetch author info separately (no join needed)
      // Using a server-side or simpler approach — use user_metadata from comment
      // For now, just show user IDs shortened
      const commentsWithAuthors: Comment[] = rawComments.map((c: any) => ({
        id: c.id,
        user_id: c.user_id,
        ncert_id: c.ncert_id,
        comment: c.comment,
        created_at: c.created_at,
        // Display fallback — will be replaced by real user data later
        author_name: null,
        author_email: null,
      }))

      setComments(commentsWithAuthors)
    } catch (err) {
      console.error('[comments] Unexpected:', err)
      setComments([])
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('Please login to comment')
      return
    }
    if (!newComment.trim()) return

    setLoading(true)

    // ✅ FIX: ncert_id instead of chapter_id
    const { error } = await supabase.from('chapter_comments').insert({
      ncert_id: chapterId,
      user_id: user.id,
      comment: newComment.trim(),
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Comment added!')
      setNewComment('')
      fetchComments()
    }
    setLoading(false)
  }

  const deleteComment = async (id: number) => {
    if (!confirm('Delete comment?')) return
    const { error } = await supabase
      .from('chapter_comments')
      .delete()
      .eq('id', id)
    if (error) toast.error(error.message)
    else {
      toast.success('Comment deleted')
      fetchComments()
    }
  }

  const getDisplayName = (c: Comment): string => {
    if (user && c.user_id === user.id) {
      // Current user's own comment
      return (
        user.user_metadata?.full_name ||
        user.email?.split('@')[0] ||
        'You'
      )
    }
    // Other users — show shortened ID
    return `User ${c.user_id.slice(0, 6)}`
  }

  return (
    <section className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Comments
        </h3>
        {comments.length > 0 && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({comments.length})
          </span>
        )}
      </div>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              maxLength={500}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            />
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
                  Post
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
            to post comments
          </p>
        </div>
      )}

      {/* Comments List */}
      {fetching ? (
        <div className="text-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Loading comments...
          </p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No comments yet. Be the first to comment!
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
                    {getDisplayName(c).charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-sm text-gray-900 dark:text-white">
                    {getDisplayName(c)}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(c.created_at).toLocaleDateString('en-IN', {
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
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}