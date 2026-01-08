const { OpenTelemetryTransportV3 } = require('@opentelemetry/winston-transport');
const winston = require('winston');

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

module.exports = logger;
