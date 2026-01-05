import type { TransportOptions } from 'nodemailer';
import nodemailer from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';
import logger from './logger';
import fs from 'node:fs'

export type MailMessage = Mail.Options & Partial<TransportOptions>;

export const mailer = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	port: 465,
	secure: true, // use STARTTLS (upgrade connection to TLS after connecting)
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PWD,
	},
});

mailer.on('error', (error: Error) => {
	logger.error(`SMTP error`, error);
});

export function sendMail(message: MailMessage, maxRetries = 3) {
	(async () => {
		let attempt = 0;

		while (attempt < maxRetries) {
			try {
				attempt++;
				const result = await mailer.sendMail(message);
				logger.info('Email sent successfully', result);
				return; // Success, exit retry loop
			} catch (error) {
				if (attempt < maxRetries) {
					logger.warn(`Email attempt ${attempt} failed`, error);
				} else if (attempt === maxRetries) {
					logger.error(
						`Email attempt ${maxRetries} failed and stopped retrying`,
						error,
					);
					return;
				}
				await new Promise((resolve) =>
					setTimeout(resolve, 1000 * 2 ** attempt),
				);
			}
		}
	})().catch((err) => {
		// Catch any unhandled errors from the background task
		logger.error('Background email task failed:', err);
	});
}

export function loadHTML(filename: string, params: {[key: string]: string} = {}) {
		let template = fs.readFileSync(filename).toString();
		for(const [key, value] of Object.entries(params)) {
			template = template.replace(key, value);
		}
		return template;
}
