import * as Cesium from 'cesium';
import * as turf from '@turf/turf';
import type {
	Feature,
	GeoJsonProperties,
	MultiPolygon,
	Polygon,
} from 'geojson';
import {
	getWebcams,
	type WindyWebcam,
	type WindyWebcamResponse,
} from '@/apis/windy';

export type CellSize = {
	width: number;
	height: number;
};

export type BBox = {
	west: number;
	south: number;
	east: number;
	north: number;
};

export function growPoly(
	viewer: Cesium.Viewer,
	viewedBounds: Feature<Polygon | MultiPolygon, GeoJsonProperties>[],
	bbox: BBox,
): Feature<Polygon | MultiPolygon, GeoJsonProperties>[] {
	const poly = turf.bboxPolygon([
		bbox.west,
		bbox.south,
		bbox.east,
		bbox.north,
	]) as Feature<Polygon | MultiPolygon, GeoJsonProperties>;

	const nextBounds = [...viewedBounds];
	let candidate = poly;

	for (let i = 0; i < nextBounds.length; ) {
		const current = nextBounds[i]!;
		const intersection = turf.intersect(
			turf.featureCollection([current, candidate]),
		);

		if (intersection) {
			const merged = turf.union(turf.featureCollection([current, candidate]));
			if (merged) {
				candidate = merged as Feature<
					Polygon | MultiPolygon,
					GeoJsonProperties
				>;
				nextBounds.splice(i, 1);
				i = 0;
				continue;
			}
		}

		i++;
	}

	nextBounds.push(candidate);

	let mergedAny = true;
	while (mergedAny) {
		mergedAny = false;

		mergeLoop: for (let i = 0; i < nextBounds.length; i++) {
			for (let j = i + 1; j < nextBounds.length; j++) {
				const first = nextBounds[i]!;
				const second = nextBounds[j]!;

				const intersection = turf.intersect(
					turf.featureCollection([first, second]),
				);

				if (!intersection) {
					continue;
				}

				const merged = turf.union(turf.featureCollection([first, second]));
				if (!merged) {
					continue;
				}

				nextBounds[i] = merged as Feature<
					Polygon | MultiPolygon,
					GeoJsonProperties
				>;
				nextBounds.splice(j, 1);
				mergedAny = true;
				break mergeLoop;
			}
		}
	}

	viewedBounds = nextBounds;

	viewer.entities.removeAll();
	if (!viewedBounds.length) {
		return [];
	}

	drawViewedBounds(viewer, viewedBounds);

	return viewedBounds;
}

export function drawViewedBounds(
	viewer: Cesium.Viewer,
	viewedBounds: Feature<Polygon | MultiPolygon, GeoJsonProperties>[],
) {
	const active = false;
	if (!active) {
		return;
	}
	for (const viewedPolygon of viewedBounds) {
		if (viewedPolygon.geometry.type === 'Polygon') {
			const ring = viewedPolygon.geometry.coordinates[0];
			if (!ring?.length) {
				continue;
			}

			viewer.entities.add({
				polygon: {
					hierarchy: Cesium.Cartesian3.fromDegreesArray(
						ring.flat() as number[],
					),
					material: Cesium.Color.PURPLE.withAlpha(0.1),
					height: 1000,
					outline: true,
					outlineColor: Cesium.Color.WHITE,
				},
			});
			continue;
		}

		for (const polygon of viewedPolygon.geometry.coordinates) {
			const ring = polygon[0];
			if (!ring?.length) {
				continue;
			}

			viewer.entities.add({
				polygon: {
					hierarchy: Cesium.Cartesian3.fromDegreesArray(
						ring.flat() as number[],
					),
					material: Cesium.Color.PURPLE.withAlpha(0.1),
					height: 1000,
					outline: true,
					outlineColor: Cesium.Color.WHITE,
				},
			});
		}
	}
}

export function restoreViewedBoundsFromStorage(): Feature<
	Polygon | MultiPolygon,
	GeoJsonProperties
>[] {
	const restoredBounds: Feature<Polygon | MultiPolygon, GeoJsonProperties>[] =
		[];
	const count = Number.parseInt(localStorage.getItem('bound-count') ?? '0', 10);
	if (!Number.isFinite(count) || count <= 0) {
		return restoredBounds;
	}

	for (let i = 0; i < count; i++) {
		const raw = localStorage.getItem(`bounds-${i}`);
		if (!raw) {
			continue;
		}

		try {
			const coordinates = JSON.parse(raw);
			if (Array.isArray(coordinates?.[0]?.[0]?.[0])) {
				restoredBounds.push(
					turf.multiPolygon(coordinates) as Feature<
						Polygon | MultiPolygon,
						GeoJsonProperties
					>,
				);
				continue;
			}

			restoredBounds.push(
				turf.polygon(coordinates) as Feature<
					Polygon | MultiPolygon,
					GeoJsonProperties
				>,
			);
		} catch {
			// ignore invalid localStorage entry
		}
	}
	return restoredBounds;
}

export function getMapCellSize(bbox: BBox, chunkSize: number): CellSize {
	const width = (bbox.east - bbox.west) / chunkSize;
	const height = (bbox.north - bbox.south) / chunkSize;

	return {
		width,
		height,
	};
}

export function getMapChunks(bbox: BBox, chunkSize: number): BBox[] {
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

export async function subDivideChunks(chunkBBoxes: BBox[], size: number) {
	const webcamsPerChunk: WindyWebcamResponse[] = [];
	for (let i = 0; i < chunkBBoxes.length; i++) {
		const chunk = chunkBBoxes[i]!;
		const webcams = await getWebcams({
			limit: 50,
			include: ['location', 'categories', 'images', 'player', 'urls'],
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

export function drawMapChunks(viewer: Cesium.Viewer, chunkBBoxes: BBox[]) {
	const colors = [
		Cesium.Color.RED.withAlpha(0.4),
		Cesium.Color.BLUE.withAlpha(0.4),
		Cesium.Color.GREEN.withAlpha(0.4),
		Cesium.Color.YELLOW.withAlpha(0.4),
		Cesium.Color.ORANGE.withAlpha(0.4),
		Cesium.Color.PURPLE.withAlpha(0.4),
	];

	viewer.entities.removeAll();
	for (let i = 0; i < chunkBBoxes.length; i++) {
		const bbox = chunkBBoxes[i]!;
		const color = colors[i % colors.length];

		viewer.entities.add({
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

export function drawWebcams(viewer: Cesium.Viewer, webcams: WindyWebcam[]) {
	for (const webcam of webcams) {
		if (viewer.entities.getById(`webcam-${webcam.webcamId}`)) {
			continue;
		}
		viewer.entities.add({
			id: `webcam-${webcam.webcamId}`,
			position: Cesium.Cartesian3.fromDegrees(
				webcam.location!.longitude,
				webcam.location!.latitude,
				10000.0,
			), // Lon/lat/height example
			model: {
				uri: '/models/Camera.glb', // Replace with your glTF/glb URL
				minimumPixelSize: 128,
				maximumScale: 20000,
				color: Cesium.Color.RED.withAlpha(0.8), // Reds the model (alpha for visibility of details)
			},
		});
	}
}
