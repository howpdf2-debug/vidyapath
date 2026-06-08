import Link from 'next/link'
import { Briefcase, GraduationCap, HeartHandshake, TrendingUp } from 'lucide-react'

export default function CareerPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-purple-600">Home</Link>
        <span>›</span>
        <span className="text-purple-600 font-medium">Career Guide</span>
      </div>

      <div className="bg-gradient-to-r from-amber-800 to-amber-600 text-white rounded-2xl p-6 mb-8">
        <h1 className="text-2xl font-bold">अपना करियर पथ चुनें</h1>
        <p className="text-amber-100 mt-1">10वीं और 12वीं के बाद क्या करें – स्ट्रीम गाइड, करियर प्रोफाइल, वेतन डेटा।</p>
      </div>

      {/* Filters (static) */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['12वीं के बाद', '10वीं के बाद', 'स्ट्रीम गाइड', 'IAS/UPSC', 'वेतन गाइड', 'लड़कियों के लिए'].map(f => (
          <button key={f} className="px-4 py-1.5 rounded-full text-sm font-medium bg-gray-100 hover:bg-gray-200 transition">
            {f}
          </button>
        ))}
      </div>

      {/* Stream Cards */}
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span className="w-1 h-5 bg-purple-600 rounded-full"></span>
        स्ट्रीम चुनें – 12वीं के बाद
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <div className="bg-white rounded-xl border-t-4 border-purple-500 shadow-sm p-4 card-hover">
          <div className="text-3xl mb-2">🔬</div>
          <div className="font-bold">विज्ञान (Science)</div>
          <p className="text-sm text-gray-500 mt-1">इंजीनियरिंग, मेडिकल, रिसर्च — JEE और NEET के माध्यम से शीर्ष संस्थानों में प्रवेश।</p>
          <div className="flex flex-wrap gap-1 mt-2">
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">JEE</span>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">NEET</span>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">B.Sc</span>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">NDA</span>
          </div>
        </div>
        <div className="bg-white rounded-xl border-t-4 border-amber-500 shadow-sm p-4 card-hover">
          <div className="text-3xl mb-2">💼</div>
          <div className="font-bold">वाणिज्य (Commerce)</div>
          <p className="text-sm text-gray-500 mt-1">CA, MBA, बैंकिंग, वित्त — व्यवसाय और पैसे के प्रबंधन के लिए आदर्श।</p>
          <div className="flex flex-wrap gap-1 mt-2">
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">CA</span>
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">MBA</span>
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">CS</span>
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">BBA</span>
          </div>
        </div>
        <div className="bg-white rounded-xl border-t-4 border-green-500 shadow-sm p-4 card-hover">
          <div className="text-3xl mb-2">🎨</div>
          <div className="font-bold">कला (Arts / Humanities)</div>
          <p className="text-sm text-gray-500 mt-1">UPSC, विधि, पत्रकारिता, मनोविज्ञान — विविध करियर विकल्प।</p>
          <div className="flex flex-wrap gap-1 mt-2">
            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">IAS/IPS</span>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">LLB</span>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">BFA</span>
          </div>
        </div>
      </div>

      {/* Salary Table */}
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span className="w-1 h-5 bg-purple-600 rounded-full"></span>
        शीर्ष करियर – वेतन डेटा
      </h2>
      <div className="bg-white rounded-xl border overflow-x-auto mb-8">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">करियर</th>
              <th className="px-4 py-2 text-left">योग्यता</th>
              <th className="px-4 py-2 text-left">प्रवेश वेतन</th>
              <th className="px-4 py-2 text-left">औसत</th>
              <th className="px-4 py-2 text-left">शीर्ष वेतन</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr><td className="px-4 py-2 font-medium">IAS अधिकारी</td><td className="px-4 py-2">कोई भी स्नातक + UPSC</td><td className="px-4 py-2">₹56,100/माह</td><td className="px-4 py-2">₹1,00,000/माह</td><td className="px-4 py-2">₹2,50,000/माह</td></tr>
            <tr><td className="px-4 py-2 font-medium">सॉफ्टवेयर इंजीनियर</td><td className="px-4 py-2">B.Tech / B.Sc CS</td><td className="px-4 py-2">₹30,000/माह</td><td className="px-4 py-2">₹80,000/माह</td><td className="px-4 py-2">₹3,00,000+/माह</td></tr>
            <tr><td className="px-4 py-2 font-medium">MBBS डॉक्टर</td><td className="px-4 py-2">NEET के माध्यम से MBBS</td><td className="px-4 py-2">₹50,000/माह</td><td className="px-4 py-2">₹1,50,000/माह</td><td className="px-4 py-2">₹5,00,000+/माह</td></tr>
            <tr><td className="px-4 py-2 font-medium">चार्टर्ड एकाउंटेंट (CA)</td><td className="px-4 py-2">CA – ICAI के 3 स्तर</td><td className="px-4 py-2">₹40,000/माह</td><td className="px-4 py-2">₹1,00,000/माह</td><td className="px-4 py-2">₹2,00,000+/माह</td></tr>
            <tr><td className="px-4 py-2 font-medium">शिक्षक (KVS)</td><td className="px-4 py-2">B.Ed + CTET</td><td className="px-4 py-2">₹35,400/माह</td><td className="px-4 py-2">₹60,000/माह</td><td className="px-4 py-2">₹1,12,400/माह</td></tr>
            <tr><td className="px-4 py-2 font-medium">वाणिज्यिक पायलट</td><td className="px-4 py-2">PCM + DGCA लाइसेंस</td><td className="px-4 py-2">₹1,50,000/माह</td><td className="px-4 py-2">₹3,00,000/माह</td><td className="px-4 py-2">₹5,00,000+/माह</td></tr>
          </tbody>
        </table>
      </div>

      {/* Career Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl text-center border shadow-sm card-hover">
          <div className="text-4xl mb-2">⚖️</div>
          <div className="font-bold text-sm">IAS अधिकारी</div>
          <div className="text-xs text-gray-500 mt-1">UPSC आवश्यक</div>
          <div className="text-xs text-green-600 font-semibold mt-2">₹56,100–2,50,000/माह</div>
        </div>
        <div className="bg-white p-4 rounded-xl text-center border shadow-sm card-hover">
          <div className="text-4xl mb-2">👨‍⚕️</div>
          <div className="font-bold text-sm">MBBS डॉक्टर</div>
          <div className="text-xs text-gray-500 mt-1">NEET + 5.5 वर्ष</div>
          <div className="text-xs text-green-600 font-semibold mt-2">₹50,000–5L+/माह</div>
        </div>
        <div className="bg-white p-4 rounded-xl text-center border shadow-sm card-hover">
          <div className="text-4xl mb-2">💻</div>
          <div className="font-bold text-sm">सॉफ्टवेयर इंजीनियर</div>
          <div className="text-xs text-gray-500 mt-1">B.Tech / BCA</div>
          <div className="text-xs text-green-600 font-semibold mt-2">₹30,000–3L+/माह</div>
        </div>
        <div className="bg-white p-4 rounded-xl text-center border shadow-sm card-hover">
          <div className="text-4xl mb-2">📊</div>
          <div className="font-bold text-sm">चार्टर्ड एकाउंटेंट</div>
          <div className="text-xs text-gray-500 mt-1">ICAI तीन स्तरीय परीक्षा</div>
          <div className="text-xs text-green-600 font-semibold mt-2">₹40,000–2L+/माह</div>
        </div>
      </div>
    </div>
  )
}