import { getRequestContext } from './context'

// Structured JSON logger. One JSON object per line so logs are queryable in any
// aggregator (Loki, CloudWatch, Datadog, ...). Trace ids are pulled from the
// active request context automatically, so every log emitted while handling a
// request is correlated without the caller threading ids through.

type LogLevel = 'debug' | 'info' | 'warn' | 'error'
type Fields = Record<string, unknown>

function emit(level: LogLevel, message: string, fields?: Fields): void {
  const ctx = getRequestContext()
  const record: Record<string, unknown> = {
    ts: new Date().toISOString(),
    level,
    message,
    ...(ctx ? { trace_id: ctx.traceId, span_id: ctx.spanId } : {}),
    ...fields,
  }
  const line = JSON.stringify(record)
  if (level === 'error') console.error(line)
  else if (level === 'warn') console.warn(line)
  else console.log(line)
}

export const logger = {
  debug: (message: string, fields?: Fields) => emit('debug', message, fields),
  info: (message: string, fields?: Fields) => emit('info', message, fields),
  warn: (message: string, fields?: Fields) => emit('warn', message, fields),
  error: (message: string, fields?: Fields) => emit('error', message, fields),
}
