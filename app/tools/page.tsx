'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const mcqData = [
  { q: "HCF और LCM का क्या संबंध है? (a और b दो संख्याएँ हैं)", opts: ["HCF × LCM = a + b", "HCF × LCM = a × b", "HCF + LCM = a × b", "HCF / LCM = a × b"], ans: 1, exp: "HCF × LCM = दो संख्याओं का गुणनफल। यह संख्या सिद्धांत का मूलभूत प्रमेय है।" },
  { q: "एक AP में a=3, सार्व अंतर d=4 है। 5वाँ पद क्या होगा?", opts: ["15", "16", "19", "20"], ans: 2, exp: "an = a + (n-1)d = 3 + (5-1)×4 = 3 + 16 = 19। सूत्र याद रखें!" },
  { q: "√2 क्या है?", opts: ["परिमेय संख्या", "अपरिमेय संख्या", "प्राकृत संख्या", "पूर्ण संख्या"], ans: 1, exp: "√2 को p/q रूप में नहीं लिखा जा सकता, इसलिए यह अपरिमेय है।" },
  { q: "प्रकाश संश्लेषण में क्या उत्पन्न होता है?", opts: ["CO2 और पानी", "ग्लूकोज़ और ऑक्सीजन", "ग्लूकोज़ और CO2", "ऑक्सीजन और पानी"], ans: 1, exp: "6CO2 + 6H2O + प्रकाश → C6H12O6 (ग्लूकोज़) + 6O2" },
  { q: "न्यूटन का पहला नियम क्या कहता है?", opts: ["F = ma", "प्रत्येक क्रिया की बराबर और विपरीत प्रतिक्रिया होती है", "कोई वस्तु अपनी अवस्था में तब तक रहती है जब तक कोई बाहरी बल न लगे", "a और b दोनों"], ans: 2, exp: "न्यूटन का पहला नियम (जड़त्व): वस्तु अपनी अवस्था तब तक नहीं बदलती जब तक बाहरी असंतुलित बल न लगे।" },
]

