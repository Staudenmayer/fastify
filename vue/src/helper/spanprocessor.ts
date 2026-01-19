import type { SpanExporter } from '@opentelemetry/sdk-trace-base';
import type { ExportResult } from '@opentelemetry/core';
import { ExportResultCode } from '@opentelemetry/core';
import type { ReadableSpan } from '@opentelemetry/sdk-trace-base';


//here we can hook posthog to get traceids to posthog
export default class CustomTraceExporter implements SpanExporter {

  constructor(data: object) {}

  export(spans: ReadableSpan[], resultCallback: (result: ExportResult) => void): void {
    // Process spans (e.g., send to your endpoint)
    console.log(`Exporting ${spans.length} spans`);

    // Transform spans to your format if needed
    const payload = spans.map(span => ({
      traceId: span.spanContext().traceId,
      spanId: span.spanContext().spanId,
      name: span.name,
      // Add attributes, events, etc.
    }));
    console.log('Exp', spans);
    resultCallback({
      code: ExportResultCode.SUCCESS,
      //error: new Error('test')
    });
  }

  async shutdown() {
    console.log('shutdown');
  }
}
