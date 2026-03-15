<template>
			<div>{{ viewedBounds }}</div>
		<v-card class="h-full p-0 overflow-hidden">
		<div class="map-stage relative w-full h-full">
			<CesiumMap
  		  v-model:viewer="viewer"
  		  v-model:layer="selectedLayer"
				v-model:bounds="visibleBounds"
  		/>
			<div class="absolute top-0 left-0 m-4 pr-9 w-full flex justify-between items-start pointer-events-none">
				<MapOptions v-model:layer="selectedLayer"></MapOptions>
				<MapSearch v-model:search="search"></MapSearch>
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
import { ref, watch } from 'vue';
import { getWebcams, type WindyWebcamResponse } from '@/apis/windy';
import { useDebounceFn } from '@vueuse/core';
import * as turf from '@turf/turf';
import type {
	Feature,
	GeoJsonProperties,
	MultiPolygon,
	Polygon,
} from 'geojson';

export type BBox = {
	west: number;
	south: number;
	east: number;
	north: number;
};

export type CellSize = {
	width: number;
	height: number;
};

const viewer = ref<Cesium.Viewer>();
const search = ref<string>('');
const showInfo = ref<boolean>(false);
const selectedLayer = ref('3d');
const visibleBounds = ref<BBox | null>(null);
const viewedBounds = ref<Feature<
	Polygon | MultiPolygon,
	GeoJsonProperties
> | null>();

function getMapCellSize(bbox: BBox, chunkSize: number): CellSize {
	const width = (bbox.east - bbox.west) / chunkSize;
	const height = (bbox.north - bbox.south) / chunkSize;

	return {
		width,
		height,
	};
}

function getMapChunks(bbox: BBox, chunkSize: number): BBox[] {
	const cell = getMapCellSize(bbox, chunkSize);

	const chunks: BBox[] = [];

	for (let x = 0; x < chunkSize; x++) {
		for (let y = 0; y < chunkSize; y++) {
			const west = bbox.west + x * cell.width;
			const east = west + cell.width;

			const south = bbox.south + y * cell.height;
			const north = south + cell.height;

			chunks.push({
				west,
				south,
				east,
				north,
			});
		}
	}

	return chunks;
}

async function subDivideChunks(chunkBBoxes: BBox[], size: number) {
	const webcamsPerChunk: WindyWebcamResponse[] = [];
	for (let i = 0; i < chunkBBoxes.length; i++) {
		const chunk = chunkBBoxes[i]!;
		const webcams = await getWebcams({
			limit: 50,
			bbox: `${chunk.north},${chunk.east},${chunk.south},${chunk.west}`,
		});
		if (webcams.total >= 1000) {
			const newChunkBBoxes = getMapChunks(chunk, size);
			chunkBBoxes.splice(i, 1, ...newChunkBBoxes);
			i--;
			continue;
		}
		webcamsPerChunk.push(webcams);
	}
	return { bbox: chunkBBoxes, webcams: webcamsPerChunk };
}

function drawMapChunks(chunkBBoxes: BBox[]) {
	const colors = [
		Cesium.Color.RED.withAlpha(0.4),
		Cesium.Color.BLUE.withAlpha(0.4),
		Cesium.Color.GREEN.withAlpha(0.4),
		Cesium.Color.YELLOW.withAlpha(0.4),
		Cesium.Color.ORANGE.withAlpha(0.4),
		Cesium.Color.PURPLE.withAlpha(0.4),
	];

	viewer.value!.entities.removeAll();
	for (let i = 0; i < chunkBBoxes.length; i++) {
		const bbox = chunkBBoxes[i]!;
		const color = colors[i % colors.length];

		viewer.value!.entities.add({
			rectangle: {
				coordinates: Cesium.Rectangle.fromDegrees(
					bbox.west,
					bbox.south,
					bbox.east,
					bbox.north,
				),
				material: color,
				//outline: true,
				//outlineColor: Cesium.Color.WHITE,
				height: 1000,
			},
		});
	}
}

watch(
	visibleBounds,
	useDebounceFn(async (bbox) => {
		const isZoomedOut =
			bbox &&
			bbox.west === -180 &&
			bbox.south === -90 &&
			bbox.east === 180 &&
			bbox.north === 90;
		if (!bbox || isZoomedOut) {
			return;
		}

		const size = 5;
		//const cellSide = getMapCellSize(bbox, size);
		//console.log(cellSide);

		let chunkBBoxes = getMapChunks(bbox, size);
		const subdivided = await subDivideChunks(chunkBBoxes, size);
		chunkBBoxes = subdivided.bbox;
		//const webcams = subdivided.webcams;
		//console.log(webcams);

		drawMapChunks(chunkBBoxes);
	}, 750),
);
</script>
