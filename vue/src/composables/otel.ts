import { metrics } from '@opentelemetry/api';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { LoggerProvider, SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { useCookies } from '@vueuse/integrations/useCookies';
import { v4 as uuidv4 } from 'uuid';
import { onUnmounted } from 'vue';
import Logger from '@/helper/logger';
import { usePostHog } from './posthog';

const resource = resourceFromAttributes({
	[ATTR_SERVICE_NAME]: 'web-otel',
	[ATTR_SERVICE_VERSION]: '1.0.0',
});

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
	instrumentations: [getWebAutoInstrumentations({})],
});

export function useOTEL() {
	const cookies = useCookies(['uuid']);
	const { posthog } = usePostHog();
	const session = posthog.get_session_id();
	let user = '';
	const userCookie = cookies.get('user');

	if (!user && !userCookie) {
		user = uuidv4();
		cookies.set('user', user);
	} else if (userCookie) {
		user = userCookie;
	}

	// posthog.sessionManager?.resetSessionId();
	posthog.identify(user);

	const resource = resourceFromAttributes({
		[ATTR_SERVICE_NAME]: `session-${session}`,
		[ATTR_SERVICE_VERSION]: '1.0.0',
		['service.seesion']: session,
		['service.user']: user,
	});

	const loggerProvider = new LoggerProvider({
		resource,
		processors: [new SimpleLogRecordProcessor(new OTLPLogExporter())],
	});

	const meterProvider = new MeterProvider({
		resource,
		readers: [
			new PeriodicExportingMetricReader({
				exporter: new OTLPMetricExporter(),
				exportIntervalMillis: 1000,
			}),
		],
	});

	metrics.setGlobalMeterProvider(meterProvider);

	function stopMetrics() {
		console.log('STOPPING METRICS');
		metrics.disable();
	}

	// Auto-cleanup when component unmounts
	onUnmounted(stopMetrics);

	return {
		meter: meterProvider.getMeter(`web-meter`, '1.0.0'),
		logger: new Logger(loggerProvider),
		user,
	};
}
