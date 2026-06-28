import { createFileRoute } from '@tanstack/react-router'
import { logger } from '@/lib/telemetry/logger'

// Beacon sink for real-user Core Web Vitals sent by the client (see
// src/lib/telemetry/webVitals.client.ts). Logs them as structured records;
export const Route = createFileRoute('/telemetry/vitals')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const metric = (await request.json()) as Record<string, unknown>
          logger.info('web_vitals', {
            'web_vitals.name': metric.name,
            'web_vitals.value': metric.value,
            'web_vitals.rating': metric.rating,
            'web_vitals.delta': metric.delta,
            'url.path': metric.path,
            'navigation.type': metric.navigationType,
          })
        } catch {
          // Beacon bodies are best-effort; ignore malformed payloads.
        }
        return new Response(null, { status: 204 })
      },
    },
  },
})
