import { createMiddleware } from '@tanstack/react-start'
import {
  formatTraceparent,
  runWithContext,
  traceContextFromHeader,
} from '@/lib/telemetry/context'
import { logger } from '@/lib/telemetry/logger'
import { normalizeRoute, recordHttp } from '@/lib/telemetry/metrics'

// Infra paths polled frequently by load balancers / Prometheus. Still served,
// but skipped for access logs + metrics so they don't drown the real signal.
const SILENT_PATHS = new Set([
  '/health',
  '/ready',
  '/metrics',
  '/telemetry/vitals',
  '/telemetry/nav',
  '/telemetry/error',
])

const requestLogger = createMiddleware().server(async ({ request, next }) => {
  const { pathname } = new URL(request.url)
  // Continue an inbound distributed trace, or start a fresh one.
  const ctx = traceContextFromHeader(request.headers.get('traceparent'))

  return runWithContext(ctx, async () => {
    const start = performance.now()
    const route = normalizeRoute(pathname)
    const silent = SILENT_PATHS.has(pathname)

    try {
      const result = await next()
      const durationMs = Math.round(performance.now() - start)
      const status = result.response.status

      // Echo trace context so clients/proxies can correlate this request.
      result.response.headers.set('traceparent', formatTraceparent(ctx))

      if (!silent) {
        recordHttp({ method: request.method, route, status, durationMs })
        logger.info('http_request', {
          'http.request.method': request.method,
          'url.full': request.url,
          'url.path': pathname,
          'http.route': route,
          'http.response.status_code': status,
          duration_ms: durationMs,
        })
      }

      return result
    } catch (error) {
      const durationMs = Math.round(performance.now() - start)
      if (!silent) {
        recordHttp({ method: request.method, route, status: 500, durationMs })
      }
      logger.error('http_request_failed', {
        'http.request.method': request.method,
        'url.full': request.url,
        'http.route': route,
        duration_ms: durationMs,
        error: error instanceof Error ? error.message : String(error),
        ...(error instanceof Error && error.stack
          ? { 'error.stack': error.stack }
          : {}),
      })
      throw error
    }
  })
})

export { requestLogger }
