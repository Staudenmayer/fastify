import '@dotenvx/dotenvx/config';
import axios from 'axios';

type IPData = {
	status: string;
	country: string;
	countryCode: string;
	region: string;
	regionName: string;
	city: string;
	zip: string;
	lat: number;
	lon: number;
	timezone: string;
	isp: string;
	org: string;
	as: string;
	query: string;
};

const client = axios.create({
	baseURL: 'http://ip-api.com/json',
});

const res = await client.get<IPData>('/83.218.91.36');
const country = JSON.parse(process.env.COUNTRY || '[]');
console.log(country.includes(res.data.countryCode), res.data);
