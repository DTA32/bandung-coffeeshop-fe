import {Info} from 'lucide-react'
import ShareButton from "@/components/cafe-detail/ShareButton";
import MapPreview from "@/components/cafe-detail/MapPreview";

interface CafeHeroNoImageProps {
  id: string
  name: string
  address: string | null
  isSubjective: boolean
  gmapsId: string | null
}

export default function CafeHeroNoImage({
                                          id,
                                          name,
                                          address,
                                          isSubjective,
                                          gmapsId,
                                        }: CafeHeroNoImageProps) {
  return (
    <div className="h-fit md:h-75 w-full flex flex-col md:flex-row px-6 md:px-16 mt-8 md:mt-0 gap-8">
      <div className="flex flex-col md:flex-row items-center gap-2 h-full w-full">
        <div className="flex w-full flex-col gap-4.5">
          <h1 className="text-3xl font-bold text-forest m-0">{name}</h1>
          {address &&
              <p className="text-sm text-bark m-0">{address}</p>
          }
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
        {gmapsId && <MapPreview cafeName={name} placeId={gmapsId} additionalClass={"w-full md:w-75"}
                                withAlternateButton={false}/>}
      </div>
    </div>
  )
}
