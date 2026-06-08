'use client'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

const navLinks = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/ncert', label: 'NCERT', icon: '📗' },
  { href: '/cbse', label: 'CBSE', icon: '📘' },
  { href: '/state-boards', label: 'State Boards', icon: '🏛️' },
  { href: '/icse', label: 'ICSE/ISC', icon: '📙' },
  { href: '/results', label: 'Results', icon: '🏆' },
  { href: '/sarkari-naukri', label: 'Sarkari Naukri', icon: '💼' },
  { href: '/career', label: 'Career', icon: '🎓' },
  { href: '/news', label: 'News', icon: '📰' },
  { href: '/worksheets', label: 'Worksheets', icon: '📋' },
  { href: '/books', label: 'Books', icon: '📚' },
  { href: '/tools', label: 'Tools', icon: '🛠️' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-orange-100">
      <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-md">
            <span className="text-white text-xl">📚</span>
          </div>
          <span className="font-black text-xl tracking-tight">
            Vidya<span className="gradient-text">Path</span>
          </span>
        </Link>

        <div className="hidden md:flex gap-1 bg-gray-50/50 p-1 rounded-full">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full text-gray-700 hover:bg-gradient-to-r hover:from-orange-100 hover:to-pink-100 transition"
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 rounded-full bg-orange-50">
          <Menu size={22} className="text-orange-600" />
        </button>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl rounded-l-2xl flex flex-col">
            <div className="flex justify-between items-center p-5 border-b">
              <span className="font-black text-xl">VidyaPath</span>
              <button onClick={() => setMobileOpen(false)} className="p-1 rounded-full bg-gray-100">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50 transition"
                >
                  <span className="text-xl">{link.icon}</span>
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}