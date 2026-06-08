'use client'
import { useState } from 'react'
import Link from 'next/link'

// ============================================
// COMPLETE DATA FOR CLASSES 7–12 (ALL CATEGORIES)
// ============================================
const papersData = {
  // Class 12
  '12': {
    previous: [
      { subject: 'All Subjects', year: '2015-2025', sets: 'Multiple', marking: '✅', medium: 'English/Hindi', pdf: 'https://infinitylearn.com/cbse-board/class-12-previous-year-question-papers', isExternal: true },
    ],
    sample: [
      { subject: 'All Subjects', year: '2025–26', sets: 'Set 1,2', marking: '✅', medium: 'English/Hindi', pdf: 'https://cbseacademic.nic.in/SQP_CLASSXII_2025-26.html', isExternal: false },
    ],
    syllabus: [
      { subject: 'All Subjects', year: '2025–26', sets: '', marking: '', medium: 'English', pdf: 'https://cbseacademic.nic.in/curriculum_2026.html', isExternal: false },
    ],
    revisionNotes: [
      { subject: 'Physics, Chemistry, Maths, Bio, English', year: '2025–26', sets: '', marking: '', medium: 'English', pdf: 'https://infinitylearn.com/cbse-board/class-12-notes', isExternal: true },
    ],
    markingScheme: [
      { subject: 'All Subjects', year: '2025–26', sets: '', marking: '✅', medium: 'English/Hindi', pdf: 'https://cbseacademic.nic.in/SQP_CLASSXII_2025-26.html', isExternal: false },
    ],
    caseStudy: [
      { subject: 'Physics, Chemistry, Maths, Bio', year: '2025–26', sets: '', marking: '', medium: 'English', pdf: 'https://oswalpublishers.com/cbse/competency-focused-practice-questions-class-12/physics/', isExternal: true },
    ],
    assertionReason: [
      { subject: 'Physics, Chemistry, Maths, Bio', year: '2025–26', sets: '', marking: '', medium: 'English', pdf: 'https://oswalpublishers.com/cbse/competency-focused-practice-questions-class-12/physics/', isExternal: true },
    ],
  },
  // Class 11 (similar to 12, using appropriate links)
  '11': {
    previous: [
      { subject: 'Physics, Chemistry, Maths, Bio, English', year: '2015-2025', sets: 'Multiple', marking: '✅', medium: 'English/Hindi', pdf: 'https://infinitylearn.com/cbse-board/class-12-previous-year-question-papers', isExternal: true },
    ],
    sample: [
      { subject: 'All Subjects', year: '2025–26', sets: 'Set 1,2', marking: '✅', medium: 'English/Hindi', pdf: 'https://cbseacademic.nic.in/SQP_CLASSXII_2025-26.html', isExternal: false },
    ],
    syllabus: [
      { subject: 'All Subjects', year: '2025–26', sets: '', marking: '', medium: 'English', pdf: 'https://cbseacademic.nic.in/curriculum_2026.html', isExternal: false },
    ],
    revisionNotes: [
      { subject: 'Physics, Chemistry, Maths, Bio, English', year: '2025–26', sets: '', marking: '', medium: 'English', pdf: 'https://infinitylearn.com/cbse-board/class-12-notes', isExternal: true },
    ],
    markingScheme: [
      { subject: 'All Subjects', year: '2025–26', sets: '', marking: '✅', medium: 'English/Hindi', pdf: 'https://cbseacademic.nic.in/SQP_CLASSXII_2025-26.html', isExternal: false },
    ],
    caseStudy: [
      { subject: 'Physics, Chemistry, Maths, Bio', year: '2025–26', sets: '', marking: '', medium: 'English', pdf: 'https://oswalpublishers.com/cbse/competency-focused-practice-questions-class-12/physics/', isExternal: true },
    ],
    assertionReason: [
      { subject: 'Physics, Chemistry, Maths, Bio', year: '2025–26', sets: '', marking: '', medium: 'English', pdf: 'https://oswalpublishers.com/cbse/competency-focused-practice-questions-class-12/physics/', isExternal: true },
    ],
  },
  // Class 10
  '10': {
    previous: [
      { subject: 'All Subjects', year: '2015-2025', sets: 'Multiple', marking: '✅', medium: 'English/Hindi', pdf: 'https://infinitylearn.com/cbse-board/class-10-previous-year-question-papers', isExternal: true },
    ],
    sample: [
      { subject: 'All Subjects', year: '2025–26', sets: 'Set 1,2', marking: '✅', medium: 'English/Hindi', pdf: 'https://cbseacademic.nic.in/SQP_CLASSX_2025-26.html', isExternal: false },
    ],
    syllabus: [
      { subject: 'All Subjects', year: '2025–26', sets: '', marking: '', medium: 'English', pdf: 'https://cbseacademic.nic.in/curriculum_2026.html', isExternal: false },
    ],
    revisionNotes: [
      { subject: 'Science, Maths, Social, English', year: '2025–26', sets: '', marking: '', medium: 'English', pdf: 'https://www.learncbse.in/cbse-class-10-notes/', isExternal: true },
    ],
    markingScheme: [
      { subject: 'All Subjects', year: '2025–26', sets: '', marking: '✅', medium: 'English/Hindi', pdf: 'https://cbseacademic.nic.in/SQP_CLASSX_2025-26.html', isExternal: false },
    ],
    caseStudy: [
      { subject: 'Science, Maths', year: '2025–26', sets: '', marking: '', medium: 'English', pdf: 'https://www.selfstudys.com/update/cbse-10th-science-exam-2025-26-important-case-study-questions-with-answer-free-pdf', isExternal: true },
    ],
    assertionReason: [
      { subject: 'Science, Maths', year: '2025–26', sets: '', marking: '', medium: 'English', pdf: 'https://www.selfstudys.com/update/cbse-10th-science-exam-2025-26-important-assertion-reason-questions-with-answer-free-pdf', isExternal: true },
    ],
  },
  // Class 9
  '9': {
    previous: [
      { subject: 'Science, Maths, Social, English', year: '2015-2025', sets: 'Multiple', marking: '✅', medium: 'English/Hindi', pdf: 'https://infinitylearn.com/cbse-board/class-9-previous-year-question-papers', isExternal: true },
    ],
    sample: [
      { subject: 'All Subjects', year: '2025–26', sets: 'Set 1,2', marking: '✅', medium: 'English/Hindi', pdf: 'https://cbseacademic.nic.in/SQP_CLASSIX_2025-26.html', isExternal: false },
    ],
    syllabus: [
      { subject: 'All Subjects', year: '2025–26', sets: '', marking: '', medium: 'English', pdf: 'https://cbseacademic.nic.in/curriculum_2026.html', isExternal: false },
    ],
    revisionNotes: [
      { subject: 'Science, Maths, Social, English', year: '2025–26', sets: '', marking: '', medium: 'English', pdf: 'https://www.learncbse.in/cbse-class-9-notes/', isExternal: true },
    ],
    markingScheme: [
      { subject: 'All Subjects', year: '2025–26', sets: '', marking: '✅', medium: 'English/Hindi', pdf: 'https://cbseacademic.nic.in/SQP_CLASSIX_2025-26.html', isExternal: false },
    ],
    caseStudy: [
      { subject: 'Science, Maths', year: '2025–26', sets: '', marking: '', medium: 'English', pdf: 'https://oswalpublishers.com/cbse/competency-focused-practice-questions-class-9/science/', isExternal: true },
    ],
    assertionReason: [
      { subject: 'Science, Maths', year: '2025–26', sets: '', marking: '', medium: 'English', pdf: 'https://oswalpublishers.com/cbse/competency-focused-practice-questions-class-9/science/', isExternal: true },
    ],
  },
  // Class 8
  '8': {
    previous: [
      { subject: 'Science, Maths, Social, English', year: '2015-2025', sets: 'Multiple', marking: '✅', medium: 'English/Hindi', pdf: 'https://infinitylearn.com/cbse-board/class-8-previous-year-question-papers', isExternal: true },
    ],
    sample: [
      { subject: 'All Subjects', year: '2025–26', sets: 'Set 1,2', marking: '✅', medium: 'English/Hindi', pdf: 'https://cbseacademic.nic.in/SQP_CLASSVIII_2025-26.html', isExternal: false },
    ],
    syllabus: [
      { subject: 'All Subjects', year: '2025–26', sets: '', marking: '', medium: 'English', pdf: 'https://cbseacademic.nic.in/curriculum_2026.html', isExternal: false },
    ],
    revisionNotes: [
      { subject: 'Science, Maths, Social, English', year: '2025–26', sets: '', marking: '', medium: 'English', pdf: 'https://www.learncbse.in/cbse-class-8-notes/', isExternal: true },
    ],
    markingScheme: [
      { subject: 'All Subjects', year: '2025–26', sets: '', marking: '✅', medium: 'English/Hindi', pdf: 'https://cbseacademic.nic.in/SQP_CLASSVIII_2025-26.html', isExternal: false },
    ],
    caseStudy: [
      { subject: 'Science, Maths', year: '2025–26', sets: '', marking: '', medium: 'English', pdf: 'https://oswalpublishers.com/cbse/competency-focused-practice-questions-class-8/science/', isExternal: true },
    ],
    assertionReason: [
      { subject: 'Science, Maths', year: '2025–26', sets: '', marking: '', medium: 'English', pdf: 'https://oswalpublishers.com/cbse/competency-focused-practice-questions-class-8/science/', isExternal: true },
    ],
  },
  // Class 7
  '7': {
    previous: [
      { subject: 'Science, Maths, Social, English', year: '2015-2025', sets: 'Multiple', marking: '✅', medium: 'English/Hindi', pdf: 'https://infinitylearn.com/cbse-board/class-7-previous-year-question-papers', isExternal: true },
    ],
    sample: [
      { subject: 'All Subjects', year: '2025–26', sets: 'Set 1,2', marking: '✅', medium: 'English/Hindi', pdf: 'https://cbseacademic.nic.in/SQP_CLASSVII_2025-26.html', isExternal: false },
    ],
    syllabus: [
      { subject: 'All Subjects', year: '2025–26', sets: '', marking: '', medium: 'English', pdf: 'https://cbseacademic.nic.in/curriculum_2026.html', isExternal: false },
    ],
    revisionNotes: [
      { subject: 'Science, Maths, Social, English', year: '2025–26', sets: '', marking: '', medium: 'English', pdf: 'https://www.learncbse.in/cbse-class-7-notes/', isExternal: true },
    ],
    markingScheme: [
      { subject: 'All Subjects', year: '2025–26', sets: '', marking: '✅', medium: 'English/Hindi', pdf: 'https://cbseacademic.nic.in/SQP_CLASSVII_2025-26.html', isExternal: false },
    ],
    caseStudy: [
      { subject: 'Science, Maths', year: '2025–26', sets: '', marking: '', medium: 'English', pdf: 'https://oswalpublishers.com/cbse/competency-focused-practice-questions-class-7/science/', isExternal: true },
    ],
    assertionReason: [
      { subject: 'Science, Maths', year: '2025–26', sets: '', marking: '', medium: 'English', pdf: 'https://oswalpublishers.com/cbse/competency-focused-practice-questions-class-7/science/', isExternal: true },
    ],
  },
}

