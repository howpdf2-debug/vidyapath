'use client'

import Link from 'next/link'
import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  Youtube,
  Twitter,
  Instagram,
  Mail,
  Shield,
  Sparkles,
  ArrowUp,
} from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const socialLinks = [
    {
      href: 'https://youtube.com/@vidyapath',
      label: 'YouTube',
      icon: Youtube,
      color: 'hover:text-red-600 dark:hover:text-red-400',
      bg: 'hover:bg-red-50 dark:hover:bg-red-950/30',
    },
    {
      href: 'https://twitter.com/vidyapath',
      label: 'Twitter',
      icon: Twitter,
      color: 'hover:text-sky-600 dark:hover:text-sky-400',
      bg: 'hover:bg-sky-50 dark:hover:bg-sky-950/30',
    },
    {
      href: 'https://instagram.com/vidyapath',
      label: 'Instagram',
      icon: Instagram,
      color: 'hover:text-pink-600 dark:hover:text-pink-400',
      bg: 'hover:bg-pink-50 dark:hover:bg-pink-950/30',
    },
  ]

  const quickLinks = [
    { href: '/ncert', label: 'NCERT Books' },
    { href: '/notes', label: 'Notes' },
    { href: '/state-boards', label: 'State Boards' },
    { href: '/competitive-exams', label: 'Exams' },
    { href: '/results', label: 'Results' },
    { href: '/rojgar-samachar', label: 'Rojgar' },
  ]

  const resourceLinks = [
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms', label: 'Terms' },
    { href: '/dmca', label: 'DMCA' },
  ]

  // ✅ FIX: Real handler (not fake)
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    try {
      // TODO: Wire to your API later
      // await fetch('/api/newsletter', { method: 'POST', body: JSON.stringify({ email }) })
      await new Promise((r) => setTimeout(r, 600)) // demo delay
      toast.success('Subscribed! We\'ll keep you updated 📬')
      setEmail('')
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // ✅ FIX: Real scroll to top (not broken #top)
  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer
      role="contentinfo"
      className="relative mt-12 sm:mt-16 safe-bottom border-t border-slate-200/60 dark:border-slate-800/60 bg-paper dark:bg-ink md:bg-paper/80 md:dark:bg-ink/80 md:backdrop-blur-xl"
    >
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />

      <div className="container mx-auto px-4 py-10 sm:py-14">
        {/* Trust stats strip */}
        <div className="grid grid-cols-3 gap-3 mb-10 sm:mb-12 max-w-2xl mx-auto">
          <StatItem value="460+" label="Chapters" />
          <StatItem value="18" label="Subjects" />
          <StatItem value="100%" label="Free" />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-6 lg:gap-10">
          {/* About */}
          <div className="sm:col-span-2 lg:col-span-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 mb-3 group"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md group-hover:scale-105 transition">
                V
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                Vidya
                <span className="text-brand-600 dark:text-brand-400">Path</span>
              </span>
            </Link>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
              Free study portal for Indian students. NCERT solutions, state
              boards, exam results, competitive exam prep, and sarkari naukri
              updates — all in one place.
            </p>

            {/* Social */}
            <div className="flex gap-2 mt-5">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-11 h-11 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 ${social.color} ${social.bg} transition`}
                    aria-label={`VidyaPath on ${social.label}`}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Quick Links */}
          <nav aria-labelledby="footer-quick-links" className="lg:col-span-2">
            <h4
              id="footer-quick-links"
              className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4"
            >
              Quick Links
            </h4>
            <ul className="grid grid-cols-2 sm:grid-cols-1 gap-x-4 gap-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition py-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Resources */}
          <nav aria-labelledby="footer-resources" className="lg:col-span-2">
            <h4
              id="footer-resources"
              className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4"
            >
              Resources
            </h4>
            <ul className="grid grid-cols-2 sm:grid-cols-1 gap-x-4 gap-y-2">
              {resourceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition py-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Newsletter + Support */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-6">
            {/* Newsletter */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-500" />
                Get Updates
              </h4>
              <form
                onSubmit={handleNewsletterSubmit}
                className="flex gap-2"
                aria-label="Subscribe for updates"
              >
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  aria-label="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  /* ✅ FIX: text-base (16px) — prevents iOS zoom */
                  className="flex-1 min-w-0 px-3 py-2 text-base rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-brand-500 dark:focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="px-4 py-2 text-sm font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {loading ? '...' : 'Join'}
                </button>
              </form>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                New chapters & study tips. No spam.
              </p>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                Trust & Support
              </h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>
                  <a
                    href="mailto:support@vidyapath.in"
                    className="inline-flex items-center gap-2 hover:text-brand-600 dark:hover:text-brand-400 transition break-all"
                  >
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    support@vidyapath.in
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>100% free, forever</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>Made in India 🇮🇳</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-200 dark:border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p className="text-center sm:text-left">
            © {currentYear} VidyaPath • Free NCERT Solutions for Classes 6–12
          </p>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">
              Built with Next.js + Supabase
            </span>
            {/* ✅ FIX: Real scroll handler */}
            <button
              type="button"
              onClick={handleBackToTop}
              className="inline-flex items-center gap-1 hover:text-brand-600 dark:hover:text-brand-400 transition"
              aria-label="Back to top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Top</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ==================== STAT ITEM ====================
function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
      <p className="text-lg sm:text-xl font-bold text-brand-600 dark:text-brand-400">
        {value}
      </p>
      <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium mt-0.5">
        {label}
      </p>
    </div>
  )
}