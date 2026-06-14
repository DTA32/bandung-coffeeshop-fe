import type { LocationData } from '@/lib/api/location'

// A location's heading: "Welcome to <name>" when the location opts in, otherwise
// just the name. The caller controls the <h1> styling via `className`.
export default function WelcomeHeading({
  location,
  className,
}: {
  location: LocationData
  className?: string
}) {
  return (
    <h1 className={className}>
      {location.show_welcome_text && (
        <span className="font-normal">Welcome to&nbsp;</span>
      )}
      {location.name}
    </h1>
  )
}
