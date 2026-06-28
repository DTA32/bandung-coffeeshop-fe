import {
  Counter,
  Histogram,
  Registry,
  collectDefaultMetrics,
} from 'prom-client'

// Single Prometheus registry shared by the metrics route and the request
// middleware. prom-client handles the histogram bucketing and exposition
// format, which is fiddly to get right by hand.

export const registry = new Registry()

// Process/runtime metrics: CPU, resident memory, event-loop lag, GC, etc.
collectDefaultMetrics({ register: registry })

const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests handled by the server.',
  labelNames: ['method', 'route', 'status'] as const,
  registers: [registry],
})

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds.',
  labelNames: ['method', 'route', 'status'] as const,
  buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [registry],
})

export interface HttpMetric {
  method: string
  route: string
  status: number
  durationMs: number
}

export function recordHttp({
  method,
  route,
  status,
  durationMs,
}: HttpMetric): void {
  const labels = { method, route, status: String(status) }
  httpRequestsTotal.inc(labels)
  httpRequestDuration.observe(labels, durationMs / 1000)
}

// Collapse high-cardinality path segments (ids, slugs, hashes) so the `route`
// label stays bounded — otherwise every cafe id would spawn a new time series.
export function normalizeRoute(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, '')
  if (trimmed === '') return '/'
  return trimmed
    .split('/')
    .map((seg) =>
      /^[0-9]+$/.test(seg) || /^[0-9a-f-]{12,}$/i.test(seg) ? ':id' : seg,
    )
    .join('/')
}

export async function renderMetrics(): Promise<{
  body: string
  contentType: string
}> {
  return { body: await registry.metrics(), contentType: registry.contentType }
}
