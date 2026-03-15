import axios from 'axios';

const windyToken = import.meta.env.VITE_WINDY_TOKEN;

if (!windyToken) {
	throw new Error('Missing VITE_WINDY_TOKEN environment variable');
}

export const windyClient = axios.create({
	baseURL: 'https://api.windy.com/webcams/api/v3',
	headers: {
		'x-windy-api-key': windyToken,
	},
	timeout: 15000,
});

export type WindyLanguages =
	| 'ar'
	| 'bg'
	| 'bn'
	| 'ca'
	| 'cs'
	| 'da'
	| 'de'
	| 'el'
	| 'en'
	| 'es'
	| 'et'
	| 'fa'
	| 'fi'
	| 'fr'
	| 'he'
	| 'hi'
	| 'hr'
	| 'hu'
	| 'id'
	| 'is'
	| 'it'
	| 'ja'
	| 'ko'
	| 'lt'
	| 'nb'
	| 'nl'
	| 'pl'
	| 'pt'
	| 'ro'
	| 'ru'
	| 'sk'
	| 'sl'
	| 'sq'
	| 'sr'
	| 'sv'
	| 'ta'
	| 'th'
	| 'tr'
	| 'uk'
	| 'vi'
	| 'zh'
	| 'zh-TW';

export type WindyCategories =
	| 'airport'
	| 'beach'
	| 'building'
	| 'city'
	| 'coast'
	| 'forest'
	| 'indoor'
	| 'lake'
	| 'landscape'
	| 'meteo'
	| 'mountain'
	| 'observatory'
	| 'port'
	| 'river'
	| 'sportArea'
	| 'square'
	| 'traffic'
	| 'village';

export type WindyContinents = 'AF' | 'AN' | 'AS' | 'EU' | 'NA' | 'OC' | 'SA';

export type WindyIncludes =
	| 'categories'
	| 'images'
	| 'location'
	| 'player'
	| 'urls';

export type WindyWebcam = {
	title: string;
	viewCount: number;
	webcamId: number;
	status: 'active' | 'inactive';
	lastUpdatedOn: string;
};

export type WindyWebcamRequest = {
	lang?: WindyLanguages;
	limit?: number;
	offset?: number;
	categoryOperation?: 'and' | 'or';
	sortKey?: 'popularity' | 'createdOn';
	sortDirection?: 'asc' | 'desc';
	bbox?: string;
	nearby?: string;
	categories?: WindyCategories[];
	continents?: WindyContinents[];
	countries?: string[];
	regions?: string[];
	cities?: string[];
	webcamIds?: number[];
	include?: WindyIncludes[];
};

export type WindyCitiesRequest = { lang?: WindyLanguages };
export type WindyRegionsRequest = WindyCitiesRequest;
export type WindyCountriesRequest = WindyCitiesRequest;
export type WindyContinentsRequest = WindyCitiesRequest;

export type WindyWebcamResponse = {
	total: number;
	webcams: WindyWebcam[];
};

export type WindyCitiesResponse = { code: string; name: string };
export type WindyRegionsResponse = WindyCitiesResponse;
export type WindyCountriesResponse = WindyCitiesResponse;
export type WindyContinentsResponse = WindyCitiesResponse;

export async function getWebcams(
	payload: WindyWebcamRequest,
): Promise<WindyWebcamResponse> {
	const { data } = await windyClient.get<WindyWebcamResponse>('/webcams', {
		params: payload,
	});

	return data;
}

export async function getAllWebcams(
	payload: WindyWebcamRequest,
): Promise<WindyWebcamResponse> {
	const pageSize = payload.limit ?? 50;
	let offset = payload.offset ?? 0;
	const webcams: WindyWebcam[] = [];
	let total = 0;
	let actualTotal = 0;

	while (true) {
		const response = await getWebcams({
			...payload,
			limit: pageSize,
			offset,
		});

		total = Math.min(response.total, 1000);
		webcams.push(...response.webcams);

		if (webcams.length >= total || response.webcams.length < pageSize) {
			actualTotal = response.total;
			break;
		}

		offset += pageSize;
	}

	return {
		total: actualTotal,
		webcams,
	};
}

export async function getCities(
	payload: WindyCitiesRequest,
): Promise<WindyCitiesResponse> {
	const { data } = await windyClient.get<WindyCitiesResponse>('/cities', {
		params: payload,
	});
	return data;
}

export async function getRegions(
	payload: WindyRegionsRequest,
): Promise<WindyRegionsResponse> {
	const { data } = await windyClient.get<WindyCitiesResponse>('/regions', {
		params: payload,
	});
	return data;
}

export async function getCountries(
	payload: WindyCountriesRequest,
): Promise<WindyCountriesResponse> {
	const { data } = await windyClient.get<WindyCitiesResponse>('/countries', {
		params: payload,
	});
	return data;
}

export async function getContinents(
	payload: WindyContinentsRequest,
): Promise<WindyContinentsResponse> {
	const { data } = await windyClient.get<WindyCitiesResponse>('/continents', {
		params: payload,
	});
	return data;
}
