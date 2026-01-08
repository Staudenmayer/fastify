const opentelemetry = require("@opentelemetry/sdk-node");
const {
  getNodeAutoInstrumentations,
} = require("@opentelemetry/auto-instrumentations-node");
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http')
const { FastifyOtelInstrumentation } = require('@fastify/otel');
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-http');
const { SimpleLogRecordProcessor } = require('@opentelemetry/sdk-logs');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');

const sdk = new opentelemetry.NodeSDK({
  traceExporter: new OTLPTraceExporter(),
	metricReader: new PeriodicExportingMetricReader({
		exporter: new OTLPMetricExporter(),
	}),
	logRecordProcessors: [new SimpleLogRecordProcessor(new OTLPLogExporter())],
  instrumentations: [
    ...Object.values(
      getNodeAutoInstrumentations({
        "@opentelemetry/instrumentation-fs": { enabled: false },
      })
    ),
    new FastifyOtelInstrumentation({
      registerOnInitialization: true,
    }),
  ],
});

sdk.start();
