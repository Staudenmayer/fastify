<template>
	<v-card class="h-100 pa-0 overflow-hidden">
		<div class="map-stage position-relative w-100 h-100">
			<div
				ref="cesiumContainer"
				class="cesium-container w-100 h-100"
			></div>

			<div
				class="position-absolute top-0 left-0 ma-4"
				style="z-index: 10; width: 20dvw; max-height: calc(100vh - 8rem)"
			>
				<v-card
					v-if="isMapItemsVisible"
					class="position-relative bg-surface pa-5 d-flex flex-column"
					style="max-height: inherit"
				>
					<map-items
						:layers="layers"
						:selected-layer="selectedLayer"
						:webcams-enabled="areWebcamsEnabled"
						:camera-items="mapViewCameras"
						@close="isMapItemsVisible = false"
						@update:selected-layer="selectedLayer = $event"
						@update:webcams-enabled="areWebcamsEnabled = $event"
						@click:reset-position="resetToNorthUp"
						@click:focus-camera="focusCameraFromList"
					></map-items>
				</v-card>
				<v-btn
					v-else
					icon="mdi-chevron-right"
					variant="elevated"
					size="large"
					class="rounded-lg pa-2 ma-5"
					color="primary"
					@click="isMapItemsVisible = true"
				></v-btn>
			</div>

			<v-card
				v-if="selectedCameraInfo"
				class="position-absolute right-0 top-0 ma-4"
				style="z-index: 11; width: 20dvw"
			>
				<v-card-title class="d-flex align-center justify-space-between">
					<span class="text-truncate">{{ selectedCameraInfo.title || selectedCameraInfo.name }}</span>
					<div class="d-flex ga-1">
						<v-btn
							icon="mdi-crosshairs-gps"
							variant="text"
							size="small"
							@click="focusSelectedCamera"
						/>
						<v-btn
							icon="mdi-close"
							variant="text"
							size="small"
							@click="closeSelectedCameraCard"
						/>
					</div>
				</v-card-title>
				<v-card-text>
					<div>Webcam ID: {{ selectedCameraInfo.webcamId }}</div>
					<div>{{ selectedCameraInfo.location?.city }}, {{ selectedCameraInfo.location?.region }}</div>
					<div>{{ selectedCameraInfo.location?.country }}</div>
					<div>Lat: {{ selectedCameraInfo.location?.latitude }}</div>
					<div>Lon: {{ selectedCameraInfo.location?.longitude }}</div>
					<div class="pt-5"></div>
					<v-img
						v-if="selectedCameraInfo.images?.current.preview && !selectedPlayerUrl"
						:src="selectedPreviewUrl"
						class="border-0 rounded"
					></v-img>
					<iframe
						v-if="selectedPlayerUrl"
						:src="selectedPlayerUrl"
						title="Camera player"
						class="w-100 mt-3 border-0 rounded"
						height="220"
						allowfullscreen
					></iframe>
				</v-card-text>
			</v-card>
		</div>
	</v-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import * as Cesium from 'cesium';
import axios from 'axios';
import MapItems from '@/components/MapItems.vue';
import { useCameraData } from '@/stores/cameras';

const cameraStore = useCameraData();

//https://openskynetwork.github.io/opensky-api
const flightAPI = axios.create({
	baseURL: 'https://opensky-network.org/api',
});

Cesium.Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_TOKEN;

const cesiumContainer = ref<HTMLDivElement | null>(null);
let viewer: Cesium.Viewer | undefined;
let currentLayer: Cesium.ImageryLayer | undefined;
let unsubscribeMoveEnd: (() => void) | undefined;
let unsubscribeSelectedEntityChanged: (() => void) | undefined;
let previewRefreshTimer: ReturnType<typeof setInterval> | undefined;
const heightOffset = 25;

type CameraViewForApi = {
	neLat: number;
	neLon: number;
	swLat: number;
	swLon: number;
	zoomLevel: number;
};

