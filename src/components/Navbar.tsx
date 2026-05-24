import {Link, useRouteContext} from '@tanstack/react-router'
import {Book, Compass, Home, MapPin} from "lucide-react";

export default function Navbar() {
  const { ua } = useRouteContext({ from: '__root__' })
  if (!ua.isMobile) return null
  return (
    <nav className="sticky bottom-5 z-1000 flex h-16 items-center bg-white font-medium border border-grove-light rounded-full mx-6 text-xs  text-bark no-underline text-center *:px-4 *:w-full">
        <Link to="/" className="flex flex-col items-center">
          <Home size={14}/>
          <span>Home</span>
        </Link>
        <Link to="/explore" className="flex flex-col items-center">
          <Compass size={14}/>
          <span>Explore</span>
        </Link>
       {/*<Link to="/" className="flex flex-col items-center">*/}
       {/*  <Book size={14}/>*/}
       {/*  <span>Directory</span>*/}
       {/*</Link>*/}
        <Link
          to="/meet-in-the-middle"
          className="flex flex-col items-center"
        >
          <MapPin size={14}/>
          <span className="truncate">Meet in</span>
          <span className="truncate">the Middle</span>
        </Link>
    </nav>
  )
}
