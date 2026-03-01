import { defineStore } from 'pinia';
import axios from 'axios';

export type Camera = {
	title: string;
	viewCount: number;
	webcamId: number;
	status: string;
	lastUpdatedOn: Date;
};

//https://api.windy.com/webcams/docs
const windyAPI = axios.create({
	baseURL: 'https://api.windy.com/webcams/api/v3',
	headers: {
		'x-windy-api-key': import.meta.env.VITE_WINDY_TOKEN,
	},
});

export const useCameraData = defineStore('camera', {
	state: () => ({
		api: windyAPI,
		cameras: [],
	}),
	actions: {
		async getWebcams() {
			const webcams = await windyAPI.get('/webcams?continents=NA');
			this.cameras = webcams.data.webcams.map(
				(el: { title: string; viewCount: number; webcamId: number; status: string; lastUpdatedOn: string }) => ({
					title: el.title,
					viewCount: el.viewCount,
					webcamId: el.webcamId,
					status: el.status,
					lastUpdatedOn: new Date(el.lastUpdatedOn),
				}),
			);
			return webcams.data.webcams;
		},
		async getMapClusters(
			northLat: number,
			southLat: number,
			eastLon: number,
			westLon: number,
			zoom: number,
			categories?: Set<'categories' | 'images' | 'location' | 'player' | 'urls'>,
		) {
			let mappedCategories = 'categories,images,location,player,urls';
			if (categories) {
				mappedCategories = Array.from(categories).join(',');
			}
			const clusterReponse = await windyAPI.get(
				`/map/clusters?include=${mappedCategories}&northLat=${northLat}&southLat=${southLat}&eastLon=${eastLon}&westLon=${westLon}&zoom=${Math.floor(zoom)}`,
			);
			return clusterReponse.data;
		},
		async getWebcamDetails(
			cameraid: number,
			categories?: Set<'categories' | 'images' | 'location' | 'player' | 'urls'>,
		) {
			let mappedCategories = 'categories,images,location,player,urls';
			if (categories) {
				mappedCategories = Array.from(categories).join(',');
			}
			const detailResponse = await windyAPI.get(`/webcams/${cameraid}?include=${mappedCategories}`);
			return detailResponse.data;
		},
	},
});
