import { Link } from '@tanstack/react-router'

export default function Footer() {
  return (
    <footer className="bg-forest-lighter text-forest text-sm py-4 px-6 md:px-16 flex flex-col gap-2">
      <div className="w-full flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Link to={'/'} className="text-lg font-bold mb-2">
            BDGCafé
          </Link>
          <p className="text-bark">
            Discover the best cafes in Bandung for remote work and hanging out
            with friends. Find your perfect spot today!
          </p>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <h3 className="font-semibold">Quick Links</h3>
          <ul className="text-bark">
            <li>
              <Link
                to="/explore/$"
                params={{ _splat: 'bandung-utara' }}
                className="text-moss hover:underline"
              >
                Cafe in Bandung Utara
              </Link>
            </li>
            <li>
              <Link
                to="/explore/$"
                params={{ _splat: 'bandung-tengah/riau' }}
                className="text-moss hover:underline"
              >
                Cafe in Riau
              </Link>
            </li>
            <li>
              <Link
                to="/explore/$"
                params={{ _splat: 'bandung-tengah/riau/gedung-sate' }}
                className="text-moss hover:underline"
              >
                Cafe near Gedung Sate
              </Link>
            </li>
            <li>
              <Link to="/about" className="text-moss hover:underline">
                About us
              </Link>
            </li>
          </ul>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <h3 className="font-semibold">Contact Us</h3>
          <p className="text-bark">
            Email:{' '}
            <a
              href="mailto:contact@mraditya.my.id"
              className="text-moss hover:underline"
            >
              contact@mraditya.my.id
            </a>
          </p>
        </div>
      </div>
      <p className="text-bark">&copy; 2026 DTA32. All rights reserved.</p>
    </footer>
  )
}
