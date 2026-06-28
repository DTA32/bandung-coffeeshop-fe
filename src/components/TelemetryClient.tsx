import { useEffect } from 'react'
import { useRouter } from '@tanstack/react-router'

declare global {
  interface Window {
    gtag?: (...args: Array<unknown>) => void
  }
}

const ERROR_ENDPOINT = '/telemetry/error'
const NAV_ENDPOINT = '/telemetry/nav'

// Fire-and-forget beacon. sendBeacon survives page unload; fetch+keepalive is
// the fallback for the rare browser without it.
function beacon(endpoint: string, payload: unknown): void {
  if (typeof window === 'undefined') return
  const body = JSON.stringify(payload)
  if (typeof navigator.sendBeacon === 'function') {
    navigator.sendBeacon(endpoint, body)
  } else {
    void fetch(endpoint, { method: 'POST', body, keepalive: true })
  }
}

interface ClientErrorPayload {
  message: string
  stack?: string
  source: string
  path: string
}

// Used by the global handlers below and by the root error boundary in __root.tsx.
export function reportClientError(payload: ClientErrorPayload): void {
  beacon(ERROR_ENDPOINT, payload)
}

interface ClientNavPayload {
  fromPath?: string
  toPath: string
  toParams: string
  durationMs: number
  pathChanged: boolean
}

export function reportClientNavigation(payload: ClientNavPayload): void {
  beacon(NAV_ENDPOINT, payload)
}

// GA4 page_view for SPA navigation. The inline gtag snippet in __root.tsx loads
// in PROD only with `send_page_view: false`, so we own every page_view here
// (initial load + each client navigation), which avoids double-counting an auto
// hit plus a manual one. No-op in dev, where window.gtag is undefined.
function trackPageView(): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  // Defer a frame so the new route's <title> (applied on render) is current
  // before GA reads document.title.
  requestAnimationFrame(() => {
    window.gtag?.('event', 'page_view', {
      page_location: window.location.href,
      page_title: document.title,
    })
  })
}

/**
 * Client-only telemetry bootstrap. Renders nothing; all work happens in an
 * effect, so nothing executes during SSR. Covers the three signals the server
 * middleware can't see during SPA navigation:
 *   - real-user Web Vitals,
 *   - uncaught errors / unhandled promise rejections,
 *   - client-side navigation timing (the loader round-trip goes browser→backend
 *     directly, bypassing our server, so we measure it here via router events),
 *   - GA4 page_view on initial load + each SPA navigation (gtag's auto hit is
 *     disabled in __root.tsx, so page_views are sent from here).
 */
export default function TelemetryClient() {
  const router = useRouter()

  useEffect(() => {
    // Defer web-vitals to the client so the module never evaluates during SSR.
    void import('@/lib/telemetry/webVitals').then((m) => m.initWebVitals())

    // Initial landing page_view (config sets send_page_view:false, so this is
    // the only hit for the first page — no double count).
    trackPageView()

    const onError = (event: ErrorEvent) => {
      reportClientError({
        message: event.message,
        stack: event.error instanceof Error ? event.error.stack : undefined,
        source: 'window.onerror',
        path: window.location.pathname,
      })
    }

    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason
      reportClientError({
        message: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack : undefined,
        source: 'unhandledrejection',
        path: window.location.pathname,
      })
    }

    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)

    // Client-side navigation timing: mark the start, then measure to the point
    // loaders have resolved (data ready). Keyed by target href so a superseded
    // navigation doesn't report a bogus duration. The very first load has no
    // preceding onBeforeNavigate, so it's skipped (already covered server-side).
    let pending: { href: string; startedAt: number; fromPath?: string } | null =
      null

    const unsubStart = router.subscribe('onBeforeNavigate', (event) => {
      if (!event.hrefChanged) return
      pending = {
        href: event.toLocation.href,
        startedAt: performance.now(),
        fromPath: event.fromLocation?.pathname,
      }
    })

    const unsubResolved = router.subscribe('onResolved', (event) => {
      if (!pending || pending.href !== event.toLocation.href) return
      reportClientNavigation({
        fromPath: pending.fromPath,
        toPath: event.toLocation.pathname,
        toParams: event.toLocation.searchStr,
        durationMs: Math.round(performance.now() - pending.startedAt),
        pathChanged: event.pathChanged,
      })
      pending = null
      // GA4 page_view for this SPA navigation (gated on hrefChanged via pending).
      trackPageView()
    })

    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
      unsubStart()
      unsubResolved()
    }
  }, [router])

  return null
}
