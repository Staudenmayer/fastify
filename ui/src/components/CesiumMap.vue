<template>
	<div ref="cesiumContainer" class="cesium-container w-full h-full"></div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import * as Cesium from 'cesium';

const cesiumContainer = ref<HTMLDivElement | null>(null);

// v-models
const viewer = defineModel<Cesium.Viewer | undefined>('viewer');
const selectedLayer = defineModel<string>('layer', { default: '3d' });
const visibleBounds = defineModel<{
	west: number;
	south: number;
	east: number;
	north: number;
} | null>('bounds', { default: null });

const viewerRef = ref<Cesium.Viewer>();
const layer = ref<Cesium.ImageryLayer | undefined>();

//const visibleBounds = ref<{
//	west: number;
//	south: number;
//	east: number;
//	north: number;
//} | null>(null);
let removeCameraListener: (() => void) | undefined;

Cesium.Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_TOKEN;

onMounted(async () => {
	createViewer();
	setupVisibleBoundsWatcher();
	await setGoogleLayer(selectedLayer.value);
});

onBeforeUnmount(() => {
	removeCameraListener?.();
});

watch(selectedLayer, (val) => {
	setGoogleLayer(val);
});

function createViewer() {
	if (!cesiumContainer.value) return;

	const v = new Cesium.Viewer(cesiumContainer.value, {
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
		baseLayer: false,
	});

	viewerRef.value = v;
	viewer.value = v;
}

function setupVisibleBoundsWatcher() {
	const v = viewerRef.value;
	if (!v) return;

	v.camera.percentageChanged = 0.01;
	const updateVisibleBounds = () => {
		const rect = v.camera.computeViewRectangle(v.scene.globe.ellipsoid);

		if (!rect) {
			visibleBounds.value = null;
			return;
		}

		visibleBounds.value = {
			west: Cesium.Math.toDegrees(rect.west),
			south: Cesium.Math.toDegrees(rect.south),
			east: Cesium.Math.toDegrees(rect.east),
			north: Cesium.Math.toDegrees(rect.north),
		};
	};

	v.camera.changed.addEventListener(updateVisibleBounds);
	removeCameraListener = () => {
		v.camera.changed.removeEventListener(updateVisibleBounds);
	};

	updateVisibleBounds();
}

// Function to set Google basemap
async function setGoogleLayer(lyrs: string) {
	const v = viewerRef.value;
	if (!v) return;

	v.imageryLayers.removeAll();

	if (lyrs === '3d') {
		v.scene.primitives.removeAll();
		const tileset = await Cesium.createGooglePhotorealistic3DTileset();
		v.scene.primitives.add(tileset);
		return;
	}

	v.scene.primitives.removeAll();

	const googleBasemap = new Cesium.UrlTemplateImageryProvider({
		url: `https://mt{s}.google.com/vt/lyrs=${lyrs}&x={x}&y={y}&z={z}`,
		subdomains: ['0', '1', '2', '3'],
		credit: 'Google Maps',
	});

	layer.value = v.imageryLayers.addImageryProvider(googleBasemap);
}
</script>

<style>
.cesium-widget-credits {
	visibility: hidden !important;
}
</style>
