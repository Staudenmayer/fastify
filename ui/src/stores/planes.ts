import { defineStore } from 'pinia';
import axios from 'axios';

import * as Cesium from 'cesium';

type FlightStateRaw = Array<boolean | string | number | null>;

type PlanePosition = { long: number; lat: number; alt: number };

export const usePlanes = defineStore('plane', {
	state: () => ({}),
	actions: {
		flightAPI() {
			return axios.create({
				baseURL: 'https://opensky-network.org/api',
			});
		},

		addPlane(
			viewer: Cesium.Viewer,
			id: string,
			name: string,
			longitude: number,
			latitude: number,
			altitude: number = 10000,
			headingDegrees: number = 0,
		) {
			const position = Cesium.Cartesian3.fromDegrees(
				longitude,
				latitude,
				altitude,
			);

			const heading = Cesium.Math.toRadians(headingDegrees);
			const pitch = 0;
			const roll = 0;

			const orientation = Cesium.Transforms.headingPitchRollQuaternion(
				position,
				new Cesium.HeadingPitchRoll(heading, pitch, roll),
			);

			const plane = viewer.entities.add({
				id: `plane-${id}`,
				name: `Aircraft ${name}`,
				position,
				orientation,
				model: {
					uri: '/models/Cesium_Air.glb',
					minimumPixelSize: 64,
					maximumScale: 200,
					color: Cesium.Color.RED,
				},
			});

			return plane;
		},

		addMovingPlaneDynamic(
			viewer: Cesium.Viewer,
			startPosition: PlanePosition,
			endPosition: PlanePosition,
			currentPosition: PlanePosition,
			remainingTime: number,
		) {
			const start = Cesium.JulianDate.now();
			const stop = Cesium.JulianDate.addSeconds(
				start,
				remainingTime,
				new Cesium.JulianDate(),
			);
			const midTime = Cesium.JulianDate.addSeconds(
				start,
				remainingTime / 2,
				new Cesium.JulianDate(),
			);

			viewer.clock.startTime = start.clone();
			viewer.clock.stopTime = stop.clone();
			viewer.clock.currentTime = start.clone();
			viewer.clock.multiplier = 1;
			viewer.clock.shouldAnimate = true;
			viewer.timeline?.zoomTo(start, stop);

			const position = new Cesium.SampledPositionProperty();

			const startCart = Cesium.Cartesian3.fromDegrees(
				startPosition.long,
				startPosition.lat,
				startPosition.alt,
			);
			const endCart = Cesium.Cartesian3.fromDegrees(
				endPosition.long,
				endPosition.lat,
				endPosition.alt,
			);
			const currentCart = currentPosition
				? Cesium.Cartesian3.fromDegrees(
						currentPosition.long,
						currentPosition.lat,
						currentPosition.alt,
					)
				: Cesium.Cartesian3.fromDegrees(
						(startPosition.long + endPosition.long) / 2,
						(startPosition.lat + endPosition.lat) / 2,
						(Math.max(startPosition.alt, endPosition.alt) || 10000) + 15000,
					);

			position.addSample(start, startCart);
			position.addSample(midTime, currentCart);
			position.addSample(stop, endCart);

			position.setInterpolationOptions({
				interpolationDegree: 2,
				interpolationAlgorithm: Cesium.HermitePolynomialApproximation,
			});

			const plane = viewer.entities.add({
				id: 'plane-animation',
				availability: new Cesium.TimeIntervalCollection([
					new Cesium.TimeInterval({ start, stop }),
				]),
				position,
				orientation: new Cesium.VelocityOrientationProperty(position),
				model: {
					uri: '/models/Cesium_Air.glb',
					minimumPixelSize: 64,
					maximumScale: 200,
					color: Cesium.Color.RED,
				},
				path: {
					resolution: 1,
					material: Cesium.Color.YELLOW,
					width: 2,
				},
			});

			viewer.flyTo(plane);
			viewer.trackedEntity = plane;

			return plane;
		},

		async getFlightStates(viewer: Cesium.Viewer) {
			const statesAll = await this.flightAPI().get('/states/all');
			const mappedStates = statesAll.data.states.map((el: FlightStateRaw) => {
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

			let plane: Cesium.Entity | undefined;
			let i = 0;

			for (const state of mappedStates) {
				if (
					!state.latitude ||
					!state.latitude ||
					!state.geo_altitude ||
					!state.true_track
				) {
					continue;
				}

				plane = this.addPlane(
					viewer,
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

			if (plane) viewer.flyTo(plane);

			const now = Math.floor(Date.now() / 1000);
			const before = now - 10 * 60;
			const flightsAll = await this.flightAPI().get(
				`/flights/all?begin=${before}&end=${now}`,
			);

			for (const flight of flightsAll.data) {
				console.log(
					flight,
					mappedStates.filter(
						(el: { icao24: string }) => el.icao24 === flight.icao24,
					),
				);

				const track = await this.flightAPI().get(
					`/tracks/all?icao24=${flight.icao24}`,
				);
				console.log(track);
				break;
			}

			return mappedStates;
		},
	},
});