type SelectedCameraInfo = {
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

type ClusterCamera = {
	webcamId?: number;
	title?: string;
	location?: {
		longitude?: number;
		latitude?: number;
	};
	[key: string]: unknown;
};

const cameraViewForApi = ref<CameraViewForApi | null>(null);
const selectedCameraInfo = ref<SelectedCameraInfo | null>(null);
const mapViewCameras = ref<ClusterCamera[]>([]);
const previewRefreshNonce = ref(Date.now());
const selectedPreviewUrl = computed(() => {
	const preview = selectedCameraInfo.value?.images?.current.preview;
	if (!preview) return undefined;
	const separator = preview.includes('?') ? '&' : '?';
	return `${preview}${separator}t=${previewRefreshNonce.value}`;
});
const selectedPlayerUrl = computed(() => {
	const player = selectedCameraInfo.value?.player;
	if (typeof player?.live === 'string' && player.live.length > 0) return player.live;
	return undefined;
});

// Define available Google layers
const layers = [
	{ label: 'Roadmap', value: 'm' },
	{ label: 'Satellite', value: 's' },
	{ label: 'Hybrid', value: 'y' },
	{ label: '3D-Satellite', value: '3d' },
];
const selectedLayer = ref('3d'); // default to Roadmap
const isMapItemsVisible = ref(true);
const areWebcamsEnabled = ref(false);

function getCameraViewForApi(): CameraViewForApi | null {
	if (!viewer) return null;

	const rectangle = viewer.camera.computeViewRectangle(viewer.scene.globe.ellipsoid);
	if (!rectangle) return null;

	const swLat = Cesium.Math.toDegrees(rectangle.south);
	const swLon = Cesium.Math.toDegrees(rectangle.west);
	const neLat = Cesium.Math.toDegrees(rectangle.north);
	const neLon = Cesium.Math.toDegrees(rectangle.east);

	const rawLonSpanRadians = Cesium.Math.negativePiToPi(rectangle.east - rectangle.west);
	const lonSpanDegrees = Math.max(
		Cesium.Math.toDegrees(rawLonSpanRadians < 0 ? rawLonSpanRadians + Cesium.Math.TWO_PI : rawLonSpanRadians),
		0.000001,
	);
	const latSpanDegrees = Math.max(neLat - swLat, 0.000001);

	// API zoom model:
	// zoom 4  => max lat span 22.5°, max lon span 45°
	// zoom +1 => span limit / 2
	const zoomFromLat = 4 + Math.log2(22.5 / latSpanDegrees);
	const zoomFromLon = 4 + Math.log2(45 / lonSpanDegrees);
	const zoomLevel = Math.min(18, Math.max(4, Math.floor(Math.min(zoomFromLat, zoomFromLon))));

	return {
		neLat,
		neLon,
		swLat,
		swLon,
		zoomLevel,
	};
}

// Function to set Google basemap
async function setGoogleLayer(lyrs: string) {
	if (!viewer) return;

	// Remove previous layer
	if (currentLayer) viewer.imageryLayers.remove(currentLayer);

	if (lyrs === '3d') {
		const tileset = await Cesium.createGooglePhotorealistic3DTileset();
		viewer.scene.primitives.add(tileset);
		return;
	}
	viewer.scene.primitives.removeAll();
	const googleBasemap = new Cesium.UrlTemplateImageryProvider({
		url: `https://mt{s}.google.com/vt/lyrs=${lyrs}&x={x}&y={y}&z={z}`,
		subdomains: ['0', '1', '2', '3'],
		credit: 'Google Maps',
	});

	currentLayer = viewer.imageryLayers.addImageryProvider(googleBasemap);
}

onMounted(async () => {
	if (!cesiumContainer.value) return;

	viewer = new Cesium.Viewer(cesiumContainer.value, {
		terrain: Cesium.Terrain.fromWorldTerrain({
			requestVertexNormals: true,
			requestWaterMask: true,
		}),
		infoBox: false,
		selectionIndicator: false,
		animation: false,
		timeline: false,
		baseLayerPicker: false,
		navigationHelpButton: false,
		homeButton: false,
		geocoder: false,
		sceneModePicker: false,
		fullscreenButton: false,
	});

	await setGoogleLayer(selectedLayer.value);

	cameraViewForApi.value = getCameraViewForApi();

	unsubscribeMoveEnd = viewer.camera.moveEnd.addEventListener(() => {
		cameraViewForApi.value = getCameraViewForApi();
	});

	//await getFlightStates();
	//addPlane(-74.006, 40.7128, 12000, 90);
	//addMovingPlane();

	//viewer.scene.globe.enableLighting = true;
	//viewer.clock.currentTime = Cesium.JulianDate.fromIso8601('2023-01-01T00:00:00');

	//gotoNewYork(viewer);
});

function gotoNewYork(viewer: Cesium.Viewer) {
	viewer.entities.add({
		name: 'New York City',
		position: Cesium.Cartesian3.fromDegrees(-74.006, 40.7128),
		point: { pixelSize: 12, color: Cesium.Color.RED },
	});
	viewer.camera.flyTo({
		destination: Cesium.Cartesian3.fromDegrees(-74.006, 40.7128, 1500000),
	});
}

function gotoMountEverest(viewer: Cesium.Viewer) {
	const target = new Cesium.Cartesian3(300770.50872389384, 5634912.131394585, 2978152.2865545116);
	const offset = new Cesium.Cartesian3(6344.974098678562, -793.3419798081741, 2499.9508860763162);
	viewer.camera.lookAt(target, offset);
	viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
}

function resetToNorthUp() {
	if (!viewer) return;

	const camera = viewer.camera;

	viewer.camera.flyTo({
		destination: camera.position,
		orientation: {
			heading: 0.0,
			pitch: -Cesium.Math.PI_OVER_TWO,
			roll: 0.0,
		},
		duration: 1.0,
	});
}

function addPlane(
	id: string,
	name: string,
	longitude: number,
	latitude: number,
	altitude: number = 10000,
	headingDegrees: number = 0,
) {
	if (!viewer) return;

	const position = Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude);

	const heading = Cesium.Math.toRadians(headingDegrees);
	const pitch = 0;
	const roll = 0;

	const orientation = Cesium.Transforms.headingPitchRollQuaternion(
		position,
		new Cesium.HeadingPitchRoll(heading, pitch, roll),
	);

	const plane = viewer.entities.add({
		id: id,
		name: `Aircraft ${name}`,
		position,
		orientation,
		model: {
			uri: '/Cesium_Air.glb', // ← place your glb model in /public/models/
			minimumPixelSize: 64,
			maximumScale: 200,
		},
	});

	return plane;
}

