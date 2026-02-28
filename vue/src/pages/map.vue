<template>
	<!--
		<v-row
			class="pa-2"
			align="center"
		>
			<v-col
				cols="12"
				sm="4"
				md="3"
			>
				<v-select
					v-model="selectedLayer"
					:items="layers"
					item-value="value"
					item-title="label"
					label="Select Google Maps Layer"
					dense
				></v-select>
			</v-col>
			<v-col>
				<v-btn @click="resetToNorthUp">Reset</v-btn>
			</v-col>
		</v-row>


	</v-container>
-->
	<v-card class="pa-5 h-100">
		<v-row class="h-100">
			<v-col cols="2">
				<div class="d-flex flex-column ga-5">
					<v-btn
						@click="resetToNorthUp"
						color="primary"
						block
						>Reset Rotation</v-btn
					>
					<v-select
						v-model="selectedLayer"
						:items="layers"
						item-value="value"
						item-title="label"
						label="Select Google Maps Layer"
						dense
					></v-select>
				</div>
			</v-col>
			<v-col cols="8">
				<v-card class="rounded-lg">
					<div
						ref="cesiumContainer"
						class=""
					></div>
				</v-card>
			</v-col>
			<v-col cols="2">
				<map-items></map-items>
			</v-col>
		</v-row>
	</v-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import * as Cesium from 'cesium';
import axios from 'axios';
import { statesAll } from '@/mockFlight';
import MapItems from '@/components/MapItems.vue';

//https://openskynetwork.github.io/opensky-api
const flightAPI = axios.create({
	baseURL: 'https://opensky-network.org/api',
});

Cesium.Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_TOKEN;

const cesiumContainer = ref<HTMLDivElement | null>(null);
let viewer: Cesium.Viewer | undefined;
let currentLayer: Cesium.ImageryLayer | undefined;

// Define available Google layers
const layers = [
	{ label: 'Roadmap', value: 'm' },
	{ label: 'Satellite', value: 's' },
	{ label: 'Hybrid', value: 'y' },
	{ label: 'Terrain', value: 't' },
	{ label: '3D-Satellite', value: '3d' },
];
const selectedLayer = ref('3d'); // default to Roadmap

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

	//await getFlightStates();
	//addPlane(-74.006, 40.7128, 12000, 90);
	//addMovingPlane();

	//viewer.scene.globe.enableLighting = true;
	//viewer.clock.currentTime = Cesium.JulianDate.fromIso8601('2023-01-01T00:00:00');

	gotoNewYork(viewer);
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

// Watch for changes in the selected layer
watch(selectedLayer, async (newVal) => {
	await setGoogleLayer(newVal);
});

onBeforeUnmount(() => {
	if (viewer) viewer.destroy();
});
</script>

<style>
.cesium-widget-credits {
	visibility: hidden !important;
}
</style>
