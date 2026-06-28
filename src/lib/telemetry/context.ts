import { AsyncLocalStorage } from 'node:async_hooks'

// Built on W3C Trace Context (https://www.w3.org/TR/trace-context/).

export interface RequestContext {
  traceId: string
  spanId: string
  sampled: boolean
}

const storage = new AsyncLocalStorage<RequestContext>()

// 00-<32 hex trace-id>-<16 hex parent-span-id>-<2 hex flags>
const TRACEPARENT_RE = /^00-([0-9a-f]{32})-([0-9a-f]{16})-([0-9a-f]{2})$/

function randomHex(bytes: number): string {
  const buf = new Uint8Array(bytes)
  crypto.getRandomValues(buf)
  let out = ''
  for (const b of buf) out += b.toString(16).padStart(2, '0')
  return out
}

export function newTraceContext(): RequestContext {
  return { traceId: randomHex(16), spanId: randomHex(8), sampled: true }
}

// Continue an inbound trace if the caller sent a valid traceparent, otherwise
// start a fresh one. Either way we mint a new span id for this server hop.
export function traceContextFromHeader(header: string | null): RequestContext {
  if (!header) return newTraceContext()
  const match = TRACEPARENT_RE.exec(header.trim())
  if (!match) return newTraceContext()
  const [, traceId, , flags] = match
  // All-zero trace id is invalid per spec → treat as no context.
  if (/^0+$/.test(traceId)) return newTraceContext()
  return {
    traceId,
    spanId: randomHex(8),
    sampled: (Number.parseInt(flags, 16) & 0x01) === 0x01,
  }
}

export function formatTraceparent(ctx: RequestContext): string {
  return `00-${ctx.traceId}-${ctx.spanId}-${ctx.sampled ? '01' : '00'}`
}

export function runWithContext<T>(ctx: RequestContext, fn: () => T): T {
  return storage.run(ctx, fn)
}

export function getRequestContext(): RequestContext | undefined {
  return storage.getStore()
}
