import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-purple-600">Home</Link>
        <span>›</span>
        <span className="text-purple-600 font-medium">Privacy Policy</span>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-6 md:p-8">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-gray-500 text-sm mb-6">Last updated: June 8, 2026</p>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as when you subscribe to our newsletter. We also automatically collect certain technical data when you visit our site, including your IP address, browser type, device information, and pages visited.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To operate and maintain our website</li>
              <li>To send you updates, job alerts, and newsletters (if you subscribed)</li>
              <li>To analyze site traffic and improve user experience using Google Analytics</li>
              <li>To respond to your comments or inquiries</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Cookies & Tracking Technologies</h2>
            <p>We use cookies and similar technologies to enhance your browsing experience, analyze site usage, and personalize content. Google Analytics uses cookies to collect anonymous traffic data. You can disable cookies in your browser settings.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Third‑Party Links</h2>
            <p>Our website contains links to external websites (CBSE, NCERT, NTA, Supabase, etc.). We are not responsible for the privacy practices or content of those sites. We encourage you to review their privacy policies.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Data Storage & Security</h2>
            <p>We use Supabase (PostgreSQL) to store newsletter subscriptions. All data is protected by industry‑standard security measures. However, no method of transmission over the Internet is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Children’s Privacy</h2>
            <p>VidyaPath does not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us immediately.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">7. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data. To unsubscribe from newsletters, click the link in any email or contact us at <a href="mailto:contact@vidyapath.in" className="text-purple-600">contact@vidyapath.in</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">8. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">9. Contact Us</h2>
            <p>If you have any questions, please email us at: <a href="mailto:contact@vidyapath.in" className="text-purple-600">contact@vidyapath.in</a></p>
          </section>
        </div>
      </div>
    </div>
  )
}