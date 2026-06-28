import { createFileRoute } from '@tanstack/react-router'
import { logger } from '@/lib/telemetry/logger'

// Beacon sink for client-side errors: uncaught window errors, unhandled promise
// rejections, and React render errors caught by the root error boundary (see
// src/components/TelemetryClient.tsx and src/routes/__root.tsx).
export const Route = createFileRoute('/telemetry/error')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const payload = (await request.json()) as Record<string, unknown>
          logger.error('client_error', {
            'error.message': payload.message,
            'error.stack': payload.stack,
            'error.source': payload.source,
            'url.path': payload.path,
            'user_agent.original': request.headers.get('user-agent'),
          })
        } catch {
          // Beacon bodies are best-effort; ignore malformed payloads.
        }
        return new Response(null, { status: 204 })
      },
    },
  },
})
