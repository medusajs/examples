import Sentry from '@sentry/node'
import otelApi from "@opentelemetry/api";
import { registerOtel } from "@medusajs/medusa"
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc" 
import { SentrySpanProcessor, SentryPropagator } from "@sentry/opentelemetry-node"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  // @ts-ignore
  instrumenter: "otel",
});

otelApi.propagation.setGlobalPropagator(new SentryPropagator());

export function register() {
  registerOtel({
    serviceName: 'medusa',
    spanProcessors: [new SentrySpanProcessor()],
    traceExporter: new OTLPTraceExporter(),
    instrument: {
      http: true,
      workflows: true,
      query: true,
      db: true,
    },
  })
}