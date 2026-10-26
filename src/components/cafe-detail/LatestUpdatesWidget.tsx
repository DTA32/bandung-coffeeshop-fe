import { useEffect, useState } from 'react'
import { ExternalLink, Images } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Image from '@/components/Image'
import ImageGallery from '@/components/ImageGallery'
import { useLocale, dateLocale } from '@/lib/locale'
import { formatRelativeTime } from '@/lib/time'
import type { CafeFeedItem } from '@/lib/api/cafe'

interface LatestUpdatesWidgetProps {
  items: CafeFeedItem[]
}

// Content longer than this (or with many line breaks) gets the more/less toggle.
const LONG_CONTENT_CHARS = 140
const LONG_CONTENT_LINES = 3

function FeedCard({ item }: { item: CafeFeedItem }) {
  const { t } = useTranslation()
  const locale = useLocale()
  const [expanded, setExpanded] = useState(false)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const isLong =
    item.content.length > LONG_CONTENT_CHARS ||
    item.content.split('\n').length > LONG_CONTENT_LINES
  const published = new Date(item.published_at).toLocaleString(
    dateLocale(locale),
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Jakarta',
    },
  )
  // Relative time ("2 days ago") is client-only: the server/prerender pass and
  // the first client render show the absolute date so hydration matches.
  const [relative, setRelative] = useState<string | null>(null)
  useEffect(() => {
    setRelative(
      formatRelativeTime(new Date(item.published_at), dateLocale(locale)),
    )
  }, [item.published_at, locale])
  const galleryImages = item.images.map((url) => ({ url, description: '' }))

  return (
    <article className="snap-start shrink-0 w-74 flex flex-col overflow-hidden rounded-2xl border border-grove-light bg-surface">
      {item.images.length > 0 && (
        <button
          type="button"
          onClick={() => setOpenIndex(0)}
          aria-label={t('cafe.viewImage', { number: 1 })}
          className="relative block w-full cursor-pointer border-none bg-transparent p-0"
        >
          <Image
            src={item.images[0]}
            alt=""
            layout="fullWidth"
            sizes="(min-width: 768px) 280px, 240px"
            className="w-full h-40 md:h-42 object-cover"
          />
          {item.images.length > 1 && (
            <span className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full bg-[#2a3d22cc] px-2 py-1 text-[10px] font-semibold text-white">
              <Images size={11} aria-hidden="true" />1 / {item.images.length}
            </span>
          )}
        </button>
      )}
      <div className="flex flex-col gap-2.5 px-4 pt-3.5 pb-4">
        <time
          dateTime={item.published_at}
          title={published}
          className="text-xs text-bark"
        >
          {relative ?? published}
        </time>
        <p
          className={`text-[13px] leading-[1.6] m-0 whitespace-pre-line text-moss-dark ${
            expanded ? '' : 'line-clamp-3'
          }`}
        >
          {item.content}
        </p>
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="self-start cursor-pointer border-none bg-transparent p-0 text-xs font-semibold text-moss hover:underline"
          >
            {expanded ? t('common.seeLess') : t('common.seeMore')}
          </button>
        )}
        {item.link && (
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 self-start text-xs font-semibold text-moss hover:underline"
          >
            {t('cafe.viewOriginalPost')}
            <ExternalLink size={12} aria-hidden="true" />
          </a>
        )}
      </div>
      {openIndex !== null && (
        <ImageGallery
          images={galleryImages}
          startIndex={openIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </article>
  )
}

export default function LatestUpdatesWidget({
  items,
}: LatestUpdatesWidgetProps) {
  const { t } = useTranslation()
  if (items.length === 0) return null

  return (
    <div className="bg-surface rounded-2xl p-5 flex flex-col gap-4 antialiased">
      <h2 className="text-base font-bold m-0 text-forest">
        {t('cafe.latestUpdates')}
      </h2>
      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory">
        {items.map((item) => (
          <FeedCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}
