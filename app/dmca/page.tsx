import Link from 'next/link'

export default function DMCAPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-purple-600">Home</Link>
        <span>›</span>
        <span className="text-purple-600 font-medium">DMCA & Copyright</span>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-6 md:p-8">
        <h1 className="text-3xl font-bold mb-6">DMCA & Copyright Policy</h1>
        <p className="text-gray-500 text-sm mb-6">Last updated: June 8, 2026</p>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold mb-2">Respect for Intellectual Property</h2>
            <p>VidyaPath respects the intellectual property rights of others. We do not host any copyrighted material unless we have permission or it is in the public domain. All NCERT textbooks, CBSE sample papers, and government‑issued content are sourced from official websites and are believed to be free to use for educational purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Reporting Copyright Infringement</h2>
            <p>If you believe that any content on our website infringes your copyright, please provide a written notice to our designated agent with the following information:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Your contact information (name, address, email, phone).</li>
              <li>Identification of the copyrighted work claimed to have been infringed.</li>
              <li>Identification of the material that is claimed to be infringing (URL or description).</li>
              <li>A statement that you have a good faith belief that the use is not authorised.</li>
              <li>A statement that the information in the notice is accurate, and under penalty of perjury, you are authorised to act on behalf of the owner.</li>
              <li>Your physical or electronic signature.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Designated Copyright Agent</h2>
            <p>Please send all DMCA notices to:</p>
            <div className="bg-gray-50 p-4 rounded-lg mt-2">
              <p className="font-mono text-sm">VidyaPath – Copyright Agent<br />
              Email: <a href="mailto:dmca@vidyapath.in" className="text-purple-600">dmca@vidyapath.in</a><br />
              Address: (Your physical address, if desired – can be omitted for online‑only sites)</p>
            </div>
            <p className="mt-2">We will respond to valid notices within 48 hours and take appropriate action, including removing or disabling access to the allegedly infringing material.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Counter‑Notification</h2>
            <p>If your material was removed due to a mistake or misidentification, you may submit a counter‑notification. Please contact us at <a href="mailto:dmca@vidyapath.in" className="text-purple-600">dmca@vidyapath.in</a> with the details.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Repeat Infringers</h2>
            <p>VidyaPath will, in appropriate circumstances, terminate access for users who are repeat infringers.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Disclaimer</h2>
            <p>This DMCA policy is provided for informational purposes and does not constitute legal advice. If you have specific legal concerns, consult an attorney.</p>
          </section>
        </div>
      </div>
    </div>
  )
}