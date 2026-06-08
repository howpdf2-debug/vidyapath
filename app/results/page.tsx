export const dynamic = 'force-static';

import Link from 'next/link';

// Type definitions for the ResultCard props
interface ResultCardProps {
  title: string;
  status: string;
  statusColor: string;
  statusPulse?: boolean;
  date: string;
  link: string;
  icon: string;
  bg: string;
}

// Type definitions for the AdmitCard props
interface AdmitCardProps {
  title: string;
  status: string;
  link: string;
  icon: string;
  bg: string;
}

// Component for Result Cards
function ResultCard({ title, status, statusColor, statusPulse = false, date, link, icon, bg }: ResultCardProps) {
  return (
    <div className={`${bg} rounded-xl border p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition`}>
      <div className="text-4xl">{icon}</div>
      <div className="flex-1">
        <div className="font-bold text-gray-800">{title}</div>
        <div className={`text-xs font-semibold ${statusColor} ${statusPulse ? 'animate-pulse' : ''}`}>{status}</div>
        <div className="text-xs text-gray-500 mt-1">{date}</div>
      </div>
      <a href={link} target="_blank" rel="nofollow noopener noreferrer" className="bg-purple-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-purple-700">
        Check →
      </a>
    </div>
  );
}

// Component for Admit Cards
function AdmitCard({ title, status, link, icon, bg }: AdmitCardProps) {
  return (
    <div className={`${bg} rounded-xl border p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition`}>
      <div className="text-4xl">{icon}</div>
      <div className="flex-1">
        <div className="font-bold text-gray-800 dark:text-white">{title}</div>
        <div className="text-xs font-semibold text-red-600 animate-pulse">{status}</div>
      </div>
      <a href={link} target="_blank" rel="nofollow noopener noreferrer" className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700">
        Download →
      </a>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-purple-600">Home</Link>
        <span>›</span>
        <span className="text-purple-600 font-medium">Results & Admit Cards</span>
      </div>

      <div className="bg-gradient-to-r from-red-800 to-red-600 text-white rounded-2xl p-6 mb-8">
        <h1 className="text-2xl font-bold">Results & Admit Cards</h1>
        <p className="text-red-100 mt-1">Board results, competitive exam results, admit cards — real-time updates.</p>
      </div>

      {/* Alert for live result */}
      <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-6 text-sm rounded flex items-start gap-2">
        <span className="text-red-600 text-lg">🔴</span>
        <div><strong>Bihar Board Class 10 Result:</strong> 80.59% pass. Aaj declare hua. Direct link niche hai — check karein.</div>
      </div>

      {/* ============ BOARD RESULTS SECTION ============ */}
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span className="w-1 h-5 bg-purple-600 rounded-full"></span>
        Board Results 2025
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <ResultCard
          title="Bihar Board Matric Result 2025"
          status="LIVE"
          statusColor="text-red-600"
          statusPulse={true}
          date="Aaj declare hua"
          link="https://secondary.biharboardonline.com/"
          icon="🏆"
          bg="bg-yellow-50"
        />
        <ResultCard
          title="UP Board Class 12 Result 2025"
          status="Declared"
          statusColor="text-green-600"
          date="Declared — 27 April"
          link="https://upresults.nic.in/"
          icon="🎓"
          bg="bg-green-50"
        />
        <ResultCard
          title="CBSE Class 10 & 12 Result 2025"
          status="Declared"
          statusColor="text-green-600"
          date="Declared — 13 May"
          link="https://results.cbse.nic.in/"
          icon="📘"
          bg="bg-blue-50"
        />
        <ResultCard
          title="ICSE / ISC Result 2025"
          status="Declared"
          statusColor="text-green-600"
          date="Declared"
          link="https://results.cisce.org/"
          icon="📙"
          bg="bg-purple-50"
        />
      </div>

      {/* ============ COMPETITIVE EXAMS SECTION ============ */}
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span className="w-1 h-5 bg-purple-600 rounded-full"></span>
        Competitive Exams 2025
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <ResultCard
          title="JEE Mains Session 2 Result 2025"
          status="Declared"
          statusColor="text-green-600"
          date="Declared — 19 April"
          link="https://jeemain.nta.nic.in/"
          icon="⚡"
          bg="bg-orange-50"
        />
        <ResultCard
          title="NEET UG Result 2025"
          status="Declared"
          statusColor="text-green-600"
          date="Declared — 14 June"
          link="https://neet.nta.nic.in/"
          icon="🏥"
          bg="bg-teal-50"
        />
        <ResultCard
          title="CUET UG 2025 Result"
          status="Declared"
          statusColor="text-green-600"
          date="Declared — 4 July"
          link="https://cuet.nta.nic.in/"
          icon="📚"
          bg="bg-indigo-50"
        />
        <ResultCard
          title="SSC CGL 2025 Tier 1 Result"
          status="Declared"
          statusColor="text-green-600"
          date="Declared — 19 December"
          link="https://ssc.gov.in/"
          icon="🏛️"
          bg="bg-amber-50"
        />
        <ResultCard
          title="IBPS PO Final Result 2025"
          status="Declared"
          statusColor="text-green-600"
          date="Declared — 15 January 2026"
          link="https://ibps.in/"
          icon="💰"
          bg="bg-emerald-50"
        />
        <ResultCard
          title="RRB NTPC CBT 2 Result 2025"
          status="Declared"
          statusColor="text-green-600"
          date="Declared — 15 December (Graduate Level)"
          link="https://rrbcdg.gov.in/"
          icon="🚂"
          bg="bg-cyan-50"
        />
        <ResultCard
          title="UPSC Civil Services Prelims 2025"
          status="Declared"
          statusColor="text-green-600"
          date="Declared — 12 June"
          link="https://upsc.gov.in/"
          icon="⚖️"
          bg="bg-rose-50"
        />
        <ResultCard
          title="KVS TGT/PGT 2025 Result"
          status="Declared"
          statusColor="text-green-600"
          date="Declared"
          link="https://kvsangathan.nic.in/"
          icon="📖"
          bg="bg-sky-50"
        />
        <ResultCard
          title="GDS 2025 Result"
          status="Declared"
          statusColor="text-green-600"
          date="Declared"
          link="https://indiapostgdsonline.gov.in/"
          icon="✉️"
          bg="bg-lime-50"
        />
      </div>

      {/* ============ ADMIT CARDS SECTION ============ */}
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span className="w-1 h-5 bg-purple-600 rounded-full"></span>
        Admit Cards — Active
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <AdmitCard
          title="SSC CGL 2025 Tier 1 Admit Card"
          status="Released"
          link="https://ssc.gov.in/"
          icon="📋"
          bg="bg-green-50"
        />
        <AdmitCard
          title="IBPS PO 2025 Mains Admit Card"
          status="Released"
          link="https://ibps.in/"
          icon="📋"
          bg="bg-yellow-50"
        />
        <AdmitCard
          title="RRB NTPC 2025 UG CBT 2 Admit Card"
          status="Released"
          link="https://rrbcdg.gov.in/"
          icon="📋"
          bg="bg-blue-50"
        />
        <AdmitCard
          title="JEE Main 2025 Session 2 Admit Card"
          status="Released"
          link="https://jeemain.nta.nic.in/"
          icon="📋"
          bg="bg-amber-50"
        />
        <AdmitCard
          title="NEET UG 2025 Admit Card"
          status="Released"
          link="https://neet.nta.nic.in/"
          icon="📋"
          bg="bg-teal-50"
        />
        <AdmitCard
          title="CUET UG 2025 Admit Card"
          status="Released"
          link="https://cuet.nta.nic.in/"
          icon="📋"
          bg="bg-indigo-50"
        />
        <AdmitCard
          title="UPSC CSE Prelims 2025 Admit Card"
          status="Released"
          link="https://upsc.gov.in/"
          icon="📋"
          bg="bg-rose-50"
        />
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-3 mt-6 text-sm rounded flex items-start gap-2">
        <span className="text-amber-600 text-lg">ℹ️</span>
        <div><strong>Disclaimer:</strong> All links redirect to official exam boards, NTA, SSC, IBPS, UPSC, and other government portals. We are not responsible for third-party content or availability.</div>
      </div>
    </div>
  );
}