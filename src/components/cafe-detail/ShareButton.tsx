import { Share2 } from 'lucide-react'
import { useState } from 'react'
import { ClientOnly, useRouteContext } from '@tanstack/react-router'

function ShareButtonInternal({
  id,
  hideOnMobile,
}: {
  id: string
  hideOnMobile: boolean
}) {
  const { ua } = useRouteContext({ from: '__root__' })
  const isMobile = ua.isMobile
  const [showAlert, setShowAlert] = useState(false)

  function shareCafe({ cafeId }: { cafeId: string }) {
    const url = window.location.origin + '/cafe/' + cafeId
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setShowAlert(true)
        setTimeout(() => setShowAlert(false), 2000)
      })
      .catch((err) => {
        console.error('Failed to copy URL: ', err)
      })
  }

  if (hideOnMobile && isMobile) return null
  else if (!hideOnMobile && !isMobile) return null

  return (
    <>
      {showAlert && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-grove-light text-moss text-sm font-semibold px-4 py-2 rounded-md shadow-md z-50 transition-opacity duration-300">
          URL copied to clipboard!
        </div>
      )}
      <button
        className="text-xs font-semibold text-forest hover:underline cursor-pointer"
        onClick={() => shareCafe({ cafeId: id })}
      >
        <div className="flex items-center gap-1 bg-grove-light rounded-md px-3 py-1.5">
          <span className="text-xs font-semibold text-moss">Share</span>
          <Share2 size={12} className="shrink-0 text-moss" />
        </div>
      </button>
    </>
  )
}

export default function ShareButton({
  id,
  hideOnMobile,
}: {
  id: string
  hideOnMobile: boolean
}) {
  return (
    <ClientOnly fallback={<span></span>}>
      <ShareButtonInternal id={id} hideOnMobile={hideOnMobile} />
    </ClientOnly>
  )
}
