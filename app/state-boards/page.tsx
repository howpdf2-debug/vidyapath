'use client'
import Link from 'next/link'
import { ExternalLink, FileText, BookOpen } from 'lucide-react'

// Static data for state boards – you can later move to Supabase
const stateBoards = [
  {
    id: 'up-board',
    name: 'UP Board (UPMSP)',
    fullName: 'Uttar Pradesh Madhyamik Shiksha Parishad',
    description: 'Class 9–12. Hindi Medium priority. Papers, model papers, solutions.',
    officialUrl: 'https://upmsp.edu.in/',
    modelPaperUrl: 'https://upmsp.edu.in/ModelPaper.aspx',
    icon: '🟠',
    badge: '🔥 Most Popular',
    badgeColor: 'bg-red-100 text-red-700',
    color: 'border-orange-500',
    bgGradient: 'from-orange-50 to-orange-100',
  },
  {
    id: 'bihar-board',
    name: 'Bihar Board (BSEB)',
    fullName: 'Bihar School Examination Board',
    description: 'Matric + Intermediate. Result LIVE. Hindi Medium.',
    officialUrl: 'https://biharboardonline.bihar.gov.in/',
    modelPaperUrl: 'https://biharboardonline.bihar.gov.in/',
    icon: '🟡',
    badge: '🔴 LIVE Result',
    badgeColor: 'bg-red-100 text-red-700 animate-pulse',
    color: 'border-amber-500',
    bgGradient: 'from-amber-50 to-amber-100',
  },
  {
    id: 'rajasthan-board',
    name: 'Rajasthan Board (RBSE)',
    fullName: 'Board of Secondary Education, Rajasthan',
    description: 'Class 10 & 12. Hindi + English. Model papers.',
    officialUrl: 'https://rajeduboard.rajasthan.gov.in/',
    modelPaperUrl: '#',
    icon: '🔵',
    badge: 'Available',
    badgeColor: 'bg-green-100 text-green-700',
    color: 'border-blue-500',
    bgGradient: 'from-blue-50 to-blue-100',
  },
  {
    id: 'mp-board',
    name: 'MP Board (MPBSE)',
    fullName: 'Madhya Pradesh Board of Secondary Education',
    description: 'Class 10 & 12. Papers aur notes.',
    officialUrl: 'https://mpbse.mponline.gov.in/',
    modelPaperUrl: '#',
    icon: '🟢',
    badge: 'Available',
    badgeColor: 'bg-green-100 text-green-700',
    color: 'border-green-500',
    bgGradient: 'from-green-50 to-green-100',
  },
  {
    id: 'maharashtra-board',
    name: 'Maharashtra Board (MSBSHSE)',
    fullName: 'Maharashtra State Board of Secondary & Higher Secondary Education',
    description: 'SSC (10th) & HSC (12th) — English + Marathi.',
    officialUrl: 'https://mahahsscboard.in/',
    modelPaperUrl: '#',
    icon: '🟣',
    badge: 'Available',
    badgeColor: 'bg-green-100 text-green-700',
    color: 'border-purple-500',
    bgGradient: 'from-purple-50 to-purple-100',
  },
  {
    id: 'haryana-board',
    name: 'Haryana Board (HBSE)',
    fullName: 'Board of School Education Haryana',
    description: 'Class 10 & 12. Papers aur notes.',
    officialUrl: 'https://bseh.org.in/',
    modelPaperUrl: '#',
    icon: '🔴',
    badge: 'Available',
    badgeColor: 'bg-green-100 text-green-700',
    color: 'border-red-500',
    bgGradient: 'from-red-50 to-red-100',
  },
  {
    id: 'punjab-board',
    name: 'Punjab Board (PSEB)',
    fullName: 'Punjab School Education Board',
    description: 'Class 10 & 12. English + Punjabi medium.',
    officialUrl: 'https://pseb.ac.in/',
    modelPaperUrl: '#',
    icon: '⚪',
    badge: 'Coming Soon',
    badgeColor: 'bg-gray-100 text-gray-700',
    color: 'border-gray-400',
    bgGradient: 'from-gray-50 to-gray-100',
  },
  {
    id: 'tn-board',
    name: 'TN Board (Samacheer)',
    fullName: 'Tamil Nadu Board of Secondary Education',
    description: 'Class 9–12. English + Tamil. Samacheer books.',
    officialUrl: 'https://tn.gov.in/schooleducation',
    modelPaperUrl: '#',
    icon: '🟤',
    badge: 'Phase 3',
    badgeColor: 'bg-yellow-100 text-yellow-800',
    color: 'border-amber-600',
    bgGradient: 'from-amber-50 to-amber-100',
  },
]

