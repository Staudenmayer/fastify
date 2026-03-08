<template>
	<v-card class="h-full p-0 overflow-hidden">
		<div class="map-stage relative w-full h-full">
			<div
				ref="cesiumContainer"
				class="cesium-container w-full h-full"
			></div>

			<div
				class="absolute top-0 left-0 m-4"
				style="z-index: 10; width: 20dvw; max-height: calc(100vh - 8rem)"
			>
				<v-card
					v-if="isMapItemsVisible"
					class="relative bg-[rgb(var(--v-theme-surface))] p-5 flex flex-col"
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
					class="rounded-lg p-2 m-5"
					color="primary"
					@click="isMapItemsVisible = true"
				></v-btn>
			</div>

			<map-marker-info
				:selected-camera-info="selectedCameraInfo"
				:selected-preview-url="selectedPreviewUrl"
				:selected-player-url="selectedPlayerUrl"
				@focus="focusSelectedCamera"
				@close="closeSelectedCameraCard"
			/>
		</div>
	</v-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import * as Cesium from 'cesium';
import MapItems from '@/components/MapItems.vue';
import MapMarkerInfo from '@/components/mapMarkerInfo.vue';
import {
	useCameraData,
	type CameraViewForApi,
	type SelectedCameraInfo,
	type ClusterCamera,
} from '@/stores/cameras';
import { usePlanes } from '@/stores/planes';

const cameraStore = useCameraData();
const planeStore = usePlanes();

Cesium.Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_TOKEN;

//https://nominatim.openstreetmap.org/search?q=Eiffel%20tower&format=json
//https://opendata.stackexchange.com/questions/15329/free-source-of-ais-data-api

const cesiumContainer = ref<HTMLDivElement | null>(null);
let viewer: Cesium.Viewer | undefined;
let currentLayer: Cesium.ImageryLayer | undefined;
let unsubscribeMoveEnd: (() => void) | undefined;
let unsubscribeSelectedEntityChanged: (() => void) | undefined;
let previewRefreshTimer: ReturnType<typeof setInterval> | undefined;
let heightOffset = 25;

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
	if (typeof player?.live === 'string' && player.live.length > 0)
		return player.live;
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
	return cameraStore.getCameraViewForApi(viewer);
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
	//const plane = addPlane('test', 'Test', -74.006, 40.7128, 12000, 90);
	//viewer.flyTo(plane!);

	const start = { long: -74.006, lat: 40.7128, alt: 10000 }; // New York
	const end = { long: -71.0589, lat: 42.3601, alt: 10000 }; // Boston
	const current = { long: -73.0, lat: 41.5, alt: 25000 }; // mid-flight position
	const remainingTime = 120; // seconds

	//planeStore.addMovingPlaneDynamic(viewer, start, end, current, remainingTime);
});

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

async function focusSelectedCamera() {
	await cameraStore.focusSelectedCamera(
		viewer,
		selectedCameraInfo.value,
		heightOffset,
	);
}

async function focusCameraFromList(camera: ClusterCamera) {
	const selected = await cameraStore.focusCameraFromList(
		viewer,
		camera,
		heightOffset,
	);
	if (selected) {
		selectedCameraInfo.value = selected;
	}
}

function closeSelectedCameraCard() {
	selectedCameraInfo.value = null;
	cameraStore.closeSelectedCameraCard(viewer);
}

async function rerenderCameras(newVal: CameraViewForApi) {
	if (!areWebcamsEnabled.value) {
		mapViewCameras.value = [];
		cameraStore.removeAllCameraMarkers(viewer);
		selectedCameraInfo.value = null;
		cameraStore.closeSelectedCameraCard(viewer);
		return;
	}

	const cameras = await cameraStore.loadMapViewCameras(newVal);
	mapViewCameras.value = cameras;
	await cameraStore.rerenderCameraMarkers(viewer, cameras, heightOffset);
}

onMounted(() => {
	if (!viewer) return;
	unsubscribeSelectedEntityChanged =
		viewer.selectedEntityChanged.addEventListener((entity) => {
			// Keep the current dialog open when Cesium briefly clears selection (e.g. while flying to a camera).
			if (!entity) {
				return;
			}

			selectedCameraInfo.value =
				cameraStore.getSelectedCameraInfoFromEntity(entity);
		});
});

onBeforeUnmount(() => {
	viewer?.destroy();
	unsubscribeMoveEnd?.();
	unsubscribeSelectedEntityChanged?.();
	if (previewRefreshTimer) clearInterval(previewRefreshTimer);
	if (viewer) viewer.destroy();
});

// Watch for changes in the selected layer
watch(selectedLayer, async (newVal) => {
	await setGoogleLayer(newVal);
});

watch(cameraViewForApi, async (newVal) => {
	if (!newVal) return;
	await rerenderCameras(newVal);
});

watch(areWebcamsEnabled, (enabled) => {
	if (enabled) {
		cameraViewForApi.value = getCameraViewForApi();
		return;
	}

	mapViewCameras.value = [];
	cameraStore.removeAllCameraMarkers(viewer);
	selectedCameraInfo.value = null;
	cameraStore.closeSelectedCameraCard(viewer);
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
</script>

<style>
.cesium-widget-credits {
	visibility: hidden !important;
}
</style>
