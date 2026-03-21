import axios from 'axios';

export const windyClient = axios.create({
	baseURL: 'https://nominatim.openstreetmap.org/',
	timeout: 15000,
});

//https://nominatim.org/release-docs/develop/api/Overview/

export type NominatimSearchRequest = {
	q?: string;
	amenity?: string;
	street?: string;
	city?: string;
	county?: string;
	state?: string;
	country?: string;
	postalcode?: string;
	format?: 'xml' | 'json' | 'jsonv2' | 'geojson' | 'geocodejson';
	extratags?: number;
	addressdetails?: number;
	entrances?: number;
};
export type NominatimSearchResponse = {
	place_id: number;
	licence: string;
	osm_type: string;
	osm_id: number;
	lat: string;
	lon: string;
	category: string;
	type: string;
	place_rank: number;
	importance: number;
	addresstype: string;
	name: string;
	display_name: string;
	boundingbox: string[];
};

//q or other have to be defined. not both
export async function getSearch(
	payload: NominatimSearchRequest,
): Promise<NominatimSearchResponse[]> {
	payload.format = payload.format ?? 'jsonv2';
	payload.extratags = payload.extratags ?? 1;
	payload.addressdetails = payload.addressdetails ?? 1;
	payload.entrances = payload.entrances ?? 1;
	const { data } = await windyClient.get<NominatimSearchResponse[]>('/search', {
		params: payload,
	});

	return data;
}
