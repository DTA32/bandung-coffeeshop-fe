import { createFileRoute } from '@tanstack/react-router'
import { logger } from '@/lib/telemetry/logger'

// Beacon sink for client-side (SPA) navigation timing. Server middleware can't
// observe soft navigations — the loader's data fetch goes browser→backend
// directly — so TelemetryClient measures them via router events and posts here
// (see src/components/TelemetryClient.tsx).
export const Route = createFileRoute('/telemetry/nav')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const nav = (await request.json()) as Record<string, unknown>
          logger.info('client_navigation', {
            'navigation.from': nav.fromPath,
            'navigation.to': nav.toPath,
            'navigation.to_params': nav.toParams,
            'navigation.path_changed': nav.pathChanged,
            duration_ms: nav.durationMs,
          })
        } catch {
          // Beacon bodies are best-effort; ignore malformed payloads.
        }
        return new Response(null, { status: 204 })
      },
    },
  },
})
