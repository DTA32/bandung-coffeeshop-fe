import {Link} from "@tanstack/react-router";

export default function Footer() {
  return (
    <footer className="bg-forest-light text-forest text-sm py-4 mt-8 px-6 md:px-16 flex flex-col gap-4">
      <div className="w-full flex flex-col md:flex-row gap-2">
        <div className="flex-1 mb-4 md:mb-0">
          <Link to={"/"} className="text-lg font-bold mb-2">BDGCafé</Link>
          <p>Discover the best cafes in Bandung for remote work and hanging out with friends. Find your perfect spot today!</p>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <h3 className="font-semibold">Contact Us</h3>
          <p>Email: <a href="mailto:contact@mraditya.my.id" className="text-moss hover:underline">contact@mraditya.my.id</a></p>
        </div>
      </div>
      <p>&copy; 2026 DTA32. All rights reserved.</p>
    </footer>
  )
}