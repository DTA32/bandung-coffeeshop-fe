import { Link, useRouteContext } from '@tanstack/react-router'
// import { Languages, Sun } from 'lucide-react'

export default function Header() {
  const { ua } = useRouteContext({ from: '__root__' })
  if (ua.isMobile) return null
  return (
    <header className="sticky top-0 z-50 flex h-12 items-center justify-between border-b border-grove-light bg-cream px-6 md:px-16">
      <Link to="/" className="no-underline">
        <span className="text-xl font-bold text-[#2A3D22]">BDGCafé</span>
      </Link>

      <nav
        aria-label="Primary"
        className="flex items-center gap-4 md:gap-8 font-medium"
      >
        <Link to="/explore" className="text-sm text-moss no-underline">
          Explore
        </Link>
        {/* <Link to="/" className="text-sm text-moss no-underline">Directory</Link> */}
        <Link
          to="/meet-in-the-middle"
          className="text-sm text-moss no-underline"
        >
          Meet in the Middle
        </Link>
        <Link to="/about" className="text-sm text-moss no-underline">
          About
        </Link>
        {/* <Languages size={20} color="#4A7038" /> */}
        {/* <Sun size={20} color="#4A7038" /> */}
      </nav>
    </header>
  )
}
