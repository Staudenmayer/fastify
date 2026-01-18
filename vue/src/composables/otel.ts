import { onUnmounted } from 'vue';
import { BatchSpanProcessor  } from '@opentelemetry/sdk-trace-base';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { metrics } from '@opentelemetry/api';

const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: 'web-otel',
  [ATTR_SERVICE_VERSION]: '1.0.0',
});

const meterProvider = new MeterProvider({
  resource,
  readers: [
    new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter(),
      exportIntervalMillis: 1000
    }),
  ],
});
metrics.setGlobalMeterProvider(meterProvider);

const traceProvider = new WebTracerProvider({
  resource,
  spanProcessors: [new BatchSpanProcessor(new OTLPTraceExporter({}))],
});

traceProvider.register({
  // Changing default contextManager to use ZoneContextManager - supports asynchronous operations - optional
  contextManager: new ZoneContextManager(),
});

// Registering instrumentations
registerInstrumentations({
  instrumentations: [
    getWebAutoInstrumentations({})
  ],
});

export function useOTEL() {

  function stopMetrics() {
    console.log('STOPPING METRICS');
    metrics.disable();
  }

  // Auto-cleanup when component unmounts
  onUnmounted(stopMetrics);

  return {
    meter: meterProvider,
  }
}