function addMovingPlane() {
	if (!viewer) return;

	// Flight duration (seconds)
	const flightSeconds = 120;

	const start = Cesium.JulianDate.now();
	const stop = Cesium.JulianDate.addSeconds(start, flightSeconds, new Cesium.JulianDate());

	// Configure clock
	viewer.clock.startTime = start.clone();
	viewer.clock.stopTime = stop.clone();
	viewer.clock.currentTime = start.clone();
	viewer.clock.multiplier = 1; // speed (1 = real-time)
	viewer.clock.shouldAnimate = true;

	viewer.timeline?.zoomTo(start, stop);

	// Create position property
	const position = new Cesium.SampledPositionProperty();

	// Start: New York
	const startPosition = Cesium.Cartesian3.fromDegrees(-74.006, 40.7128, 10000);

	// End: Boston
	const endPosition = Cesium.Cartesian3.fromDegrees(-71.0589, 42.3601, 10000);

	position.addSample(start, startPosition);
	position.addSample(stop, endPosition);

	// Interpolation for smooth motion
	position.setInterpolationOptions({
		interpolationDegree: 2,
		interpolationAlgorithm: Cesium.HermitePolynomialApproximation,
	});

	// Add aircraft entity
	const plane = viewer.entities.add({
		availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({ start, stop })]),
		position: position,
		orientation: new Cesium.VelocityOrientationProperty(position),
		model: {
			uri: '/Cesium_Air.glb', // put model in public/models
			minimumPixelSize: 64,
			maximumScale: 200,
		},
		path: {
			resolution: 1,
			material: Cesium.Color.YELLOW,
			width: 2,
		},
	});

	// Track the plane
	viewer.trackedEntity = plane;

	// Fly camera to start
	viewer.camera.flyTo({
		destination: Cesium.Cartesian3.fromDegrees(-74.006, 40.7128, 500000),
	});

	return plane;
}

