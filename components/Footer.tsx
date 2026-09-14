import Link from 'next/link'
import { BookOpen, MapPin, Newspaper, Briefcase, Target, GraduationCap } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border-t border-white/20 dark:border-gray-700/20 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Column */}
          <div>
            <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-3">
              VidyaPath
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Free study portal for Indian students. NCERT solutions, state boards, exam results, competitive exam preparation, and sarkari naukri updates – all in one place.
            </p>
            <div className="flex gap-3 mt-4">
              {/* Social icons – replace with actual links */}
              <a href="#" className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition" aria-label="YouTube">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/><path d="M9.545 15.568L9.545 8.432L15.818 12L9.545 15.568z"/></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition" aria-label="Twitter">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition" aria-label="LinkedIn">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
              Quick Links
            </h4>
            <nav className="flex flex-col gap-2 text-sm">
              <Link href="/ncert" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                NCERT Books
              </Link>
              <Link href="/state-boards" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                State Boards
              </Link>
              <Link href="/results" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                Results
              </Link>
              <Link href="/competitive-exams" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                Competitive Exams
              </Link>
              <Link href="/rojgar-samachar" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                Rojgar Samachar
              </Link>
              <Link href="/notes" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                Notes
              </Link>
            </nav>
          </div>

          {/* Resources Column */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
              Resources
            </h4>
            <nav className="flex flex-col gap-2 text-sm">
              <Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                About Us
              </Link>
              <Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                Contact
              </Link>
              <Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                Terms of Service
              </Link>
              <Link href="/dmca" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                DMCA
              </Link>
            </nav>
          </div>

          {/* Trust & Contact Column */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
              Trust & Support
            </h4>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <p>
                <span className="font-medium text-gray-900 dark:text-white">💬</span>{' '}
                <a href="mailto:support@vidyapath.in" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  support@vidyapath.in
                </a>
              </p>
              <p>
                <span className="font-medium text-gray-900 dark:text-white">📱</span> 100% free, forever.
              </p>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                Made with ❤️ for students across India.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          <p>
            © {currentYear} VidyaPath. All rights reserved. | 
            <span className="ml-1">Built with Next.js, Tailwind CSS, Supabase</span>
          </p>
          <p className="mt-1">
            <span className="inline-block mx-2">📚</span> 
            <span>Free NCERT Solutions &amp; Notes for Classes 6–12</span>
          </p>
        </div>
      </div>
    </footer>
  )
}