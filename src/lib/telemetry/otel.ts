// OpenTelemetry bootstrap — DORMANT. Intentionally imported nowhere yet.
//
// The rest of the telemetry layer is already OTel-ready: ./context.ts mints W3C
// trace context, and ./logger.ts + ./metrics.ts + ./tracing.ts use OTel
// semantic-convention attribute keys. Turning OTel on is therefore additive.
//
// To enable real distributed tracing later:
//   1. Install the SDK:
//        bun add @opentelemetry/api @opentelemetry/sdk-node \
//          @opentelemetry/auto-instrumentations-node \
//          @opentelemetry/exporter-trace-otlp-http
//   2. Uncomment the bootstrap block below.
//   3. Add this as the FIRST import in server.ts (before the app handler loads):
//        import { setupOtel } from './src/lib/telemetry/otel'
//        setupOtel()
//   4. Run with OTEL_ENABLED=1 and OTEL_EXPORTER_OTLP_ENDPOINT pointing at your
//      collector (Grafana Tempo / Jaeger / OTLP-compatible backend).

export function setupOtel(): void {
  if (process.env.OTEL_ENABLED !== '1') return

  console.warn(
    '[otel] OTEL_ENABLED=1 but the OpenTelemetry SDK is not installed. ' +
      'See src/lib/telemetry/otel.ts for setup steps.',
  )

  // --- Uncomment after installing the packages listed above ---
  //
  // const sdk = new NodeSDK({
  //   traceExporter: new OTLPTraceExporter(),
  //   instrumentations: [getNodeAutoInstrumentations()],
  // })
  // sdk.start()
  // process.on('SIGTERM', () => {
  //   void sdk.shutdown().finally(() => process.exit(0))
  // })
}
