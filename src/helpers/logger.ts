import { OpenTelemetryTransportV3 } from '@opentelemetry/winston-transport';
import winston from 'winston';

const logger = winston.createLogger({
	transports: [
		new OpenTelemetryTransportV3(),
		new winston.transports.Console({
			//level: 'warn',
			format: winston.format.combine(
				winston.format.colorize(),
				winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
				winston.format.printf(
					({ timestamp, level, message }) =>
						`${timestamp} ${level}: ${message}`,
				),
			),
		}),
	],
});

export default logger;
