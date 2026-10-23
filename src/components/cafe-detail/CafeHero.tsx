import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Image from '@/components/Image'
import ImageGallery from '@/components/ImageGallery'
import MapPreview from './MapPreview'
import ShareButton from './ShareButton'
import type { LocationImage } from '@/lib/type'
import { parseImageHash, setImageHash } from '@/lib/galleryHash'

interface CafeHeroProps {
  id: string
  name: string
  address: string | null
  image: LocationImage[] | null
  gmapsId: string | null
}

function WithImage({
  image,
  name,
  gmapsId,
}: {
  image: LocationImage[]
  name: string
  gmapsId: string | null
}) {
  const { t } = useTranslation()
  // `nonce` remounts the gallery when the hash (not the gallery itself)
  // requests a specific image.
  const [open, setOpen] = useState<{ index: number; nonce: number } | null>(
    null,
  )
  const count = image.length

  const openFromHash = useCallback(
    (index: number) =>
      setOpen((cur) => ({ index, nonce: (cur?.nonce ?? 0) + 1 })),
    [],
  )

  const openAt = (index: number) => {
    setOpen((cur) => ({ index, nonce: (cur?.nonce ?? 0) + 1 }))
    setImageHash(index)
  }

  const close = useCallback(() => {
    setOpen(null)
    setImageHash(null)
  }, [])

  // Deep links: #image-N on load (after hydration), on hashchange, and on
  // clicks of in-page #image-N links (covers the hash already being set).
  useEffect(() => {
    const initial = parseImageHash(window.location.hash, count)
    if (initial !== null) openFromHash(initial)

    const onHashChange = () => {
      const i = parseImageHash(window.location.hash, count)
      if (i !== null) openFromHash(i)
    }
    const onClick = (e: MouseEvent) => {
      if (!(e.target instanceof Element)) return
      const a = e.target.closest('a[href^="#image-"]')
      const i = parseImageHash(a?.getAttribute('href') ?? '', count)
      if (i === null) return
      e.preventDefault()
      openFromHash(i)
      setImageHash(i)
    }
    window.addEventListener('hashchange', onHashChange)
    document.addEventListener('click', onClick)
    return () => {
      window.removeEventListener('hashchange', onHashChange)
      document.removeEventListener('click', onClick)
    }
  }, [count, openFromHash])

  return (
    <div className="relative h-70 md:h-75 w-full">
      <div className="h-full overflow-scroll flex gap-2">
        {image.map((img, index) => {
          const imageWidth = image.length > 1 ? 60 : 100
          return (
            <button
              key={index}
              type="button"
              onClick={() => openAt(index)}
              aria-label={t('cafe.viewPhotosOf', { name })}
              className="flex-shrink-0 block cursor-pointer border-none bg-transparent p-0"
              style={{ width: imageWidth + '%' }}
            >
              <figure className="relative m-0 h-full w-full">
                <Image
                  src={img.url}
                  alt={img.description || t('cafe.photoOf', { name })}
                  layout="fullWidth"
                  priority={index === 0}
                  sizes={`${imageWidth}vw`}
                  className="w-full h-full object-cover"
                />
                {img.description && (
                  <figcaption className="absolute bottom-0 left-0 py-1 m-2 z-5 bg-black/50 text-white text-xs px-1 rounded select-none">
                    {img.description}
                  </figcaption>
                )}
              </figure>
            </button>
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
      {open !== null && (
        <ImageGallery
          key={open.nonce}
          images={image}
          startIndex={open.index}
          onIndexChange={setImageHash}
          onClose={close}
        />
      )}
    </div>
  )
}

function WithoutImage({
  id,
  name,
  address,
  gmapsId,
}: Pick<CafeHeroProps, 'id' | 'name' | 'address' | 'gmapsId'>) {
  return (
    <div className="h-fit md:h-75 w-full flex flex-col md:flex-row px-6 md:px-16 mt-8 md:mt-0 gap-8">
      <div className="flex flex-col md:flex-row items-center gap-2 h-full w-full">
        <div className="flex w-full flex-col gap-4.5">
          <h1 className="text-3xl font-bold text-forest m-0">{name}</h1>
          {address && <p className="text-sm text-bark m-0">{address}</p>}
          <div className="flex gap-2 min-w-fit">
            <ShareButton id={id} hideOnMobile={false} />
          </div>
        </div>
      </div>
      <div className="flex gap-2 justify-center flex-col h-full">
        <div className="w-full flex justify-end">
          <ShareButton id={id} hideOnMobile={true} />
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
  const { id, name, address, image, gmapsId } = props

  if (image && image.length > 0) {
    return <WithImage image={image} name={name} gmapsId={gmapsId} />
  } else {
    return (
      <WithoutImage id={id} name={name} address={address} gmapsId={gmapsId} />
    )
  }
}
