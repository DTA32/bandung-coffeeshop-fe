import { createFileRoute } from '@tanstack/react-router'
import { renderMetrics } from '@/lib/telemetry/metrics'

// Prometheus scrape endpoint. Auth is on router-level
export const Route = createFileRoute('/(monitoring)/metrics')({
  server: {
    handlers: {
      GET: async () => {
        const { body, contentType } = await renderMetrics()
        return new Response(body, {
          status: 200,
          headers: { 'Content-Type': contentType },
        })
      },
    },
  },
})
