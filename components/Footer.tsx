import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border-t border-white/20 dark:border-gray-700/20 mt-12 sm:mt-16 safe-bottom">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6 lg:gap-8">
          {/* About */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-3">
              VidyaPath
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Free study portal for Indian students. NCERT solutions, state
              boards, exam results, competitive exam preparation, and sarkari
              naukri updates – all in one place.
            </p>
            <div className="flex gap-2 mt-4">
              <a
                href="https://youtube.com/@vidyapath"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-950/30 text-gray-500 hover:text-red-600 transition"
                aria-label="YouTube"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
                  <path d="M9.545 15.568L9.545 8.432L15.818 12L9.545 15.568z" fill="white" />
                </svg>
              </a>
              <a
                href="https://twitter.com/vidyapath"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-sky-100 dark:hover:bg-sky-950/30 text-gray-500 hover:text-sky-600 transition"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
              Quick Links
            </h4>
            <nav className="grid grid-cols-2 sm:grid-cols-1 gap-x-4 gap-y-2 text-sm">
              <Link href="/ncert" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition py-1">
                NCERT Books
              </Link>
              <Link href="/state-boards" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition py-1">
                State Boards
              </Link>
              <Link href="/results" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition py-1">
                Results
              </Link>
              <Link href="/competitive-exams" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition py-1">
                Exams
              </Link>
              <Link href="/rojgar-samachar" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition py-1">
                Rojgar
              </Link>
              <Link href="/notes" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition py-1">
                Notes
              </Link>
            </nav>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
              Resources
            </h4>
            <nav className="grid grid-cols-2 sm:grid-cols-1 gap-x-4 gap-y-2 text-sm">
              <Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition py-1">
                About Us
              </Link>
              <Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition py-1">
                Contact
              </Link>
              <Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition py-1">
                Privacy
              </Link>
              <Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition py-1">
                Terms
              </Link>
              <Link href="/dmca" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition py-1">
                DMCA
              </Link>
            </nav>
          </div>

          {/* Trust */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
              Trust & Support
            </h4>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <p className="flex items-center gap-2">
                <span>💬</span>
                <a
                  href="mailto:support@vidyapath.in"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition break-all"
                >
                  support@vidyapath.in
                </a>
              </p>
              <p className="flex items-center gap-2">
                <span>🎓</span>
                <span>100% free, forever.</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
                Made with ❤️ for students across India.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-6 text-center text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>
            © {currentYear} VidyaPath. All rights reserved.
          </p>
          <p>
            📚 Free NCERT Solutions &amp; Notes for Classes 6–12
          </p>
          <p className="text-gray-400 dark:text-gray-500">
            Built with Next.js, Tailwind CSS, Supabase
          </p>
        </div>
      </div>
    </footer>
  )
}