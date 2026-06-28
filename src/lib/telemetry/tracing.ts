import { logger } from './logger'

// OTel-shaped span helper. The signature mirrors
// `tracer.startActiveSpan(name, fn)` so call sites (loaders, server fns) won't
// change when OpenTelemetry is wired in — see ./otel.ts.
//
// Today it just times `fn` and emits a structured "span" log correlated to the
// active request context. // TODO(otel): swap the body for
// `trace.getTracer('app').startActiveSpan(name, async (span) => { ... })`
// once @opentelemetry/api is installed; callers stay identical.

export type SpanAttributes = Record<string, string | number | boolean>

export async function withSpan<T>(
  name: string,
  attributes: SpanAttributes,
  fn: () => Promise<T> | T,
): Promise<T> {
  const start = performance.now()
  try {
    const result = await fn()
    logger.debug('span', {
      'span.name': name,
      'span.status': 'ok',
      duration_ms: Math.round(performance.now() - start),
      ...attributes,
    })
    return result
  } catch (error) {
    logger.error('span', {
      'span.name': name,
      'span.status': 'error',
      duration_ms: Math.round(performance.now() - start),
      error: error instanceof Error ? error.message : String(error),
      ...attributes,
    })
    throw error
  }
}