async function getFlightStates() {
	const statesAll = await flightAPI.get('/states/all');
	const mappedStates = statesAll.data.states.map((el: Array<boolean | string | number | null>) => {
		const [
			icao24,
			callsign,
			origin_country,
			time_position,
			last_contact,
			longitude,
			latitude,
			baro_altitude,
			on_ground,
			velocity,
			true_track,
			vertical_rate,
			sensors,
			geo_altitude,
			squawk,
			spi,
			position_source,
			category,
		] = el;
		return {
			icao24,
			callsign,
			origin_country,
			time_position,
			last_contact,
			longitude,
			latitude,
			baro_altitude,
			on_ground,
			velocity,
			true_track,
			vertical_rate,
			sensors,
			geo_altitude,
			squawk,
			spi,
			position_source,
			category,
		};
	});

	let plane;
	let i = 0;
	for (const state of mappedStates) {
		if (!state.latitude || !state.latitude || !state.geo_altitude || !state.true_track) continue;
		plane = addPlane(
			state.icao24 as string,
			state.callsign as string,
			state.longitude as number,
			state.latitude as number,
			state.geo_altitude as number,
			state.true_track as number,
		);
		if (i === 100) break;
		i += 1;
	}
	viewer!.flyTo(plane!);

	const now = Math.floor(Date.now() / 1000);
	const before = now - 10 * 60;
	const flightsAll = await flightAPI.get(`/flights/all?begin=${before}&end=${now}`);
	for (const flight of flightsAll.data) {
		console.log(
			flight,
			mappedStates.filter((el: { icao24: string }) => el.icao24 === flight.icao24),
		);
		const track = await flightAPI.get(`/tracks/all?icao24=${flight.icao24}`);
		console.log(track);
		break;
	}
}

function removeAllMarkers() {
	if (!viewer) return;
	viewer.entities.removeAll();
}

async function getCameraMarkerHeights(positions: Array<{ longitude: number; latitude: number }>): Promise<number[]> {
	if (!viewer) return positions.map(() => heightOffset);

	const cartographics = positions.map(({ longitude, latitude }) =>
		Cesium.Cartographic.fromDegrees(longitude, latitude),
	);
	const sampledHeights: Array<number | undefined> = new Array(cartographics.length).fill(undefined);

	if (viewer.scene.sampleHeightSupported) {
		try {
			const sampled = await viewer.scene.sampleHeightMostDetailed(cartographics.map((c) => c.clone()));
			sampled.forEach((result, index) => {
				sampledHeights[index] = result?.height;
			});
		} catch {
			// Fallback to terrain sampling below.
		}
	}

	const missingSamples: Array<{ originalIndex: number; cartographic: Cesium.Cartographic }> = [];
	for (const [index, height] of sampledHeights.entries()) {
		if (Number.isFinite(height)) continue;
		const cartographic = cartographics[index];
		if (!cartographic) continue;
		missingSamples.push({ originalIndex: index, cartographic: cartographic.clone() });
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

	return sampledHeights.map((height) => (Number.isFinite(height) ? (height as number) : 0) + heightOffset);
}

async function focusSelectedCamera() {
	const selected = selectedCameraInfo.value;
	const longitude = selected?.location?.longitude;
	const latitude = selected?.location?.latitude;
	if (!viewer || !selected || typeof longitude !== 'number' || typeof latitude !== 'number') return;

	const [markerHeight] = await getCameraMarkerHeights([{ longitude, latitude }]);
	const flyToHeight = (markerHeight ?? heightOffset) + heightOffset;

	viewer.camera.flyTo({
		destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, flyToHeight),
		duration: 0.8,
	});
}

