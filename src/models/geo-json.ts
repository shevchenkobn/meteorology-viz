import { Feature, Point as GeoJsonPoint } from 'geojson';
import { Point } from '../lib/dom';
import { DeepReadonly } from '../lib/types';
import { getMeasurementId, MultiMeasurement } from './measurement';
import { Station } from './station';

export interface StationWithMeasurements<M extends DeepReadonly<MultiMeasurement>, S extends DeepReadonly<Station>> {
  station: S;
  measurements: M[];
}

export const measurementYOffsetDegree = -0.5;
export const measurementXDistanceDegree = 0.5;

export function* toGeoJsonMeasurementFeatures<
  M extends DeepReadonly<MultiMeasurement>,
  S extends DeepReadonly<Station>
>(
  stationsWithMeasurements: Iterable<DeepReadonly<StationWithMeasurements<M, S>>>
): Generator<GeoJsonMeasurementFeature<M, S>> {
  for (const d of stationsWithMeasurements) {
    const xFullOffset =
      (-measurementXDistanceDegree *
        (d.measurements.length % 2 === 0 ? d.measurements.length : d.measurements.length - 1)) /
      2;
    for (
      let i = 0, xOffset = xFullOffset, m = d.measurements[i];
      i < d.measurements.length;
      i += 1, m = d.measurements[i], xOffset += measurementXDistanceDegree
    ) {
      yield toGeoJsonMeasurementFeature<M, S>(m as M, () => d.station as S, {
        x: xOffset,
        y: measurementYOffsetDegree,
      });
    }
  }
}

export type GeoJsonMeasurementFeature<
  M extends DeepReadonly<MultiMeasurement> = MultiMeasurement,
  S extends DeepReadonly<Station> = Station
> = Feature<GeoJsonPoint, GeoJsonFeatureProperties<M, S>>;

export interface GeoJsonFeatureProperties<M extends DeepReadonly<MultiMeasurement>, S extends DeepReadonly<Station>> {
  station: S;
  measurement: M;
}

export interface GeoJsonStationProperties<S extends DeepReadonly<Station> = Station> {
  station: S;
}

export function toGeoJsonMeasurementFeature<M extends DeepReadonly<MultiMeasurement>, S extends DeepReadonly<Station>>(
  measurement: M,
  getStation: (station: string) => S,
  coordinateOffset: DeepReadonly<Point>
): GeoJsonMeasurementFeature<M, S> {
  const station = getStation(measurement.station);
  return {
    type: 'Feature',
    id: getMeasurementId(measurement),
    geometry: {
      type: 'Point',
      coordinates: [station.longitude + coordinateOffset.x, station.latitude + coordinateOffset.y, station.elevation],
    },
    properties: {
      measurement,
      station,
    },
  };
}

export type GeoJsonStationFeature<P extends DeepReadonly<GeoJsonStationProperties> = GeoJsonStationProperties> =
  Feature<GeoJsonPoint, P>;

export function toGeoJsonStationFeature<S extends DeepReadonly<Station>>(
  station: S
): GeoJsonStationFeature<GeoJsonStationProperties<S>> {
  return {
    type: 'Feature',
    id: station.station,
    geometry: {
      type: 'Point',
      coordinates: [station.longitude, station.latitude, station.elevation],
    },
    properties: {
      station,
    },
  };
}
