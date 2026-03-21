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
	categories?: {
		id: string;
		name: string;
	};
	images?: {
		current: {
			icon: string;
			preview: string;
			thumbnail: string;
		};
		daylight: {
			icon: string;
			preview: string;
			thumbnail: string;
		};
		sizes: {
			icon: { width: number; height: number };
			preview: { width: number; height: number };
			thumbnail: { width: number; height: number };
		};
	};
	location?: {
		latitude: number;
		longitude: number;
		city: string;
		city_code: string;
		region: string;
		region_code: string;
		country: string;
		country_code: string;
		continent: string;
		continent_code: string;
	};
	player?: {
		live: string;
		day: string;
		month: string;
		year: string;
		lifetime: string;
	};
	urls?: {
		detail: string;
		edit: string;
		provider: string;
	};
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
	// Clone payload and convert all arrays to comma-joined strings
	const params: Record<string, any> = {
		...payload,
		// Convert array fields to comma-separated strings for axios serialization
		include: Array.isArray(payload.include)
			? payload.include.join(',')
			: payload.include,
		categories: Array.isArray(payload.categories)
			? payload.categories.join(',')
			: payload.categories,
		continents: Array.isArray(payload.continents)
			? payload.continents.join(',')
			: payload.continents,
		countries: Array.isArray(payload.countries)
			? payload.countries.join(',')
			: payload.countries,
		regions: Array.isArray(payload.regions)
			? payload.regions.join(',')
			: payload.regions,
		cities: Array.isArray(payload.cities)
			? payload.cities.join(',')
			: payload.cities,
		webcamIds: Array.isArray(payload.webcamIds)
			? payload.webcamIds.join(',')
			: payload.webcamIds,
	};

	// Remove undefined/null values to clean up the query string
	Object.keys(params).forEach((key) => {
		if (params[key] === undefined || params[key] === null) {
			delete params[key];
		}
	});

	const { data } = await windyClient.get<WindyWebcamResponse>('/webcams', {
		params,
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
