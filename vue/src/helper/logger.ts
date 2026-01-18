import { SeverityNumber, type LogAttributes, type LogBody, type LogRecord } from '@/types/logger';
import type { LoggerProvider } from '@opentelemetry/sdk-logs';

export default class Logger {
  otelLogger: {
    emit(logRecord: LogRecord): void
  };

  uuid: string;

  constructor(otelLogger: LoggerProvider, uuid: string) {
    this.uuid = uuid;
    this.otelLogger = otelLogger.getLogger(`web-logger-${uuid}`, '1.0.0');
  }

  private log(severityNumber: SeverityNumber, message: LogBody, attributes: LogAttributes) {
    let severityText = ''
    switch (severityNumber) {
      case SeverityNumber.DEBUG:
      case SeverityNumber.DEBUG2:
      case SeverityNumber.DEBUG3:
      case SeverityNumber.DEBUG4:
        severityText = 'DEBUG';
        break;
      case SeverityNumber.INFO:
      case SeverityNumber.INFO2:
      case SeverityNumber.INFO3:
      case SeverityNumber.INFO4:
        severityText = 'INFO';
        break;
      case SeverityNumber.WARN:
      case SeverityNumber.WARN2:
      case SeverityNumber.WARN3:
      case SeverityNumber.WARN4:
        severityText = 'WARN';
        break;
      case SeverityNumber.ERROR:
      case SeverityNumber.ERROR2:
      case SeverityNumber.ERROR3:
      case SeverityNumber.ERROR4:
        severityText = 'ERROR';
        break;
      case SeverityNumber.FATAL:
      case SeverityNumber.FATAL2:
      case SeverityNumber.FATAL3:
      case SeverityNumber.FATAL4:
        severityText = 'CRIT';
        break;
    }
    this.otelLogger.emit({
      severityNumber: severityNumber,
      severityText: severityText,
      body: message,
      attributes: Object.assign({ uuid: this.uuid }, attributes),

    })
  }
  debug(message: LogBody, attributes: LogAttributes) {
    this.log(SeverityNumber.DEBUG, message, attributes);
  }
  info(message: LogBody, attributes: LogAttributes) {
    this.log(SeverityNumber.INFO, message, attributes);
  }
  warn(message: LogBody, attributes: LogAttributes) {
    this.log(SeverityNumber.WARN, message, attributes);
  }
  error(message: LogBody, attributes: LogAttributes) {
    this.log(SeverityNumber.ERROR, message, attributes);
  }
  fatal(message: LogBody, attributes: LogAttributes) {
    this.log(SeverityNumber.FATAL, message, attributes);
  }
}
