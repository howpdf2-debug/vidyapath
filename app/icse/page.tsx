// app/icse/page.tsx
export const dynamic = 'force-static';

import React from 'react';
import Link from 'next/link';
import { ExternalLink, FileText, BookOpen, Calendar, TrendingUp, ChevronRight, GraduationCap } from 'lucide-react';

// ============================================
// ICSE & ISC STUDY HUB
// ============================================

export default function ICSEPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-purple-600">Home</Link>
        <span>›</span>
        <span className="text-purple-600 font-medium">ICSE / ISC</span>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-r from-purple-800 to-purple-600 text-white rounded-2xl p-6 mb-8">
        <h1 className="text-2xl font-bold">ICSE & ISC Solutions & Papers</h1>
        <p className="text-purple-100 mt-1">Selina, Frank, ML Aggarwal — Class 9, 10 ICSE aur Class 11, 12 ISC complete solutions and papers.</p>
      </div>

      {/* Two column layout */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN – ICSE Class 10 */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b">
            <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">🔷 ICSE Class 10 – Most Searched Resources</h2>
          </div>

          {/* Most Popular Publisher Solutions */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 border-b">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-green-700" />
                Most Popular Publisher Solutions
              </h3>
            </div>
            <ul className="divide-y text-sm">
              <li className="flex justify-between items-center px-4 py-3 hover:bg-gray-50 transition">
                <span><span className="font-medium text-gray-800">Selina Concise –</span> Mathematics, Physics, Chemistry, Biology (Class 9 & 10)</span>
                <a href="https://www.selfstudys.com/books/selina/icse" target="_blank" rel="nofollow noopener noreferrer" className="text-purple-600 text-xs flex items-center gap-1">Solutions <ExternalLink size={12} /></a>
              </li>
              <li className="flex justify-between items-center px-4 py-3 hover:bg-gray-50 transition">
                <span><span className="font-medium text-gray-800">Frank Solutions –</span> Mathematics, Physics, Chemistry, Biology</span>
                <a href="https://www.frankedu.com/" target="_blank" rel="nofollow noopener noreferrer" className="text-purple-600 text-xs flex items-center gap-1">Solutions <ExternalLink size={12} /></a>
              </li>
              <li className="flex justify-between items-center px-4 py-3 hover:bg-gray-50 transition">
                <span><span className="font-medium text-gray-800">ML Aggarwal –</span> Understanding Mathematics (Class 8, 9 & 10)</span>
                <a href="https://www.selfstudys.com/books/ml-aggarwal/icse" target="_blank" rel="nofollow noopener noreferrer" className="text-purple-600 text-xs flex items-center gap-1">Solutions <ExternalLink size={12} /></a>
              </li>
              <li className="flex justify-between items-center px-4 py-3 hover:bg-gray-50 transition">
                <span><span className="font-medium text-gray-800">Goyal Brothers –</span> ALL in One Question Banks & Revision Notes</span>
                <a href="https://www.goyal-books.com/" target="_blank" rel="nofollow noopener noreferrer" className="text-purple-600 text-xs flex items-center gap-1">Visit <ExternalLink size={12} /></a>
              </li>
            </ul>
          </div>

          {/* Most Downloaded PYQs & Sample Papers */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-700" />
                Most Downloaded PYQs & Sample Papers (2026)
              </h3>
            </div>
            <ul className="divide-y text-sm">
              <li className="flex justify-between items-center px-4 py-3 hover:bg-gray-50 transition">
                <span>Official CISCE Specimen Papers 2026 (All Subjects)</span>
                <a href="https://cisce.org/exam-material/" target="_blank" rel="nofollow noopener noreferrer" className="text-purple-600 text-xs flex items-center gap-1">Download PDF <ExternalLink size={12} /></a>
              </li>
              <li className="flex justify-between items-center px-4 py-3 hover:bg-gray-50 transition">
                <span>Previous 10 Years Solved Papers (2015–2025)</span>
                <a href="https://www.selfstudys.com/books/icse/10th/previous-year-paper" target="_blank" rel="nofollow noopener noreferrer" className="text-purple-600 text-xs flex items-center gap-1">Get PDFs <ExternalLink size={12} /></a>
              </li>
              <li className="flex justify-between items-center px-4 py-3 hover:bg-gray-50 transition">
                <span>ICSE 2026 Exam Date Sheet (Provisional)</span>
                <a href="https://cisce.org/icse-exam-timetable" target="_blank" rel="nofollow noopener noreferrer" className="text-purple-600 text-xs flex items-center gap-1">Check <ExternalLink size={12} /></a>
              </li>
            </ul>
          </div>

          {/* High-weightage Topics (Class 10) */}
          <div className="bg-white rounded-xl border shadow-sm p-5 space-y-3">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              High-weightage Topics (Class 10) – based on PYQ analysis
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <li>✧ Ratio & Proportion / Section & Mid‑Point Formula</li>
              <li>✧ Circles & Tangents / Height & Distance</li>
              <li>✧ Quadratic Equations / Matrices / AP & GP</li>
              <li>✧ Mensuration (Surface Area & Volume)</li>
              <li>✧ Graphical Representation of Data (Histogram, Ogive)</li>
              <li>✧ Electricity & Magnetism (Physics)</li>
              <li>✧ Life Processes / Chemical Reactions & Equations</li>
              <li>✧ Map Work & Topography (Geography)</li>
            </ul>
          </div>
        </div>

        {/* RIGHT COLUMN – ISC Class 12 */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b">
            <div className="w-1 h-6 bg-amber-600 rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">🎓 ISC Class 12 – High Demand Content</h2>
          </div>

          {/* Unit-wise Weightage */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 px-4 py-3 border-b">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-amber-700" />
                Unit‑wise Weightage (2026 Exams)
              </h3>
            </div>
            <ul className="divide-y text-sm">
              <li className="flex justify-between items-center px-4 py-3"><span className="font-medium">Mathematics</span><span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full text-xs">Calculus 32 marks</span></li>
              <li className="flex justify-between items-center px-4 py-3"><span className="font-medium">Physics</span><span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full text-xs">Optics 18 marks</span></li>
              <li className="flex justify-between items-center px-4 py-3"><span className="font-medium">Chemistry</span><span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full text-xs">Coordination Compounds, Electrochemistry, Organic</span></li>
              <li className="flex justify-between items-center px-4 py-3"><span className="font-medium">Computer Science</span><span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full text-xs">Boolean Algebra, Data Structures, OOP</span></li>
              <li className="flex justify-between items-center px-4 py-3"><span className="font-medium">History & Civics</span><span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full text-xs">Independence & Partition, Cold War, Indian Democracy</span></li>
            </ul>
            <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500 border-t">
              📌 <span className="font-medium">Pro Tip:</span> Focus on Calculus, Optics, Organic Chemistry and Data Structures – these topics carry the highest weightage in the board exams.
            </div>
          </div>

          {/* Most Recommended Reference Books */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-3 border-b">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-700" />
                Most Recommended Reference Books
              </h3>
            </div>
            <ul className="divide-y text-sm">
              <li className="flex justify-between items-center px-4 py-3"><span>Mathematics – ML Aggarwal, OP Malhotra</span><span className="text-gray-400 text-xs">S. Chand</span></li>
              <li className="flex justify-between items-center px-4 py-3"><span>Physics – Pradeep’s / Simplified Physics (S.L. Arora)</span><span className="text-gray-400 text-xs">Modern Publishers</span></li>
              <li className="flex justify-between items-center px-4 py-3"><span>Chemistry – Modern’s ABC of Chemistry, Concise Inorganic</span><span className="text-gray-400 text-xs">V.K. Jaiswal</span></li>
              <li className="flex justify-between items-center px-4 py-3"><span>Computer Science – APC Text Book (Sumita Arora)</span><span className="text-gray-400 text-xs">APC Books</span></li>
            </ul>
          </div>

          {/* Free Resources & PYQs */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-teal-50 to-green-50 px-4 py-3 border-b">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-700" />
                Free Resources & PYQs (ISC Class 12)
              </h3>
            </div>
            <ul className="divide-y text-sm">
              <li className="flex justify-between items-center px-4 py-3"><span>Last 10 Years Solved Papers (Subject‑wise)</span><a href="https://cisce.org/isc-exam-material" target="_blank" rel="nofollow noopener noreferrer" className="text-purple-600 text-xs flex items-center gap-1">Download <ExternalLink size={12} /></a></li>
              <li className="flex justify-between items-center px-4 py-3"><span>Specimen Papers 2026 (Official CISCE)</span><a href="https://cisce.org/isc-specimen-papers" target="_blank" rel="nofollow noopener noreferrer" className="text-purple-600 text-xs flex items-center gap-1">Download <ExternalLink size={12} /></a></li>
              <li className="flex justify-between items-center px-4 py-3"><span>ISC 2026 Exam Date Sheet (Provisional)</span><a href="https://cisce.org/isc-exam-timetable" target="_blank" rel="nofollow noopener noreferrer" className="text-purple-600 text-xs flex items-center gap-1">Check <ExternalLink size={12} /></a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Future Expansion Note */}
      <div className="mt-12 bg-amber-50 border-l-4 border-amber-500 p-3 text-sm rounded">
        🚀 <strong>Future Expansion:</strong> We are working on adding complete solutions & important questions for each subject, organised by chapter. Check back soon for subject-wise detailed guides.
      </div>
    </div>
  );
}