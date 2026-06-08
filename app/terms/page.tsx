import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-purple-600">Home</Link>
        <span>›</span>
        <span className="text-purple-600 font-medium">Terms of Service</span>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-6 md:p-8">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <p className="text-gray-500 text-sm mb-6">Last updated: June 8, 2026</p>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
            <p>By accessing or using VidyaPath, you agree to be bound by these Terms of Service. If you do not agree, please do not use our website.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Use of Content</h2>
            <p>All NCERT textbooks, CBSE papers, and other educational content are sourced from official government portals (NCERT, CBSE) and are believed to be in the public domain. You may download, print, and share materials for personal, non‑commercial use. Redistribution or commercial use requires permission.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. User Conduct</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>You must not misuse our services or attempt to disrupt them.</li>
              <li>Do not submit false information or impersonate others.</li>
              <li>You are responsible for maintaining the confidentiality of any account details (if created in the future).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Third‑Party Links & Resources</h2>
            <p>VidyaPath provides links to external websites for reference (e.g., official board result pages). We do not control these sites and are not liable for their content or availability.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Disclaimer of Warranties</h2>
            <p>The information on this site is provided “as is” without any warranties. We do not guarantee that the content is accurate, complete, or up‑to‑date. We are not responsible for any errors or omissions.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, VidyaPath shall not be liable for any indirect, incidental, or consequential damages arising from your use of our website.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">7. Termination</h2>
            <p>We reserve the right to terminate or suspend access to our services without prior notice for conduct that violates these Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">8. Governing Law</h2>
            <p>These Terms shall be governed by the laws of India. Any disputes shall be resolved in the courts of Varanasi, Uttar Pradesh.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">9. Changes to Terms</h2>
            <p>We may update these Terms from time to time. Continued use of the site after changes constitutes acceptance of the revised Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">10. Contact</h2>
            <p>For any questions, please contact us at <a href="mailto:contact@vidyapath.in" className="text-purple-600">contact@vidyapath.in</a>.</p>
          </section>
        </div>
      </div>
    </div>
  )
}