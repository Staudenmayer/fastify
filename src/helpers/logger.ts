import { OpenTelemetryTransportV3 } from '@opentelemetry/winston-transport';
import winston from 'winston';

const logger = winston.createLogger({
	transports: [
		new OpenTelemetryTransportV3(),
		new winston.transports.Console({
			//level: 'warn',
			format: winston.format.combine(
				winston.format.colorize({all: true}),
				winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
				winston.format.printf(
					(data) => {
						const { timestamp, level, message } = data;
						return `${timestamp} ${level}: ${message}`;
					},
				),
			),
		}),
	],
});

export default logger;
