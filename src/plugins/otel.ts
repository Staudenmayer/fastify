import FastifyOtelInstrumentation from '@fastify/otel';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { MongoDBInstrumentation } from '@opentelemetry/instrumentation-mongodb';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { NodeSDK } from '@opentelemetry/sdk-node';

const sdk = new NodeSDK({
	traceExporter: new OTLPTraceExporter(),
	metricReader: new PeriodicExportingMetricReader({
		exporter: new OTLPMetricExporter(),
	}),
	logRecordProcessors: [new SimpleLogRecordProcessor(new OTLPLogExporter())],
	instrumentations: [
		getNodeAutoInstrumentations({

		}),
		new HttpInstrumentation(),
		new MongoDBInstrumentation({
			enabled: true,
			enhancedDatabaseReporting: true,
		}),
		new FastifyOtelInstrumentation({
			registerOnInitialization: true,
			enabled: true,
		}),
	],
});

await sdk.start();
