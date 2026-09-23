'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { AdminHeader } from '@/components/AdminHeader'
import {
  ArrowLeft, Trash2, PlusCircle, Video, ExternalLink, Search,
  Star, StarOff, Edit, X, Check, Film, Zap, Sparkles, Megaphone,
} from 'lucide-react'
import { extractYouTubeId, getYouTubeThumbnail, getYouTubeWatchUrl } from '@/lib/youtube'

interface ChapterOpt {
  class: number
  subject: string
  chapter_num: number
  chapter_title: string
}

interface VideoRow {
  id: number
  ncert_id: number
  youtube_id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  video_type: string
  language: string
  order_index: number
  is_featured: boolean
  view_count: number
  ncert?: {
    class: number
    subject: string
    chapter_num: number
    chapter_title: string
  }
}

const VIDEO_TYPES = [
  { value: 'lecture', label: 'Full Lecture', icon: Film, color: 'text-red-600 bg-red-50 dark:bg-red-950/40' },
  { value: 'revision', label: 'Revision', icon: Zap, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' },
  { value: 'shorts', label: 'Shorts', icon: Sparkles, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40' },
  { value: 'promo', label: 'Promo', icon: Megaphone, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40' },
]

const INITIAL_FORM = {
  class: '',
  subject: '',
  chapter_num: '',
  youtube_url: '',
  title: '',
  description: '',
  video_type: 'lecture',
  language: 'hi',
  order_index: 0,
  is_featured: false,
}

export default function AdminVideos() {
  const [videos, setVideos] = useState<VideoRow[]>([])
  const [chapters, setChapters] = useState<ChapterOpt[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)

  // Filters
  const [search, setSearch] = useState('')
  const [filterClass, setFilterClass] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterLang, setFilterLang] = useState('')

  const [form, setForm] = useState(INITIAL_FORM)

  useEffect(() => {
    fetchVideos()
    fetchChapters()
  }, [])

  const fetchVideos = async () => {
    setFetching(true)
    try {
      const res = await fetch('/api/admin/videos?limit=500')
      if (!res.ok) throw new Error('Fetch failed')
      const result = await res.json()
      setVideos(result.data || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load videos')
    } finally {
      setFetching(false)
    }
  }

  const fetchChapters = async () => {
    const { data } = await supabase
      .from('ncert')
      .select('class, subject, chapter_num, chapter_title')
      .eq('language', 'en')
      .order('class')
      .order('subject')
      .order('chapter_num')
    setChapters(data || [])
  }

  // ═══════ YouTube ID live preview ═══════
  const previewId = useMemo(
    () => extractYouTubeId(form.youtube_url),
    [form.youtube_url]
  )

  // ═══════ Submit ═══════
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const ytId = previewId
    if (!ytId) {
      toast.error('Invalid YouTube URL')
      setLoading(false)
      return
    }

    const payload = {
      class: form.class,
      subject: form.subject,
      chapter_num: form.chapter_num,
      youtube_id: ytId,
      title: form.title,
      description: form.description,
      video_type: form.video_type,
      language: form.language,
      order_index: form.order_index,
      is_featured: form.is_featured,
    }

    try {
      const url = '/api/admin/videos'
      const method = editingId ? 'PUT' : 'POST'
      const body = editingId ? { ...payload, id: editingId } : payload

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const result = await res.json()

      if (res.ok) {
        toast.success(editingId ? 'Video updated!' : 'Video added!')
        setForm(INITIAL_FORM)
        setEditingId(null)
        setShowForm(false)
        fetchVideos()
      } else {
        toast.error(result.error || 'Failed to save')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (v: VideoRow) => {
    setEditingId(v.id)
    setForm({
      class: v.ncert?.class.toString() || '',
      subject: v.ncert?.subject || '',
      chapter_num: v.ncert?.chapter_num.toString() || '',
      youtube_url: v.youtube_id,
      title: v.title,
      description: v.description || '',
      video_type: v.video_type,
      language: v.language,
      order_index: v.order_index,
      is_featured: v.is_featured,
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this video?')) return
    const res = await fetch(`/api/admin/videos?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Deleted')
      fetchVideos()
    } else {
      toast.error('Delete failed')
    }
  }

  const toggleFeatured = async (v: VideoRow) => {
    const res = await fetch('/api/admin/videos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: v.id, is_featured: !v.is_featured }),
    })
    if (res.ok) {
      toast.success(v.is_featured ? 'Unfeatured' : 'Featured')
      fetchVideos()
    }
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(INITIAL_FORM)
  }

  // ═══════ Cascading dropdowns ═══════
  const uniqueClasses = [...new Set(chapters.map((c) => c.class))].sort((a, b) => a - b)
  const subjectsForClass = form.class
    ? [...new Set(chapters.filter((c) => c.class === parseInt(form.class)).map((c) => c.subject))]
    : []
  const chaptersForSubject =
    form.class && form.subject
      ? chapters.filter(
          (c) => c.class === parseInt(form.class) && c.subject === form.subject
        )
      : []

  // ═══════ Filtered list ═══════
  const filteredVideos = useMemo(() => {
    return videos.filter((v) => {
      if (filterClass && v.ncert?.class !== parseInt(filterClass)) return false
      if (filterType && v.video_type !== filterType) return false
      if (filterLang && v.language !== filterLang) return false
      if (search && !v.title.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [videos, filterClass, filterType, filterLang, search])

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <AdminHeader title="🎥 Manage Chapter Videos" />

      {/* ═══════ Stats Bar ═══════ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Videos" value={videos.length} color="indigo" />
        <StatCard label="Lectures" value={videos.filter((v) => v.video_type === 'lecture').length} color="red" />
        <StatCard label="Shorts" value={videos.filter((v) => v.video_type === 'shorts').length} color="purple" />
        <StatCard label="Featured" value={videos.filter((v) => v.is_featured).length} color="amber" />
      </div>

      {/* ═══════ Add Button ═══════ */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium shadow-lg shadow-indigo-500/30"
        >
          <PlusCircle className="w-5 h-5" />
          Add New Video
        </button>
      )}

      {/* ═══════ Add/Edit Form ═══════ */}
      {showForm && (
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              {editingId ? <Edit className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
              {editingId ? 'Edit Video' : 'Add New Video'}
            </h2>
            <button onClick={closeForm} className="text-gray-500 hover:text-gray-700 p-2">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Class/Subject/Chapter */}
            {!editingId && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SelectField
                  label="Class *"
                  value={form.class}
                  onChange={(v) => setForm({ ...form, class: v, subject: '', chapter_num: '' })}
                  options={uniqueClasses.map((c) => ({ value: String(c), label: `Class ${c}` }))}
                />
                <SelectField
                  label="Subject *"
                  value={form.subject}
                  onChange={(v) => setForm({ ...form, subject: v, chapter_num: '' })}
                  options={subjectsForClass.map((s) => ({ value: s, label: s }))}
                  disabled={!form.class}
                />
                <SelectField
                  label="Chapter *"
                  value={form.chapter_num}
                  onChange={(v) => setForm({ ...form, chapter_num: v })}
                  options={chaptersForSubject.map((ch) => ({
                    value: String(ch.chapter_num),
                    label: `Ch ${ch.chapter_num} — ${ch.chapter_title.slice(0, 30)}`,
                  }))}
                  disabled={!form.subject}
                />
              </div>
            )}

            {/* YouTube URL with live preview */}
            <div className="space-y-2">
              <label className="text-sm font-medium">YouTube URL or ID *</label>
              <input
                type="text"
                placeholder="https://youtube.com/watch?v=... or just the video ID"
                value={form.youtube_url}
                onChange={(e) => setForm({ ...form, youtube_url: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
              {form.youtube_url && (
                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
                  {previewId ? (
                    <>
                      <img
                        src={getYouTubeThumbnail(previewId, 'hq')}
                        alt="Preview"
                        width={128}
                        height={80}
                        loading="lazy"
                        decoding="async"
                        className="w-32 h-20 object-cover rounded-lg shadow"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-1">Video ID</p>
                        <p className="font-mono text-sm font-medium">{previewId}</p>
                        <a
                          href={getYouTubeWatchUrl(previewId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline mt-2"
                        >
                          <ExternalLink className="w-3 h-3" /> Preview on YouTube
                        </a>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-red-600">⚠️ Invalid YouTube URL</p>
                  )}
                </div>
              )}
            </div>

            {/* Title */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Title *</label>
              <input
                type="text"
                placeholder="e.g., Class 6 Math Ch 1 — Patterns in Mathematics"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Description (optional)</label>
              <textarea
                rows={2}
                placeholder="Short description of the video..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              />
            </div>

            {/* Type / Language / Order */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SelectField
                label="Video Type"
                value={form.video_type}
                onChange={(v) => setForm({ ...form, video_type: v })}
                options={VIDEO_TYPES.map((t) => ({ value: t.value, label: t.label }))}
              />
              <SelectField
                label="Language"
                value={form.language}
                onChange={(v) => setForm({ ...form, language: v })}
                options={[
                  { value: 'hi', label: 'हिंदी (Hindi)' },
                  { value: 'en', label: 'English' },
                ]}
              />
              <div className="space-y-1">
                <label className="text-sm font-medium">Order</label>
                <input
                  type="number"
                  value={form.order_index}
                  onChange={(e) =>
                    setForm({ ...form, order_index: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            {/* Featured toggle */}
            <label className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                className="w-4 h-4 text-amber-600 rounded"
              />
              <Star className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium">Featured video (will be shown first)</span>
            </label>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                disabled={loading || !previewId}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition font-medium"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    {editingId ? 'Update' : 'Save Video'}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ═══════ Filters ═══════ */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            />
          </div>
          <SelectField
            value={filterClass}
            onChange={setFilterClass}
            placeholder="All Classes"
            options={uniqueClasses.map((c) => ({ value: String(c), label: `Class ${c}` }))}
          />
          <SelectField
            value={filterType}
            onChange={setFilterType}
            placeholder="All Types"
            options={VIDEO_TYPES.map((t) => ({ value: t.value, label: t.label }))}
          />
          <SelectField
            value={filterLang}
            onChange={setFilterLang}
            placeholder="All Languages"
            options={[
              { value: 'hi', label: 'हिंदी' },
              { value: 'en', label: 'English' },
            ]}
          />
        </div>
      </div>

      {/* ═══════ Video Grid ═══════ */}
      {fetching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white/60 dark:bg-gray-800/60 rounded-2xl h-64" />
          ))}
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="text-center py-16 bg-white/60 dark:bg-gray-800/60 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
          <Video className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-1">
            {videos.length === 0 ? 'No videos yet' : 'No videos match filters'}
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            {videos.length === 0
              ? 'Add your first video to get started'
              : 'Try clearing filters'}
          </p>
          {videos.length === 0 && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
            >
              <PlusCircle className="w-4 h-4" /> Add Video
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500">
            Showing {filteredVideos.length} of {videos.length} videos
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVideos.map((v) => {
              const typeMeta = VIDEO_TYPES.find((t) => t.value === v.video_type) || VIDEO_TYPES[0]
              const TypeIcon = typeMeta.icon

              return (
                <div
                  key={v.id}
                  className="group bg-white/70 dark:bg-gray-800/70 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gray-900 overflow-hidden">
                    <img
                      src={v.thumbnail_url || getYouTubeThumbnail(v.youtube_id, 'hq')}
                      alt={v.title}
                      width={640}
                      height={360}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      decoding="async"
                    />
                    {v.is_featured && (
                      <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" /> Featured
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 flex gap-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${typeMeta.color}`}>
                        <TypeIcon className="w-3 h-3" /> {typeMeta.label}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-black/60 text-white text-xs font-semibold uppercase">
                        {v.language}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 space-y-2">
                    <p className="text-xs text-gray-500 font-medium">
                      Class {v.ncert?.class} • {v.ncert?.subject} • Ch {v.ncert?.chapter_num}
                    </p>
                    <h3 className="font-semibold text-sm leading-tight line-clamp-2">
                      {v.title}
                    </h3>
                    {v.description && (
                      <p className="text-xs text-gray-500 line-clamp-2">{v.description}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="px-4 pb-4 flex items-center gap-1">
                    <a
                      href={getYouTubeWatchUrl(v.youtube_id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-600 transition"
                      title="Watch on YouTube"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => toggleFeatured(v)}
                      className={`p-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/30 transition ${
                        v.is_featured ? 'text-amber-600' : 'text-gray-400'
                      }`}
                      title={v.is_featured ? 'Unfeature' : 'Feature'}
                    >
                      {v.is_featured ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleEdit(v)}
                      className="p-2 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-950/30 text-yellow-600 transition"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="ml-auto p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    indigo: 'from-indigo-500 to-purple-500',
    red: 'from-red-500 to-pink-500',
    purple: 'from-purple-500 to-fuchsia-500',
    amber: 'from-amber-500 to-orange-500',
  }
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 p-4">
      <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${colors[color]}`} />
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  )
}

function SelectField({
  label, value, onChange, options, placeholder, disabled,
}: {
  label?: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  disabled?: boolean
}) {
  return (
    <div className="space-y-1">
      {label && <label className="text-sm font-medium">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50 text-sm"
      >
        <option value="">{placeholder || `Select ${label || 'option'}`}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}