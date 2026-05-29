import type { CafeImage } from '@/lib/api/cafe'
import MapPreview from '@/components/cafe-detail/MapPreview'

interface CafeHeroProps {
  image: CafeImage[] | null
  cafeName: string
  gmapsId: string | null
}

export default function CafeHero({ image, cafeName, gmapsId }: CafeHeroProps) {
  return (
    <div className="relative h-70 md:h-75 w-full">
      {image && image.length > 0 && (
        <div className="h-full overflow-scroll flex gap-2">
          {image.map((img, index) => {
            const imageWidth = image.length > 1 ? 60 : 100
            return (
              <figure
                key={index}
                className={`flex-shrink-0 relative`}
                style={{ width: imageWidth + '%' }}
              >
                <img
                  key={index}
                  src={img.url}
                  alt={img.alt}
                  className="w-full h-full object-cover"
                />
                {img.alt && (
                  <figcaption className="absolute bottom-0 left-0 py-1 m-2 z-5 bg-black/50 text-white text-xs px-1 rounded select-none">
                    {img.alt}
                  </figcaption>
                )}
              </figure>
            )
          })}
        </div>
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
