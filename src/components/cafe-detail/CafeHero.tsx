import type { CafeImage } from '@/lib/api/cafe'
import MapPreview from '@/components/cafe-detail/MapPreview'

interface CafeHeroProps {
  image: CafeImage[] | null
  cafeName: string
  gmapsId: string | null
}

export default function CafeHero({ image, cafeName, gmapsId }: CafeHeroProps) {
  return (
    <div className="relative h-75 w-full">
      {image && image.length > 0 && (
        <img
          src={image[0].url}
          alt={image[0].alt}
          className="w-full h-full object-cover"
        />
      )}
      {gmapsId && (
        <MapPreview
          cafeName={cafeName}
          placeId={gmapsId}
          additionalClass={'absolute right-16 top-24'}
          withAlternateButton={true}
        />
      )}
    </div>
  )
}
