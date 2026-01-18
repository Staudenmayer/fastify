import FastifyOtelInstrumentation from '@fastify/otel';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { NodeSDK } from '@opentelemetry/sdk-node';

const sdk = new NodeSDK({
	traceExporter: new OTLPTraceExporter(),
	metricReader: new PeriodicExportingMetricReader({
		exporter: new OTLPMetricExporter(),
	}),
	logRecordProcessors: [new BatchLogRecordProcessor(new OTLPLogExporter())],
	instrumentations: [
		getNodeAutoInstrumentations({
			'@opentelemetry/instrumentation-mongodb': {
				enabled: true,
				enhancedDatabaseReporting: true,
			},
			'@opentelemetry/instrumentation-http': {
				enabled: true,
			},
		}),
		new FastifyOtelInstrumentation({
			registerOnInitialization: true,
			enabled: true,
		}),
	],
});

await sdk.start();
