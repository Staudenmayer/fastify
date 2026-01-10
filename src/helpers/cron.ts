import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export function minToCron(totalMinutes: number) {
	let now = dayjs.utc();
	const minutes = totalMinutes % 60;
	const hours = Math.floor(totalMinutes / 60);

	now = now.add(minutes, 'minutes');
	now = now.add(hours, 'hours');

	return `${now.minute()} ${now.hour()} ${now.date()} ${now.month() + 1} *`;
}

export function minToString(totalMinutes: number) {
	const minutes = totalMinutes % 60;
	const hours = Math.floor(totalMinutes / 60);
	let hourString = '';
	let minuteString = '';
	if (hours) {
		hourString = `${hours}h `;
	}
	if (minutes) {
		minuteString = `${minutes}min`;
	}
	return `${hourString}${minuteString}`;
}