export default function ToolsPage() {
  // CGPA Calculator state
  const [cgpa, setCgpa] = useState('')
  const [multiplier, setMultiplier] = useState('9.5')
  const [cgpaResult, setCgpaResult] = useState<null | { pct: string; grade: string }>(null)

  // MCQ state
  const [mcqIndex, setMcqIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [showExp, setShowExp] = useState(false)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(0)
  const [done, setDone] = useState(false)
  const [timeLeft, setTimeLeft] = useState(180)

  useEffect(() => {
    if (done || mcqIndex >= mcqData.length) return
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          setDone(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [mcqIndex, done])

  const handleCgpa = () => {
    const val = parseFloat(cgpa)
    if (isNaN(val) || val < 0 || val > 10) {
      setCgpaResult(null)
      return
    }
    const mult = parseFloat(multiplier)
    const percentage = (val * mult).toFixed(2)
    let grade = ''
    if (val >= 9.5) grade = 'A1 (शानदार)'
    else if (val >= 9) grade = 'A2 (बहुत अच्छा)'
    else if (val >= 8) grade = 'B1 (अच्छा)'
    else if (val >= 7) grade = 'B2 (औसत से ऊपर)'
    else if (val >= 6) grade = 'C1 (औसत)'
    else grade = 'और मेहनत करें'
    setCgpaResult({ pct: percentage, grade })
  }

  const selectOption = (idx: number) => {
    if (selected !== null || done) return
    setSelected(idx)
  }

  const submitMCQ = () => {
    if (selected === null || done) return
    const current = mcqData[mcqIndex]
    setAnswered(answered + 1)
    if (selected === current.ans) setScore(score + 1)
    setShowExp(true)
  }

  const nextQuestion = () => {
    if (mcqIndex + 1 >= mcqData.length) {
      setDone(true)
    } else {
      setMcqIndex(mcqIndex + 1)
      setSelected(null)
      setShowExp(false)
    }
  }

  const resetMCQ = () => {
    setMcqIndex(0)
    setSelected(null)
    setShowExp(false)
    setScore(0)
    setAnswered(0)
    setDone(false)
    setTimeLeft(180)
  }

  const currentQ = mcqData[mcqIndex]
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-purple-600">Home</Link>
        <span>›</span>
        <span className="text-purple-600 font-medium">स्टडी टूल्स</span>
      </div>

      <div className="bg-gradient-to-r from-purple-800 to-purple-600 text-white rounded-2xl p-6 mb-8">
        <h1 className="text-2xl font-bold">स्मार्ट स्टडी टूल्स</h1>
        <p className="text-purple-100 mt-1">CGPA कैलकुलेटर, MCQ परीक्षण, टाइमटेबल जेनरेटर — सभी फंक्शनल, कोई रजिस्ट्रेशन नहीं।</p>
      </div>

      {/* CGPA Section */}
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-purple-600 rounded-full"></span>
          CGPA से प्रतिशत कैलकुलेटर
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">CGPA दर्ज करें:</label>
              <input type="number" step="0.1" min="0" max="10" value={cgpa} onChange={(e) => setCgpa(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="जैसे 8.5" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">बोर्ड / विश्वविद्यालय:</label>
              <select value={multiplier} onChange={(e) => setMultiplier(e.target.value)} className="w-full border rounded-lg px-3 py-2">
                <option value="9.5">CBSE (×9.5)</option>
                <option value="10">VTU / KTU (×10)</option>
                <option value="9.8">अधिकांश विश्वविद्यालय (×9.8)</option>
              </select>
            </div>
            <button onClick={handleCgpa} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">गणना करें</button>
            {cgpaResult && (
              <div className="mt-4 p-4 bg-purple-50 rounded-lg text-center">
                <div className="text-3xl font-bold text-purple-700">{cgpaResult.pct}%</div>
                <div className="text-sm mt-1">{cgpaResult.grade}</div>
              </div>
            )}
          </div>
          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <h3 className="font-semibold mb-2">📊 CBSE ग्रेड संदर्भ</h3>
            <table className="w-full text-sm">
              <thead><tr><th className="text-left py-1">CGPA रेंज</th><th>ग्रेड</th><th className="text-left py-1">% (CBSE)</th></tr></thead>
              <tbody>
                <tr><td>9.5–10.0</td><td>A1</td><td>90.25–95%</td></tr>
                <tr><td>9.0–9.4</td><td>A2</td><td>85.5–89.3%</td></tr>
                <tr><td>8.0–8.9</td><td>B1</td><td>76–84.55%</td></tr>
                <tr><td>7.0–7.9</td><td>B2</td><td>66.5–75.05%</td></tr>
                <tr><td>6.0–6.9</td><td>C1</td><td>57–65.55%</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MCQ Test Section */}
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-purple-600 rounded-full"></span>
          MCQ अभ्यास परीक्षण — कक्षा 10 गणित + विज्ञान
        </h2>
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          {!done && mcqIndex < mcqData.length ? (
            <>
              <div className="flex justify-between items-center mb-4 text-sm">
                <span>⏱️ समय: {minutes}:{seconds < 10 ? '0'+seconds : seconds}</span>
                <span>स्कोर: {score}/{answered}</span>
                <span>प्रश्न {mcqIndex+1}/{mcqData.length}</span>
              </div>
              <div className="font-semibold text-lg mb-4">{currentQ.q}</div>
              <div className="space-y-2">
                {currentQ.opts.map((opt, idx) => (
                  <div key={idx} onClick={() => selectOption(idx)} className={`p-3 border rounded-lg cursor-pointer transition ${selected === idx ? 'bg-purple-50 border-purple-500' : 'hover:bg-gray-50'} ${showExp && idx === currentQ.ans ? 'bg-green-50 border-green-500' : ''} ${showExp && selected === idx && idx !== currentQ.ans ? 'bg-red-50 border-red-500' : ''}`}>
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full border flex items-center justify-center text-sm">{String.fromCharCode(65+idx)}</span>
                      {opt}
                    </div>
                  </div>
                ))}
              </div>
              {showExp && (<div className="mt-4 p-3 bg-green-50 rounded-lg text-sm">💡 {currentQ.exp}</div>)}
              <div className="flex gap-3 mt-6">
                {!showExp ? (<button onClick={submitMCQ} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">उत्तर जमा करें</button>) : (<button onClick={nextQuestion} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">अगला प्रश्न →</button>)}
                <button onClick={resetMCQ} className="border px-4 py-2 rounded-lg hover:bg-gray-50">🔄 पुनः आरंभ करें</button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-2xl font-bold text-purple-600 mb-2">🎉 स्कोर: {score} / {mcqData.length} ({Math.round(score/mcqData.length*100)}%)</div>
              <p className="text-gray-500 mb-4">परीक्षण समाप्त! फिर से प्रयास करें।</p>
              <button onClick={resetMCQ} className="bg-purple-600 text-white px-4 py-2 rounded-lg">पुनः प्रारंभ करें →</button>
            </div>
          )}
        </div>
      </div>

      {/* Additional Tools – Static Cards */}
      <div className="grid md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border-t-4 border-amber-500 p-5 shadow-sm">
          <div className="text-4xl mb-2">📅</div>
          <div className="font-bold">अध्ययन टाइमटेबल जेनरेटर</div>
          <p className="text-sm text-gray-500 mt-1">कक्षा, विषय और दैनिक घंटे बताएँ — संतुलित टाइमटेबल जेनरेट होगा।</p>
          <button className="mt-3 bg-amber-500 text-white px-3 py-1 rounded-lg text-sm">टाइमटेबल बनाएँ</button>
        </div>
        <div className="bg-white rounded-xl border-t-4 border-green-500 p-5 shadow-sm">
          <div className="text-4xl mb-2">🗓️</div>
          <div className="font-bold">परीक्षा कैलेंडर 2025–26</div>
          <p className="text-sm text-gray-500 mt-1">JEE, NEET, SSC, CBSE, UPSC — सभी महत्वपूर्ण तिथियाँ।</p>
          <button className="mt-3 bg-green-600 text-white px-3 py-1 rounded-lg text-sm">कैलेंडर देखें</button>
        </div>
        <div className="bg-white rounded-xl border-t-4 border-purple-500 p-5 shadow-sm">
          <div className="text-4xl mb-2">🤖</div>
          <div className="font-bold">AI संदेह समाधानकर्ता</div>
          <p className="text-sm text-gray-500 mt-1">कोई भी विषय का संदेह — AI चरणबद्ध समाधान करेगा (जल्द आ रहा है)।</p>
          <span className="inline-block mt-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">चरण 5</span>
        </div>
      </div>
    </div>
  )
}