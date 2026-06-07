import { useEffect, useRef, useState } from 'react'
import type { TouchEvent } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { ClientOnly } from '@tanstack/react-router'
import type { LocationImage } from '@/lib/type'

interface CafeImageGalleryProps {
  images: LocationImage[]
  startIndex: number
  onClose: () => void
}

const SWIPE_THRESHOLD = 50

function CafeImageGalleryInternal({
  images,
  startIndex,
  onClose,
}: CafeImageGalleryProps) {
  const [index, setIndex] = useState(startIndex)
  const touchStartX = useRef<number | null>(null)
  const hasMultiple = images.length > 1

  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length)
  const next = () => setIndex((i) => (i + 1) % images.length)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [images.length, onClose])

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  function handleTouchStart(e: TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: TouchEvent) {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      if (delta > 0) prev()
      else next()
    }
    touchStartX.current = null
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery"
      className="fixed inset-0 z-[3000] flex flex-col bg-black/90"
      onClick={onClose}
    >
      <div className="flex items-center justify-between p-4 text-white">
        <span className="text-sm font-semibold select-none">
          {index + 1} / {images.length}
        </span>
        <button
          aria-label="Close"
          onClick={onClose}
          className="cursor-pointer rounded-full p-1 hover:bg-white/10"
        >
          <X size={24} />
        </button>
      </div>

      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden px-4"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {hasMultiple && (
          <button
            aria-label="Previous image"
            onClick={prev}
            className="absolute left-2 z-10 cursor-pointer rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
          >
            <ChevronLeft size={28} />
          </button>
        )}

        <figure className="flex h-full max-h-full flex-col items-center justify-center">
          <img
            src={images[index].url}
            alt={images[index].description}
            className="h-[95%] max-w-full object-contain"
          />
          {images[index].description && (
            <figcaption className="mt-2 max-w-2xl text-center text-sm text-white/80 select-none">
              {images[index].description}
            </figcaption>
          )}
        </figure>

        {hasMultiple && (
          <button
            aria-label="Next image"
            onClick={next}
            className="absolute right-2 z-10 cursor-pointer rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
          >
            <ChevronRight size={28} />
          </button>
        )}
      </div>

      {hasMultiple && (
        <div
          className="flex gap-2 overflow-x-auto p-4"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, i) => (
            <button
              key={i}
              aria-label={`View image ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-16 w-20 flex-shrink-0 cursor-pointer overflow-hidden rounded ${
                i === index
                  ? 'ring-2 ring-white'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={img.url}
                alt={img.description}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body,
  )
}

export default function CafeImageGallery(props: CafeImageGalleryProps) {
  return (
    <ClientOnly>
      <CafeImageGalleryInternal {...props} />
    </ClientOnly>
  )
}
