'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { AdminHeader } from '@/components/AdminHeader'
import { ArrowLeft } from 'lucide-react'
import 'react-quill-new/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

type Tab = 'exams' | 'subjects' | 'topics' | 'notes' | 'questions'

export default function AdminCompetitiveExams() {
  const [activeTab, setActiveTab] = useState<Tab>('exams')
  const [loading, setLoading] = useState(false)
  const [exams, setExams] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [topics, setTopics] = useState<any[]>([])
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null)
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null)
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)

  const [examForm, setExamForm] = useState({ name: '', slug: '', icon: '', description: '' })
  const [subjectForm, setSubjectForm] = useState({ name: '', slug: '', description: '' })
  const [topicForm, setTopicForm] = useState({ name: '', slug: '', description: '' })
  const [notesForm, setNotesForm] = useState({ content_html: '' })
  const [questionForm, setQuestionForm] = useState({
    question: '',
    options: { A: '', B: '', C: '', D: '' },
    correct_answer: '',
    explanation: '',
    difficulty: 'medium'
  })

  useEffect(() => { fetchExams() }, [])

  const fetchExams = async () => {
    const { data, error } = await supabase.from('competitive_exams').select('*').order('name')
    if (error) toast.error('Error fetching exams')
    else setExams(data || [])
  }

  const fetchSubjects = async (examId: number) => {
    const { data, error } = await supabase.from('exam_subjects').select('*').eq('exam_id', examId).order('name')
    if (error) toast.error('Error fetching subjects')
    else setSubjects(data || [])
  }

  const fetchTopics = async (subjectId: number) => {
    const { data, error } = await supabase.from('exam_topics').select('*').eq('subject_id', subjectId).order('name')
    if (error) toast.error('Error fetching topics')
    else setTopics(data || [])
  }

  const handleSelectExam = (examId: number) => {
    setSelectedExamId(examId)
    fetchSubjects(examId)
    setSelectedSubjectId(null)
    setSelectedTopicId(null)
    setTopics([])
  }

  const handleSelectSubject = (subjectId: number) => {
    setSelectedSubjectId(subjectId)
    fetchTopics(subjectId)
    setSelectedTopicId(null)
  }

  // ---------- Exam CRUD ----------
  const handleExamSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    let query
    if (editingId) {
      query = supabase.from('competitive_exams').update(examForm).eq('id', editingId)
    } else {
      query = supabase.from('competitive_exams').insert([examForm])
    }
    const { error } = await query
    if (error) toast.error(error.message)
    else {
      toast.success(editingId ? 'Exam updated!' : 'Exam added!')
      setExamForm({ name: '', slug: '', icon: '', description: '' })
      setEditingId(null)
      fetchExams()
    }
    setLoading(false)
  }

  const deleteExam = async (id: number) => {
    if (!confirm('Delete this exam and all its data?')) return
    const { error } = await supabase.from('competitive_exams').delete().eq('id', id)
    if (error) toast.error(error.message)
    else {
      toast.success('Exam deleted')
      if (selectedExamId === id) { setSelectedExamId(null); setSubjects([]) }
      fetchExams()
    }
  }

  // ---------- Subject CRUD ----------
  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedExamId) return toast.error('Select an exam first')
    setLoading(true)
    let query
    if (editingId) {
      query = supabase.from('exam_subjects').update(subjectForm).eq('id', editingId)
    } else {
      query = supabase.from('exam_subjects').insert([{ ...subjectForm, exam_id: selectedExamId }])
    }
    const { error } = await query
    if (error) toast.error(error.message)
    else {
      toast.success(editingId ? 'Subject updated!' : 'Subject added!')
      setSubjectForm({ name: '', slug: '', description: '' })
      setEditingId(null)
      fetchSubjects(selectedExamId)
    }
    setLoading(false)
  }

  const deleteSubject = async (id: number) => {
    if (!confirm('Delete this subject?')) return
    const { error } = await supabase.from('exam_subjects').delete().eq('id', id)
    if (error) toast.error(error.message)
    else {
      toast.success('Subject deleted')
      if (selectedSubjectId === id) setSelectedSubjectId(null)
      fetchSubjects(selectedExamId!)
    }
  }

  // ---------- Topic CRUD ----------
  const handleTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSubjectId) return toast.error('Select a subject first')
    setLoading(true)
    let query
    if (editingId) {
      query = supabase.from('exam_topics').update(topicForm).eq('id', editingId)
    } else {
      query = supabase.from('exam_topics').insert([{ ...topicForm, subject_id: selectedSubjectId }])
    }
    const { error } = await query
    if (error) toast.error(error.message)
    else {
      toast.success(editingId ? 'Topic updated!' : 'Topic added!')
      setTopicForm({ name: '', slug: '', description: '' })
      setEditingId(null)
      fetchTopics(selectedSubjectId)
    }
    setLoading(false)
  }

  const deleteTopic = async (id: number) => {
    if (!confirm('Delete this topic?')) return
    const { error } = await supabase.from('exam_topics').delete().eq('id', id)
    if (error) toast.error(error.message)
    else {
      toast.success('Topic deleted')
      if (selectedTopicId === id) setSelectedTopicId(null)
      fetchTopics(selectedSubjectId!)
    }
  }

  // ---------- Notes CRUD ----------
  const handleNotesSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTopicId) return toast.error('Select a topic first')
    setLoading(true)
    let query
    if (editingId) {
      query = supabase.from('exam_notes').update({ content_html: notesForm.content_html }).eq('id', editingId)
    } else {
      query = supabase.from('exam_notes').insert([{ topic_id: selectedTopicId, content_html: notesForm.content_html }])
    }
    const { error } = await query
    if (error) toast.error(error.message)
    else {
      toast.success(editingId ? 'Notes updated!' : 'Notes added!')
      setNotesForm({ content_html: '' })
      setEditingId(null)
    }
    setLoading(false)
  }

  const editNotes = async (topicId: number) => {
    const { data, error } = await supabase.from('exam_notes').select('id, content_html').eq('topic_id', topicId).maybeSingle()
    if (error) toast.error('Error loading notes')
    else if (data) {
      setNotesForm({ content_html: data.content_html })
      setEditingId(data.id)
    } else {
      toast('No notes yet – create new ones')
    }
  }

  // ---------- Question CRUD ----------
  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTopicId) return toast.error('Select a topic first')
    setLoading(true)
    const payload = {
      topic_id: selectedTopicId,
      question: questionForm.question,
      options: questionForm.options,
      correct_answer: questionForm.correct_answer,
      explanation: questionForm.explanation,
      difficulty: questionForm.difficulty
    }
    let query
    if (editingId) {
      query = supabase.from('exam_questions').update(payload).eq('id', editingId)
    } else {
      query = supabase.from('exam_questions').insert([payload])
    }
    const { error } = await query
    if (error) toast.error(error.message)
    else {
      toast.success(editingId ? 'Question updated!' : 'Question added!')
      setQuestionForm({ question: '', options: { A: '', B: '', C: '', D: '' }, correct_answer: '', explanation: '', difficulty: 'medium' })
      setEditingId(null)
    }
    setLoading(false)
  }

  const deleteQuestion = async (id: number) => {
    if (!confirm('Delete this question?')) return
    const { error } = await supabase.from('exam_questions').delete().eq('id', id)
    if (error) toast.error(error.message)
    else toast.success('Question deleted')
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Back to Dashboard */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <AdminHeader title="📚 Manage Competitive Exams" />

      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
        {['exams', 'subjects', 'topics', 'notes', 'questions'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as Tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Exams Tab */}
      {activeTab === 'exams' && (
        <div className="space-y-6">
          <form onSubmit={handleExamSubmit} className="space-y-4 p-4 bg-white/60 dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Name (e.g., SSC)" value={examForm.name} onChange={(e) => setExamForm({ ...examForm, name: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700" required />
              <input type="text" placeholder="Slug (e.g., ssc)" value={examForm.slug} onChange={(e) => setExamForm({ ...examForm, slug: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700" required />
              <input type="text" placeholder="Icon (e.g., 📘)" value={examForm.icon} onChange={(e) => setExamForm({ ...examForm, icon: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700" />
              <input type="text" placeholder="Description" value={examForm.description} onChange={(e) => setExamForm({ ...examForm, description: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={loading} className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50">
                {editingId ? 'Update Exam' : 'Add Exam'}
              </button>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setExamForm({ name: '', slug: '', icon: '', description: '' }) }} className="px-6 py-2 bg-gray-400 text-white rounded-xl hover:bg-gray-500">
                  Cancel
                </button>
              )}
            </div>
          </form>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {exams.map((exam) => (
              <div key={exam.id} className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="text-2xl">{exam.icon}</div>
                <h3 className="text-lg font-bold">{exam.name}</h3>
                <p className="text-sm text-gray-500">{exam.slug}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <button onClick={() => handleSelectExam(exam.id)} className="text-sm text-indigo-600 hover:underline">Select</button>
                  <button onClick={() => { setExamForm({ name: exam.name, slug: exam.slug, icon: exam.icon || '', description: exam.description || '' }); setEditingId(exam.id) }} className="text-sm text-yellow-600 hover:underline">Edit</button>
                  <button onClick={() => deleteExam(exam.id)} className="text-sm text-red-600 hover:underline">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subjects Tab */}
      {activeTab === 'subjects' && (
        <div className="space-y-6">
          {!selectedExamId ? (
            <p className="text-gray-500">Please select an exam first (go to Exams tab).</p>
          ) : (
            <>
              <form onSubmit={handleSubjectSubmit} className="space-y-4 p-4 bg-white/60 dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Subject Name (e.g., गणित)" value={subjectForm.name} onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700" required />
                  <input type="text" placeholder="Slug (e.g., maths)" value={subjectForm.slug} onChange={(e) => setSubjectForm({ ...subjectForm, slug: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700" required />
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={loading} className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50">
                    {editingId ? 'Update Subject' : 'Add Subject'}
                  </button>
                  {editingId && (
                    <button type="button" onClick={() => { setEditingId(null); setSubjectForm({ name: '', slug: '', description: '' }) }} className="px-6 py-2 bg-gray-400 text-white rounded-xl hover:bg-gray-500">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subjects.map((sub) => (
                  <div key={sub.id} className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-bold">{sub.name}</h3>
                    <p className="text-sm text-gray-500">{sub.slug}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <button onClick={() => handleSelectSubject(sub.id)} className="text-sm text-indigo-600 hover:underline">Select</button>
                      <button onClick={() => { setSubjectForm({ name: sub.name, slug: sub.slug, description: sub.description || '' }); setEditingId(sub.id) }} className="text-sm text-yellow-600 hover:underline">Edit</button>
                      <button onClick={() => deleteSubject(sub.id)} className="text-sm text-red-600 hover:underline">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Topics Tab */}
      {activeTab === 'topics' && (
        <div className="space-y-6">
          {!selectedSubjectId ? (
            <p className="text-gray-500">Please select a subject first (go to Subjects tab).</p>
          ) : (
            <>
              <form onSubmit={handleTopicSubmit} className="space-y-4 p-4 bg-white/60 dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Topic Name (e.g., बीजगणित)" value={topicForm.name} onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700" required />
                  <input type="text" placeholder="Slug (e.g., algebra)" value={topicForm.slug} onChange={(e) => setTopicForm({ ...topicForm, slug: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700" required />
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={loading} className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50">
                    {editingId ? 'Update Topic' : 'Add Topic'}
                  </button>
                  {editingId && (
                    <button type="button" onClick={() => { setEditingId(null); setTopicForm({ name: '', slug: '', description: '' }) }} className="px-6 py-2 bg-gray-400 text-white rounded-xl hover:bg-gray-500">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topics.map((topic) => (
                  <div key={topic.id} className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-bold">{topic.name}</h3>
                    <p className="text-sm text-gray-500">{topic.slug}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <button onClick={() => setSelectedTopicId(topic.id)} className="text-sm text-indigo-600 hover:underline">Select</button>
                      <button onClick={() => { setTopicForm({ name: topic.name, slug: topic.slug, description: topic.description || '' }); setEditingId(topic.id) }} className="text-sm text-yellow-600 hover:underline">Edit</button>
                      <button onClick={() => deleteTopic(topic.id)} className="text-sm text-red-600 hover:underline">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Notes Tab */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          {!selectedTopicId ? (
            <p className="text-gray-500">Please select a topic first (go to Topics tab).</p>
          ) : (
            <form onSubmit={handleNotesSubmit} className="space-y-4 p-4 bg-white/60 dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700">
              <ReactQuill
                theme="snow"
                value={notesForm.content_html}
                onChange={(content) => setNotesForm({ content_html: content })}
                placeholder="Write notes in Hindi/English... (HTML supported)"
                className="h-64"
              />
              <div className="flex gap-2 mt-12">
                <button type="submit" disabled={loading} className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50">
                  {editingId ? 'Update Notes' : 'Save Notes'}
                </button>
                {editingId && (
                  <button type="button" onClick={() => { setEditingId(null); setNotesForm({ content_html: '' }) }} className="px-6 py-2 bg-gray-400 text-white rounded-xl hover:bg-gray-500">
                    Cancel
                  </button>
                )}
                <button type="button" onClick={() => editNotes(selectedTopicId)} className="px-6 py-2 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700">
                  Load Existing Notes
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Questions Tab */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          {!selectedTopicId ? (
            <p className="text-gray-500">Please select a topic first (go to Topics tab).</p>
          ) : (
            <form onSubmit={handleQuestionSubmit} className="space-y-4 p-4 bg-white/60 dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700">
              <input type="text" placeholder="Question" value={questionForm.question} onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700" required />
              <div className="grid grid-cols-2 gap-4">
                {['A', 'B', 'C', 'D'].map((letter) => (
                  <input
                    key={letter}
                    type="text"
                    placeholder={`Option ${letter}`}
                    value={questionForm.options[letter as keyof typeof questionForm.options] || ''}
                    onChange={(e) => setQuestionForm({ ...questionForm, options: { ...questionForm.options, [letter]: e.target.value } })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700"
                    required
                  />
                ))}
              </div>
              <input type="text" placeholder="Correct Answer (A, B, C, or D)" value={questionForm.correct_answer} onChange={(e) => setQuestionForm({ ...questionForm, correct_answer: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700" required />
              <input type="text" placeholder="Explanation (optional)" value={questionForm.explanation} onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700" />
              <select value={questionForm.difficulty} onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <div className="flex gap-2">
                <button type="submit" disabled={loading} className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50">
                  {editingId ? 'Update Question' : 'Add Question'}
                </button>
                {editingId && (
                  <button type="button" onClick={() => { setEditingId(null); setQuestionForm({ question: '', options: { A: '', B: '', C: '', D: '' }, correct_answer: '', explanation: '', difficulty: 'medium' }) }} className="px-6 py-2 bg-gray-400 text-white rounded-xl hover:bg-gray-500">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}