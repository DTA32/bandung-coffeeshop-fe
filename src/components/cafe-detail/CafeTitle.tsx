import { Info } from 'lucide-react'
import ShareButton from '@/components/cafe-detail/ShareButton'

interface CafeTitleProps {
  id: string
  name: string
  address: string | null
  isSubjective: boolean
}

export default function CafeTitle({
  id,
  name,
  address,
  isSubjective,
}: CafeTitleProps) {
  return (
    <div className="flex flex-col lg:flex-row items-start gap-2">
      <div className="flex w-full flex-col gap-1">
        <div className="flex w-full justify-between items-center">
          <h1 className="text-3xl font-bold text-forest m-0">{name}</h1>
          <ShareButton id={id} hideOnMobile={false} />
        </div>
        {address && <p className="text-sm text-bark m-0">{address}</p>}
      </div>
      <div className="flex gap-2 min-w-fit">
        {isSubjective && (
          <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-md shrink-0">
            <Info size={13} aria-hidden="true" />
            <span>Highly subjective review</span>
          </div>
        )}
        <ShareButton id={id} hideOnMobile={true} />
      </div>
    </div>
  )
}
