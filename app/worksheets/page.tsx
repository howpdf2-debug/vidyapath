import Link from 'next/link'

const worksheets = [
  { title: 'गणित — अध्याय 1: संख्या पद्धति', class: '9', subject: 'Mathematics', questions: 15, pattern: 'NCERT Pattern', pdf: '#' },
  { title: 'विज्ञान — क्या हमारे आसपास का पदार्थ शुद्ध है?', class: '9', subject: 'Science', questions: 20, pattern: 'MCQ + Short', pdf: '#' },
  { title: 'हिंदी — दो बैलों की कथा', class: '9', subject: 'Hindi', questions: 12, pattern: 'CBSE Pattern', pdf: '#' },
  { title: 'सामाजिक विज्ञान — फ्रांसीसी क्रांति', class: '9', subject: 'Social Science', questions: 18, pattern: 'Map + MCQ', pdf: '#' },
  { title: 'अंग्रेज़ी — बीहाइव अध्याय 1: द फन दे हैड', class: '9', subject: 'English', questions: 10, pattern: 'Reading + Writing', pdf: '#' },
  { title: 'गणित — अध्याय 2: बहुपद (अभ्यास)', class: '9', subject: 'Mathematics', questions: 25, pattern: 'Extra Practice', pdf: '#' },
  { title: 'गणित — अध्याय 3: निर्देशांक ज्यामिति', class: '10', subject: 'Mathematics', questions: 22, pattern: 'NCERT Pattern', pdf: '#' },
  { title: 'विज्ञान — रासायनिक अभिक्रियाएँ', class: '10', subject: 'Science', questions: 18, pattern: 'CBSE Pattern', pdf: '#' },
  { title: 'सामाजिक विज्ञान — भारत में राष्ट्रवाद', class: '10', subject: 'Social Science', questions: 16, pattern: 'Map + MCQ', pdf: '#' },
]

export default function WorksheetsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-purple-600">Home</Link>
        <span>›</span>
        <span className="text-purple-600 font-medium">वर्कशीट्स</span>
      </div>

      <div className="bg-gradient-to-r from-teal-800 to-teal-600 text-white rounded-2xl p-6 mb-8">
        <h1 className="text-2xl font-bold">प्रिंट करने योग्य वर्कशीट्स</h1>
        <p className="text-teal-100 mt-1">NCERT, CBSE, UP Board – शिक्षकों और छात्रों के लिए मुफ्त वर्कशीट्स। कक्षा 1–12, बिल्कुल मुफ्त।</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {['NCERT', 'CBSE', 'UP Board', 'Bihar Board', 'JEE/NEET Practice', 'Teacher Templates'].map(filter => (
          <button key={filter} className="px-4 py-1.5 rounded-full text-sm font-medium bg-gray-100 hover:bg-gray-200 transition">
            {filter}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 md:grid-cols-12 gap-2 mb-6">
        {[1,2,3,4,5,6,7,8,9,10,11,12].map(cls => (
          <button key={cls} className="bg-white border rounded-lg py-2 text-center text-sm font-medium hover:bg-purple-50 hover:border-purple-300">
            <span className="block text-xs text-gray-400">कक्षा</span>
            {cls}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {worksheets.map((ws, idx) => (
          <div key={idx} className="bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition">
            <div className="font-bold text-gray-900">{ws.title}</div>
            <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1 mb-2">
              <span>कक्षा {ws.class}</span>
              <span>•</span>
              <span>{ws.questions} प्रश्न</span>
              <span>•</span>
              <span>{ws.pattern}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">मुफ्त PDF</span>
              <a href={ws.pdf} className="text-purple-600 text-sm flex items-center gap-1">📥 डाउनलोड</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}