export default function CBSEPage() {
  const [selectedClass, setSelectedClass] = useState('12')
  const [paperType, setPaperType] = useState('previous')
  const currentData = papersData[selectedClass]?.[paperType] || []

  // Helper to render PDF link with nofollow for external links
  const renderLink = (item: any) => {
    const linkProps: any = {
      href: item.pdf,
      target: '_blank',
      rel: 'noopener noreferrer',
    }
    if (item.isExternal) {
      linkProps.rel = 'nofollow noopener noreferrer'
    }
    return (
      <a {...linkProps} className="text-purple-600 hover:underline">
        📄 PDF
      </a>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-purple-600">Home</Link>
        <span>›</span>
        <span className="text-purple-600 font-medium">CBSE</span>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white rounded-2xl p-6 mb-8">
        <h1 className="text-2xl font-bold">CBSE Papers & Syllabus</h1>
        <p className="text-blue-100 mt-1">Previous year papers, sample papers, syllabus, revision notes, marking scheme, case studies & assertion reason questions – Classes 7 to 12.</p>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 mb-6 text-sm rounded">
        ℹ️ <strong>Disclaimer:</strong> Some resources are hosted on third-party websites. We provide these links for your convenience and are not responsible for their content. Official CBSE links are preferred where available.
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: 'previous', label: 'Previous Year Papers' },
          { id: 'sample', label: 'Sample Papers 2025–26' },
          { id: 'syllabus', label: 'Syllabus' },
          { id: 'revisionNotes', label: 'Revision Notes' },
          { id: 'markingScheme', label: 'Marking Scheme' },
          { id: 'caseStudy', label: 'Case Study Qs' },
          { id: 'assertionReason', label: 'Assertion & Reason' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setPaperType(cat.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              paperType === cat.id ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Class selection (7 to 12) */}
      <div className="flex flex-wrap gap-3 mb-6">
        {['7', '8', '9', '10', '11', '12'].map(cls => (
          <button
            key={cls}
            onClick={() => setSelectedClass(cls)}
            className={`px-5 py-2 rounded-lg font-medium transition ${
              selectedClass === cls ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Class {cls}
          </button>
        ))}
      </div>

      {/* Pattern alert */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-3 mb-6 text-sm rounded">
        ⭐ <strong>2025–26 Pattern:</strong> Competency-based questions 40%, Case Study 20%, MCQ 25%. New pattern ke sample papers download karo.
      </div>

      {/* Papers Table */}
      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Subject</th>
              <th className="px-4 py-3 text-left">Year</th>
              <th className="px-4 py-3 text-left">Sets</th>
              <th className="px-4 py-3 text-left">Marking Scheme</th>
              <th className="px-4 py-3 text-left">Medium</th>
              <th className="px-4 py-3 text-left">Download</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {currentData.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No resources available for this class and category. Coming soon.
                </td>
              </tr>
            ) : (
              currentData.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2 font-medium">{item.subject}</td>
                  <td className="px-4 py-2">{item.year}</td>
                  <td className="px-4 py-2">{item.sets || '—'}</td>
                  <td className="px-4 py-2">{item.marking || '—'}</td>
                  <td className="px-4 py-2">{item.medium}</td>
                  <td className="px-4 py-2">{renderLink(item)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Older papers button (optional) */}
      <div className="text-center mt-6">
        <button className="text-purple-600 text-sm border border-purple-200 px-4 py-2 rounded-full hover:bg-purple-50">
          2010–2023 Purane Papers Bhi Dekhein →
        </button>
      </div>
    </div>
  )
}