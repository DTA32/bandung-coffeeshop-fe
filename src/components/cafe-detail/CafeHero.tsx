import {useState} from 'react'
import type {CafeImage} from '@/lib/api/cafe'
import MapPreview from '@/components/cafe-detail/MapPreview'
import CafeImageGallery from '@/components/cafe-detail/CafeImageGallery'
import {Info} from "lucide-react";
import ShareButton from "@/components/cafe-detail/ShareButton";

interface CafeHeroProps {
  id: string
  name: string
  address: string | null
  isSubjective: boolean
  image: CafeImage[] | null
  gmapsId: string | null
}

function WithImage(
  {image, name, gmapsId}: { image: CafeImage[]; name: string; gmapsId: string | null }
) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="relative h-70 md:h-75 w-full">
      <div className="h-full overflow-scroll flex gap-2">
        {image.map((img, index) => {
          const imageWidth = image.length > 1 ? 60 : 100
          return (
            <figure
              key={index}
              className={`flex-shrink-0 relative cursor-pointer`}
              style={{width: imageWidth + '%'}}
              onClick={() => setOpenIndex(index)}
            >
              <img
                key={index}
                src={img.url}
                alt={img.description}
                className="w-full h-full object-cover"
              />
              {img.description && (
                <figcaption
                  className="absolute bottom-0 left-0 py-1 m-2 z-5 bg-black/50 text-white text-xs px-1 rounded select-none">
                  {img.description}
                </figcaption>
              )}
            </figure>
          )
        })}
      </div>
      {gmapsId && (
        <MapPreview
          cafeName={name}
          placeId={gmapsId}
          additionalClass={'absolute right-16 top-24'}
          withAlternateButton={true}
        />
      )}
      {openIndex !== null && (
        <CafeImageGallery
          images={image}
          startIndex={openIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </div>
  )
}

function WithoutImage({
                        id,
                        name,
                        address,
                        isSubjective,
                        gmapsId,
                      }: Pick<CafeHeroProps, 'id' | 'name' | 'address' | 'isSubjective' | 'gmapsId'>) {
  return (
    <div className="h-fit md:h-75 w-full flex flex-col md:flex-row px-6 md:px-16 mt-8 md:mt-0 gap-8">
      <div className="flex flex-col md:flex-row items-center gap-2 h-full w-full">
        <div className="flex w-full flex-col gap-4.5">
          <h1 className="text-3xl font-bold text-forest m-0">{name}</h1>
          {address && <p className="text-sm text-bark m-0">{address}</p>}
          <div className="flex gap-2 min-w-fit">
            {isSubjective && (
              <div
                className="flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-md shrink-0">
                <Info size={13}/>
                <span>Highly subjective review</span>
              </div>
            )}
            <ShareButton id={id} hideOnMobile={false}/>
          </div>
        </div>
      </div>
      <div className="flex gap-2 justify-center flex-col h-full">
        <div className="w-full flex justify-end">
          <ShareButton id={id} hideOnMobile={true}/>
        </div>
        {gmapsId && (
          <MapPreview
            cafeName={name}
            placeId={gmapsId}
            additionalClass={'w-full md:w-75'}
            withAlternateButton={false}
          />
        )}
      </div>
    </div>
  )
}

export default function CafeHero(props: CafeHeroProps) {
  const {id, name, address, isSubjective, image, gmapsId} = props

  if (image && image.length > 0) {
    return <WithImage image={image} name={name} gmapsId={gmapsId}/>
  } else {
    return <WithoutImage id={id} name={name} address={address} isSubjective={isSubjective} gmapsId={gmapsId}/>
  }
}