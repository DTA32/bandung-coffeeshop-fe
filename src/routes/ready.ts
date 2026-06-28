import { createFileRoute } from '@tanstack/react-router'
import { API_BASE } from '@/lib/api'
import { logger } from '@/lib/telemetry/logger'

const READINESS_TIMEOUT_MS = 2000

function readinessTarget(): string {
  return process.env.READINESS_CHECK_URL ?? `${API_BASE}/health`
}

export const Route = createFileRoute('/ready')({
  server: {
    handlers: {
      GET: async () => {
        const target = readinessTarget()
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), READINESS_TIMEOUT_MS)

        try {
          const res = await fetch(target, { signal: controller.signal })
          if (!res.ok) {
            logger.warn('readiness_dependency_unhealthy', {
              dependency: 'api',
              target,
              'http.response.status_code': res.status,
            })
            return Response.json(
              { status: 'unready', dependency: 'api' },
              { status: 503 },
            )
          }
          return Response.json({ status: 'ready' })
        } catch (error) {
          logger.warn('readiness_dependency_unreachable', {
            dependency: 'api',
            target,
            error: error instanceof Error ? error.message : String(error),
          })
          return Response.json(
            { status: 'unready', dependency: 'api' },
            { status: 503 },
          )
        } finally {
          clearTimeout(timer)
        }
      },
    },
  },
})
