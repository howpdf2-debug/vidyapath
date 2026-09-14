'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export function CommentSection({ chapterId }: { chapterId: number }) {
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetchComments()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [chapterId])

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('chapter_comments')
      .select('*, users!inner(email, user_metadata)')
      .eq('chapter_id', chapterId)
      .order('created_at', { ascending: false })
    if (!error) setComments(data || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('Please login to comment')
      return
    }
    if (!newComment.trim()) return

    setLoading(true)
    const { error } = await supabase.from('chapter_comments').insert({
      chapter_id: chapterId,
      user_id: user.id,
      comment: newComment,
    })
    if (error) toast.error(error.message)
    else {
      toast.success('Comment added!')
      setNewComment('')
      fetchComments()
    }
    setLoading(false)
  }

  const deleteComment = async (id: number) => {
    if (!confirm('Delete comment?')) return
    const { error } = await supabase.from('chapter_comments').delete().eq('id', id)
    if (error) toast.error(error.message)
    else fetchComments()
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4">💬 Comments</h3>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder={user ? 'Write a comment...' : 'Login to comment'}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={!user}
          className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <button
          type="submit"
          disabled={loading || !user}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50"
        >
          Post
        </button>
      </form>
      <div className="space-y-3">
        {comments.map((c) => (
          <div key={c.id} className="bg-white/60 dark:bg-gray-800/60 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between">
              <span className="font-medium">
                {c.users?.user_metadata?.full_name || c.users?.email || 'Anonymous'}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(c.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="mt-1 text-gray-700 dark:text-gray-300">{c.comment}</p>
            {user?.id === c.user_id && (
              <button
                onClick={() => deleteComment(c.id)}
                className="text-xs text-red-500 hover:underline mt-1"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}