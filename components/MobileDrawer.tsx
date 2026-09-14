'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export function MobileDrawer() {
  const [isOpen, setIsOpen] = useState(false)

  const toggle = () => setIsOpen(!isOpen)

  return (
    <>
      <button onClick={toggle} className="p-2 md:hidden">
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 p-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
          <Link href="/ncert" onClick={toggle} className="block">NCERT</Link>
          <Link href="/state-boards" onClick={toggle} className="block">State Boards</Link>
          <Link href="/results" onClick={toggle} className="block">Results</Link>
          <Link href="/rojgar-samachar" onClick={toggle} className="block">Rojgar Samachar</Link>
        </div>
      )}
    </>
  )
}