// For future notes, you can create a table `state_board_notes` similar to `chapter_notes`
// with columns: board_id, class, subject, chapter_num, content_html, etc.

export default function StateBoardsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-purple-600">Home</Link>
        <span>›</span>
        <span className="text-purple-600 font-medium">State Boards</span>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-r from-amber-800 to-amber-600 text-white rounded-2xl p-6 mb-8">
        <h1 className="text-2xl font-bold">Apna State Board Chunein</h1>
        <p className="text-amber-100 mt-1">UP Board, Bihar Board, Rajasthan, MP, Maharashtra — papers, notes Hindi mein free.</p>
      </div>

      {/* Alert */}
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 mb-6 text-sm rounded">
        🎯 <strong>UP Board aur Bihar Board students ke liye special Hindi content!</strong> Model papers, previous year papers, aur notes — seedha Hindi mein.
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {stateBoards.map(board => (
          <div
            key={board.id}
            className={`bg-white rounded-xl border-l-4 ${board.color} shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden`}
          >
            <div className={`bg-gradient-to-br ${board.bgGradient} p-4`}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-4xl">{board.icon}</div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${board.badgeColor}`}>
                  {board.badge}
                </span>
              </div>
              <h3 className="font-bold text-lg">{board.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{board.description}</p>
              <p className="text-xs text-gray-400 mt-1 italic">{board.fullName}</p>
            </div>
            <div className="p-4 flex flex-wrap gap-3 border-t">
              <a
                href={board.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-purple-600 text-sm border border-purple-200 px-3 py-1 rounded-full hover:bg-purple-50 transition"
              >
                Official Site <ExternalLink size={12} />
              </a>
              <a
                href={board.modelPaperUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-gray-600 text-sm border border-gray-200 px-3 py-1 rounded-full hover:bg-gray-50 transition"
              >
                Model Papers <FileText size={12} />
              </a>
              {/* Future: Link to board-specific notes page */}
              <Link
                href={`/state-boards/${board.id}`}
                className="inline-flex items-center gap-1 text-blue-600 text-sm border border-blue-200 px-3 py-1 rounded-full hover:bg-blue-50 transition"
              >
                Study Material <BookOpen size={12} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Direct Downloads Section (UP & Bihar) – similar to prototype */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-purple-600 rounded-full"></span>
          UP Board — Direct Downloads
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition">
            <div className="text-2xl mb-2">📄</div>
            <div className="font-bold text-sm">UP Board Class 12 Model Paper 2025-26</div>
            <div className="text-xs text-gray-500 mt-1">Sabhi subjects — Hindi, Physics, Maths, Chem, Bio</div>
            <a href="https://upmsp.edu.in/ModelPaper.aspx" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-purple-600 text-sm">Download →</a>
          </div>
          <div className="bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition">
            <div className="text-2xl mb-2">📄</div>
            <div className="font-bold text-sm">UP Board Class 10 Model Paper 2025-26</div>
            <div className="text-xs text-gray-500 mt-1">Hindi, Maths, Science, Social Science, Sanskrit</div>
            <a href="https://upmsp.edu.in/ModelPaper.aspx" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-purple-600 text-sm">Download →</a>
          </div>
          <div className="bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition">
            <div className="text-2xl mb-2">📋</div>
            <div className="font-bold text-sm">Bihar Board Model Paper 2025-26</div>
            <div className="text-xs text-gray-500 mt-1">Matric + Inter — sabhi subjects Hindi medium</div>
            <a href="https://biharboardonline.bihar.gov.in/" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-purple-600 text-sm">Download →</a>
          </div>
        </div>
      </div>

      {/* Future Note: You can create a table `state_board_notes` with columns:
          id, board_id, class, subject, chapter_num, content_html, created_at
          Then create dynamic routes `/state-boards/[boardId]/[class]/[subject]/[chapter]` similar to NCERT.
      */}
    </div>
  )
}