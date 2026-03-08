import { defineStore } from 'pinia';
import axios from 'axios';
import * as Cesium from 'cesium';

export type Camera = {
	title: string;
	viewCount: number;
	webcamId: number;
	status: string;
	lastUpdatedOn: Date;
};

export type CameraViewForApi = {
	neLat: number;
	neLon: number;
	swLat: number;
	swLon: number;
	zoomLevel: number;
};

export type SelectedCameraInfo = {
	id: string;
	name?: string;
	webcamId?: number;
	title?: string;
	player?: {
		day?: string;
		night?: string;
		live?: string;
	};
	location?: {
		city?: string;
		region?: string;
		country?: string;
		latitude?: number;
		longitude?: number;
	};
	images?: {
		current: {
			preview: string;
		};
	};
	[key: string]: unknown;
};

export type ClusterCamera = {
	webcamId?: number;
	title?: string;
	location?: {
		longitude?: number;
		latitude?: number;
	};
	[key: string]: unknown;
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
		cameras: [] as Camera[],
	}),
	actions: {
		getCameraViewForApi(viewer?: Cesium.Viewer): CameraViewForApi | null {
			if (!viewer) return null;

			const rectangle = viewer.camera.computeViewRectangle(
				viewer.scene.globe.ellipsoid,
			);
			if (!rectangle) return null;

			const swLat = Cesium.Math.toDegrees(rectangle.south);
			const swLon = Cesium.Math.toDegrees(rectangle.west);
			const neLat = Cesium.Math.toDegrees(rectangle.north);
			const neLon = Cesium.Math.toDegrees(rectangle.east);

			const rawLonSpanRadians = Cesium.Math.negativePiToPi(
				rectangle.east - rectangle.west,
			);
			const lonSpanDegrees = Math.max(
				Cesium.Math.toDegrees(
					rawLonSpanRadians < 0
						? rawLonSpanRadians + Cesium.Math.TWO_PI
						: rawLonSpanRadians,
				),
				0.000001,
			);
			const latSpanDegrees = Math.max(neLat - swLat, 0.000001);

			const zoomFromLat = 4 + Math.log2(22.5 / latSpanDegrees);
			const zoomFromLon = 4 + Math.log2(45 / lonSpanDegrees);
			const zoomLevel = Math.min(
				18,
				Math.max(4, Math.floor(Math.min(zoomFromLat, zoomFromLon))),
			);

			return {
				neLat,
				neLon,
				swLat,
				swLon,
				zoomLevel,
			};
		},

		removeAllCameraMarkers(viewer?: Cesium.Viewer) {
			if (!viewer) return;
			for (const entity of viewer.entities.values) {
				if (entity.id.startsWith('camera-')) {
					viewer.entities.removeById(entity.id);
				}
			}
		},

		async getCameraMarkerHeights(
			viewer: Cesium.Viewer | undefined,
			positions: Array<{ longitude: number; latitude: number }>,
			heightOffset: number,
		): Promise<number[]> {
			if (!viewer) return positions.map(() => heightOffset);

			const cartographics = positions.map(({ longitude, latitude }) =>
				Cesium.Cartographic.fromDegrees(longitude, latitude),
			);
			const sampledHeights: Array<number | undefined> = new Array(
				cartographics.length,
			).fill(undefined);

			if (viewer.scene.sampleHeightSupported) {
				try {
					const sampled = await viewer.scene.sampleHeightMostDetailed(
						cartographics.map((c) => c.clone()),
					);
					sampled.forEach((result, index) => {
						sampledHeights[index] = result?.height;
					});
				} catch {
					// Fallback to terrain sampling below.
				}
			}

			const missingSamples: Array<{
				originalIndex: number;
				cartographic: Cesium.Cartographic;
			}> = [];

			for (const [index, height] of sampledHeights.entries()) {
				if (Number.isFinite(height)) continue;
				const cartographic = cartographics[index];
				if (!cartographic) continue;
				missingSamples.push({
					originalIndex: index,
					cartographic: cartographic.clone(),
				});
			}

			if (missingSamples.length > 0) {
				try {
					const terrainSamples = await Cesium.sampleTerrainMostDetailed(
						viewer.terrainProvider,
						missingSamples.map((sample) => sample.cartographic),
					);
					terrainSamples.forEach((sample, idx) => {
						const missingSample = missingSamples[idx];
						if (!missingSample) return;
						sampledHeights[missingSample.originalIndex] = sample?.height;
					});
				} catch {
					// Keep default height fallback.
				}
			}

			return sampledHeights.map(
				(height) =>
					(Number.isFinite(height) ? (height as number) : 0) + heightOffset,
			);
		},

		async focusSelectedCamera(
			viewer: Cesium.Viewer | undefined,
			selected: SelectedCameraInfo | null,
			heightOffset: number,
		) {
			const longitude = selected?.location?.longitude;
			const latitude = selected?.location?.latitude;
			if (
				!viewer ||
				!selected ||
				typeof longitude !== 'number' ||
				typeof latitude !== 'number'
			)
				return;

			const [markerHeight] = await this.getCameraMarkerHeights(
				viewer,
				[{ longitude, latitude }],
				heightOffset,
			);
			const flyToHeight = (markerHeight ?? heightOffset) + heightOffset;

			viewer.camera.flyTo({
				destination: Cesium.Cartesian3.fromDegrees(
					longitude,
					latitude,
					flyToHeight,
				),
				duration: 0.8,
			});
		},

		async focusCameraFromList(
			viewer: Cesium.Viewer | undefined,
			camera: ClusterCamera,
			heightOffset: number,
		): Promise<SelectedCameraInfo | null> {
			if (!viewer) return null;

			const longitude = camera.location?.longitude;
			const latitude = camera.location?.latitude;
			if (typeof longitude !== 'number' || typeof latitude !== 'number')
				return null;

			const markerId = `camera-${camera.webcamId}`;
			const entity = viewer.entities.getById(markerId);

			if (entity) {
				viewer.selectedEntity = entity;
			} else {
				const selectedCameraInfo: SelectedCameraInfo = {
					...(camera as SelectedCameraInfo),
					id: markerId,
					name: camera.title,
				};

				const [markerHeight] = await this.getCameraMarkerHeights(
					viewer,
					[{ longitude, latitude }],
					heightOffset,
				);
				const flyToHeight = (markerHeight ?? heightOffset) + heightOffset;

				viewer.camera.flyTo({
					destination: Cesium.Cartesian3.fromDegrees(
						longitude,
						latitude,
						flyToHeight,
					),
					duration: 0.8,
				});

				return selectedCameraInfo;
			}

			const [markerHeight] = await this.getCameraMarkerHeights(
				viewer,
				[{ longitude, latitude }],
				heightOffset,
			);
			const flyToHeight = (markerHeight ?? heightOffset) + heightOffset;

			viewer.camera.flyTo({
				destination: Cesium.Cartesian3.fromDegrees(
					longitude,
					latitude,
					flyToHeight,
				),
				duration: 0.8,
			});

			return null;
		},

		closeSelectedCameraCard(viewer?: Cesium.Viewer) {
			if (viewer) {
				viewer.selectedEntity = undefined;
			}
		},

		async loadMapViewCameras(view: CameraViewForApi): Promise<ClusterCamera[]> {
			const cameras = (await this.getMapClusters(
				view.neLat,
				view.swLat,
				view.neLon,
				view.swLon,
				view.zoomLevel,
			)) as ClusterCamera[] | null;

			return cameras ?? [];
		},

		async rerenderCameraMarkers(
			viewer: Cesium.Viewer | undefined,
			cameras: ClusterCamera[],
			heightOffset: number,
		) {
			if (!viewer) return;
			this.removeAllCameraMarkers(viewer);

			const camerasWithCoords = cameras
				.map((camera) => ({
					camera,
					longitude: camera.location?.longitude,
					latitude: camera.location?.latitude,
				}))
				.filter(
					(
						entry,
					): entry is {
						camera: (typeof cameras)[number];
						longitude: number;
						latitude: number;
					} =>
						typeof entry.longitude === 'number' &&
						typeof entry.latitude === 'number',
				);

			if (camerasWithCoords.length === 0) return;

			const markerHeights = await this.getCameraMarkerHeights(
				viewer,
				camerasWithCoords.map(({ longitude, latitude }) => ({
					longitude,
					latitude,
				})),
				heightOffset,
			);

			viewer.entities.suspendEvents();
			try {
				for (const [index, entry] of camerasWithCoords.entries()) {
					const markerId = `camera-${entry.camera.webcamId}`;
					const markerData = {
						camera: entry.camera,
					};

					viewer.entities.add({
						id: markerId,
						name: entry.camera.title,
						position: Cesium.Cartesian3.fromDegrees(
							entry.longitude,
							entry.latitude,
							markerHeights[index],
						),
						point: { pixelSize: 12, color: Cesium.Color.RED },
						properties: markerData,
					});
				}
			} finally {
				viewer.entities.resumeEvents();
			}
		},

		getSelectedCameraInfoFromEntity(
			entity: Cesium.Entity | undefined,
		): SelectedCameraInfo | null {
			if (
				!entity ||
				!entity.id ||
				typeof entity.id !== 'string' ||
				!entity.id.startsWith('camera-')
			) {
				return null;
			}

			return {
				...(entity.properties?.camera?.getValue?.() ?? {}),
				id: entity.id,
				name: entity.name,
			};
		},

		async getWebcams() {
			const webcams = await windyAPI.get('/webcams?continents=NA');
			this.cameras = webcams.data.webcams.map(
				(el: {
					title: string;
					viewCount: number;
					webcamId: number;
					status: string;
					lastUpdatedOn: string;
				}) => ({
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
			categories?: Set<
				'categories' | 'images' | 'location' | 'player' | 'urls'
			>,
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
			categories?: Set<
				'categories' | 'images' | 'location' | 'player' | 'urls'
			>,
		) {
			let mappedCategories = 'categories,images,location,player,urls';
			if (categories) {
				mappedCategories = Array.from(categories).join(',');
			}
			const detailResponse = await windyAPI.get(
				`/webcams/${cameraid}?include=${mappedCategories}`,
			);
			return detailResponse.data;
		},
	},
});
