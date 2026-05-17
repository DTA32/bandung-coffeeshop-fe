import { Map } from 'lucide-react'

const API_KEY = 'AIzaSyA5c3DX5h3qiGBOEF_kRaE05QN0kNCuQgA'

export default function MapPreview({
  cafeName,
  placeId,
  additionalClass,
  withAlternateButton = false,
}: {
  cafeName: string
  placeId: string
  additionalClass?: string
  withAlternateButton?: boolean
}) {
  return (
    <>
      <iframe
        className={`bg-white rounded-xl border border-grove-light overflow-hidden shadow-sm 
          ${additionalClass || ''}
          ${withAlternateButton ? 'invisible md:visible' : ''}
        `}
        height={180}
        src={`https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=place_id:${placeId}`}
      />
      {withAlternateButton && (
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cafeName)}&query_place_id=${placeId}`}
          className="md:invisible absolute right-6 top-4 w-fit bg-white rounded-lg  overflow-hidden shadow-sm text-moss py-2 px-3 flex items-center gap-1 text-xs"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Map size={12} />
          <span>Open in Maps</span>
        </a>
      )}
    </>
  )
}
