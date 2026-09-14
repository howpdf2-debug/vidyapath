import Link from 'next/link'

export function Breadcrumb({ items }: { items: { label: string; href: string }[] }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-2">
          {index > 0 && <span>/</span>}
          {index === items.length - 1 ? (
            <span className="text-gray-800 dark:text-white font-medium">{item.label}</span>
          ) : (
            <Link href={item.href} className="hover:text-indigo-600">
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}