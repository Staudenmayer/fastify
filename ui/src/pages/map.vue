<template>
		<v-card class="h-full p-0 overflow-hidden">
		<div class="map-stage relative w-full h-full">
			<CesiumMap
  		  v-model:viewer="viewer"
  		  v-model:layer="selectedLayer"
				v-model:bounds="visibleBounds"
  		/>
			<div class="absolute top-0 left-0 m-4 pr-9 w-full flex justify-between items-start pointer-events-none">
				<MapOptions v-model:layer="selectedLayer"></MapOptions>
				<MapSearch v-model:search="search" v-model:selected="selected"></MapSearch>
				<MapInfo v-model:visible="showInfo"></MapInfo>
			</div>
		</div>
	</v-card>
</template>
<script setup lang="ts">
import * as Cesium from 'cesium';
import CesiumMap from '@/components/CesiumMap.vue';
import MapOptions from '@/components/MapOptions.vue';
import MapSearch from '@/components/MapSearch.vue';
import MapInfo from '@/components/MapInfo.vue';
import { onMounted, reactive, ref, watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import * as turf from '@turf/turf';
import type {
	Feature,
	GeoJsonProperties,
	MultiPolygon,
	Polygon,
} from 'geojson';
import {
	type BBox,
	getMapChunks,
	growPoly,
	subDivideChunks,
	drawViewedBounds,
	restoreViewedBoundsFromStorage,
	drawWebcams,
} from '@/helper/map';
import type { NominatimSearchResponse } from '@/apis/nominatim';
import { Dexie, type Table } from 'dexie';
import type { WindyWebcam } from '@/apis/windy';

const viewer = ref<Cesium.Viewer>();
const search = ref<string>('');
const showInfo = ref<boolean>(false);
const selectedLayer = ref('3d');
const selected = ref<NominatimSearchResponse | null>(null);
const visibleBounds = ref<BBox | null>(null);
const viewedBounds = reactive<
	Feature<Polygon | MultiPolygon, GeoJsonProperties>[]
>([]);

const webcams = reactive<WindyWebcam[]>([]);

class WebcamDB extends Dexie {
	webcams!: Table<WindyWebcam, number>;

	constructor() {
		super('webcamDB');

		this.version(1).stores({
			// primary key + indexes
			webcams: 'webcamId, status, viewCount, lastUpdatedOn',
		});
	}
}

const db = new WebcamDB();

onMounted(async () => {
	const newBounds = restoreViewedBoundsFromStorage();
	if (newBounds?.length) {
		viewedBounds.length = 0;
		viewedBounds.push(...newBounds);
	}
	if (viewer.value && viewedBounds.length > 0) {
		drawViewedBounds(viewer.value, viewedBounds);
	}
	await getLiveWebcams();
	//const webcams = await db.webcams.toArray();
	//console.log(webcams);
});

async function getLiveWebcams() {
	const entriesWithLivePlayer = await db.webcams
		.filter((entry) => !!entry?.player?.live)
		.toArray();
	webcams.push(...entriesWithLivePlayer);
	if (!viewer.value) {
		return;
	}
	drawWebcams(viewer.value, webcams);
}

watch(viewer, (newViewer) => {
	if (!newViewer || viewedBounds.length === 0) {
		return;
	}
	drawViewedBounds(newViewer, viewedBounds);
});

watch(selected, (newVal) => {
	if (!newVal || !viewer.value) {
		return;
	}
	viewer.value.camera.flyTo({
		destination: Cesium.Cartesian3.fromDegrees(
			Number.parseFloat(newVal.lon),
			Number.parseFloat(newVal.lat),
			15000.0,
		), // lon, lat, height (meters)
	});
});

watch(
	visibleBounds,
	useDebounceFn(async (bbox) => {
		//check if zoomed out
		const isZoomedOut =
			bbox &&
			bbox.west === -180 &&
			bbox.south === -90 &&
			bbox.east === 180 &&
			bbox.north === 90;
		if (!bbox || isZoomedOut) {
			return;
		}

		//combine polygons
		const size = 5;
		const currentBbox = turf.bboxPolygon([
			bbox.west,
			bbox.south,
			bbox.east,
			bbox.north,
		]);
		let isContained = false;
		for (const boundbox of viewedBounds) {
			isContained = isContained || turf.booleanContains(boundbox, currentBbox);
		}
		if (isContained) {
			return;
		}
		const newViewedBounds = growPoly(viewer.value!, viewedBounds, bbox);
		viewedBounds.length = 0;
		viewedBounds.push(...newViewedBounds);

		//save polygons
		for (let i = 0; i < viewedBounds.length; i++) {
			const coordinates = JSON.stringify(viewedBounds[i]?.geometry.coordinates);
			localStorage.setItem(`bounds-${i}`, coordinates);
		}
		localStorage.setItem('bound-count', viewedBounds.length.toString());

		//chunk view
		let chunkBBoxes = getMapChunks(bbox, size);
		const subdivided = await subDivideChunks(chunkBBoxes, size);
		chunkBBoxes = subdivided.bbox;
		const webcams = subdivided.webcams;
		for (const webcamCollection of webcams) {
			db.webcams.bulkPut(webcamCollection.webcams);
		}
		await getLiveWebcams();
	}, 750),
);
</script>
