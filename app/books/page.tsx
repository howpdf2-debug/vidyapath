import Link from 'next/link'

const books = [
  { title: 'RD शर्मा — कक्षा 6–12', description: 'गणित — सभी अध्याय, सभी अभ्यास। चरणबद्ध समाधान।', icon: '📐', color: 'border-purple-500', badge: '🔥 सबसे अधिक खोजा गया', bg: 'bg-purple-50', link: '#' },
  { title: 'HC वर्मा — भौतिकी खंड 1 & 2', description: 'भौतिकी की अवधारणाएँ — JEE स्तर। अध्याय अभ्यास + उदाहरण।', icon: '⚡', color: 'border-amber-500', badge: '🔥 JEE पसंदीदा', bg: 'bg-amber-50', link: '#' },
  { title: 'RS अग्रवाल — गणित', description: 'कक्षा 6–12 + मात्रात्मक योग्यता। SSC और बैंक परीक्षाओं के लिए आदर्श।', icon: '📊', color: 'border-green-500', badge: 'लोकप्रिय', bg: 'bg-green-50', link: '#' },
  { title: 'लक्ष्मी सिंह — विज्ञान', description: 'कक्षा 9 & 10। भौतिकी, रसायन, जीवविज्ञान — CBSE पैटर्न।', icon: '🔬', color: 'border-blue-500', badge: 'CBSE', bg: 'bg-blue-50', link: '#' },
  { title: 'TS ग्रेवाल — लेखाकर्म', description: 'कक्षा 11 & 12 वाणिज्य। CBSE पैटर्न — DK गोयल भी उपलब्ध।', icon: '💰', color: 'border-teal-500', badge: 'वाणिज्य', bg: 'bg-teal-50', link: '#' },
  { title: 'ML अग्रवाल — ICSE गणित', description: 'कक्षा 9 & 10 ICSE के लिए अंडरस्टैंडिंग मैथमेटिक्स — पूर्ण अभ्यास समाधान।', icon: '📙', color: 'border-purple-500', badge: 'ICSE', bg: 'bg-purple-50', link: '#' },
]

export default function BooksPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-purple-600">Home</Link>
        <span>›</span>
        <span className="text-purple-600 font-medium">पुस्तक समाधान</span>
      </div>

      <div className="bg-gradient-to-r from-purple-800 to-purple-600 text-white rounded-2xl p-6 mb-8">
        <h1 className="text-2xl font-bold">लोकप्रिय पुस्तकों के समाधान</h1>
        <p className="text-purple-100 mt-1">RD शर्मा, HC वर्मा, RS अग्रवाल, सेलिना — भारत की शीर्ष संदर्भ पुस्तकों के पूर्ण समाधान।</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {books.map(book => (
          <div key={book.title} className={`bg-white rounded-xl border-t-4 ${book.color} shadow-sm hover:shadow-md transition overflow-hidden`}>
            <div className={`p-4 ${book.bg}`}>
              <div className="text-3xl mb-2">{book.icon}</div>
              <h3 className="font-bold text-lg">{book.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{book.description}</p>
              <div className="mt-2">
                <span className={`text-xs px-2 py-0.5 rounded-full bg-white ${book.color.replace('border', 'text')}`}>
                  {book.badge}
                </span>
              </div>
            </div>
            <div className="p-4 border-t flex justify-between items-center">
              <a href={book.link} className="text-purple-600 text-sm flex items-center gap-1">📄 समाधान</a>
              <button className="text-gray-600 text-sm border border-gray-200 px-3 py-1 rounded-lg hover:bg-gray-50">देखें →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}