async function focusCameraFromList(camera: ClusterCamera) {
	if (!viewer) return;

	const longitude = camera.location?.longitude;
	const latitude = camera.location?.latitude;
	if (typeof longitude !== 'number' || typeof latitude !== 'number') return;

	const markerId = `camera-${camera.webcamId}`;
	const entity = viewer.entities.getById(markerId);

	if (entity) {
		viewer.selectedEntity = entity;
	} else {
		selectedCameraInfo.value = {
			...(camera as SelectedCameraInfo),
			id: markerId,
			name: camera.title,
		};
	}

	const [markerHeight] = await getCameraMarkerHeights([{ longitude, latitude }]);
	const flyToHeight = (markerHeight ?? heightOffset) + heightOffset;

	viewer.camera.flyTo({
		destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, flyToHeight),
		duration: 0.8,
	});
}

function closeSelectedCameraCard() {
	selectedCameraInfo.value = null;
	if (viewer) {
		viewer.selectedEntity = undefined;
	}
}

// Watch for changes in the selected layer
watch(selectedLayer, async (newVal) => {
	await setGoogleLayer(newVal);
});

watch(cameraViewForApi, async (newVal) => {
	if (!newVal) return;
	if (!areWebcamsEnabled.value) {
		mapViewCameras.value = [];
		removeAllMarkers();
		selectedCameraInfo.value = null;
		if (viewer) viewer.selectedEntity = undefined;
		return;
	}

	const cameras = (await cameraStore.getMapClusters(
		newVal.neLat,
		newVal.swLat,
		newVal.neLon,
		newVal.swLon,
		newVal.zoomLevel,
	)) as ClusterCamera[] | null;
	mapViewCameras.value = cameras ?? [];
	if (!cameras || !viewer) return;
	removeAllMarkers();

	const camerasWithCoords = cameras
		.map((camera) => ({
			camera,
			longitude: camera.location?.longitude,
			latitude: camera.location?.latitude,
		}))
		.filter(
			(entry): entry is { camera: (typeof cameras)[number]; longitude: number; latitude: number } =>
				typeof entry.longitude === 'number' && typeof entry.latitude === 'number',
		);

	if (camerasWithCoords.length === 0) return;

	const markerHeights = await getCameraMarkerHeights(
		camerasWithCoords.map(({ longitude, latitude }) => ({ longitude, latitude })),
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
				position: Cesium.Cartesian3.fromDegrees(entry.longitude, entry.latitude, markerHeights[index]),
				point: { pixelSize: 12, color: Cesium.Color.RED },
				properties: markerData,
			});
		}
	} finally {
		viewer.entities.resumeEvents();
	}
});

watch(areWebcamsEnabled, (enabled) => {
	if (enabled) {
		cameraViewForApi.value = getCameraViewForApi();
		return;
	}

	mapViewCameras.value = [];
	removeAllMarkers();
	selectedCameraInfo.value = null;
	if (viewer) viewer.selectedEntity = undefined;
});

onMounted(() => {
	if (!viewer) return;
	unsubscribeSelectedEntityChanged = viewer.selectedEntityChanged.addEventListener((entity) => {
		// Keep the current dialog open when Cesium briefly clears selection (e.g. while flying to a camera).
		if (!entity) {
			return;
		}

		if (!entity.id || typeof entity.id !== 'string' || !entity.id.startsWith('camera-')) {
			selectedCameraInfo.value = null;
			return;
		}

		selectedCameraInfo.value = {
			...(entity.properties?.camera?.getValue?.() ?? {}),
			id: entity.id,
			name: entity.name,
		};
	});
});

watch(
	() => selectedCameraInfo.value?.images?.current.preview,
	(newPreview) => {
		if (previewRefreshTimer) {
			clearInterval(previewRefreshTimer);
			previewRefreshTimer = undefined;
		}

		if (!newPreview) return;

		previewRefreshNonce.value = Date.now();
		previewRefreshTimer = setInterval(() => {
			previewRefreshNonce.value = Date.now();
		}, 10000);
	},
	{ immediate: true },
);

onBeforeUnmount(() => {
	unsubscribeMoveEnd?.();
	unsubscribeSelectedEntityChanged?.();
	if (previewRefreshTimer) clearInterval(previewRefreshTimer);
	if (viewer) viewer.destroy();
});
</script>

<style>
.cesium-widget-credits {
	visibility: hidden !important;
}
</style>
