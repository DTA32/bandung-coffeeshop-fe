import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals'
import type { Metric } from 'web-vitals'

// Real-user Core Web Vitals (LCP, INP, CLS) + FCP/TTFB. Loaded via dynamic
// import from TelemetryClient inside an effect, so it's code-split into a
// client-only chunk and never evaluates during SSR. Metrics are POSTed to
// /telemetry/vitals with sendBeacon so they survive page unload (important for
// CLS/LCP, which finalize late).

const ENDPOINT = '/telemetry/vitals'

function report(metric: Metric): void {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    path: window.location.pathname,
  })

  if (typeof navigator.sendBeacon === 'function') {
    navigator.sendBeacon(ENDPOINT, body)
  } else {
    void fetch(ENDPOINT, { method: 'POST', body, keepalive: true })
  }
}

export function initWebVitals(): void {
  onCLS(report)
  onINP(report)
  onLCP(report)
  onFCP(report)
  onTTFB(report)
}
