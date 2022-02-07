import { Feature, LineString, Point as GeoJsonPoint } from 'geojson';
import { Point } from '../lib/dom';
import { cast, DeepReadonly } from '../lib/types';
import { getMeasurementId, MultiMeasurement } from './measurement';
import { Station } from './station';

export interface StationWithMeasurements<M extends DeepReadonly<MultiMeasurement>, S extends DeepReadonly<Station>> {
  station: S;
  measurements: M[];
}

export const measurementYOffsetDegree = -0.5;
export const measurementXDistanceDegree = 0.5;

export interface GeoJsonMeasurementFeatures<
  M extends DeepReadonly<MultiMeasurement> = MultiMeasurement,
  S extends DeepReadonly<Station> = Station
> {
  measurements: GeoJsonMeasurementFeature<M, S>[];
  connections: GeoJsonMeasurementConnection<M, S>[];
}

export interface GeoJsonMeasurementFeaturePair<
  M extends DeepReadonly<MultiMeasurement>,
  S extends DeepReadonly<Station>
> {
  feature: GeoJsonMeasurementFeature<M, S>;
  connection: GeoJsonMeasurementConnection<M, S>;
}

export function* toGeoJsonMeasurementFeatures<
  M extends DeepReadonly<MultiMeasurement>,
  S extends DeepReadonly<Station>
>(
  stationsWithMeasurements: Iterable<DeepReadonly<StationWithMeasurements<M, S>>>
): Generator<GeoJsonMeasurementFeaturePair<M, S>> {
  for (const d of stationsWithMeasurements) {
    const xFullOffset =
      (-measurementXDistanceDegree *
        (d.measurements.length % 2 === 0 ? d.measurements.length : d.measurements.length - 1)) /
      2;
    const getStation = () => d.station as S;
    for (
      let i = 0, xOffset = xFullOffset, m = d.measurements[i];
      i < d.measurements.length;
      i += 1, m = d.measurements[i], xOffset += measurementXDistanceDegree
    ) {
      cast<M>(m);
      const offset: Point = {
        x: xOffset,
        y: measurementYOffsetDegree,
      };
      yield {
        feature: toGeoJsonMeasurementFeature(m, getStation, offset),
        connection: toGeoJsonMeasurementConnection(m, getStation, offset),
      };
    }
  }
}

export type GeoJsonMeasurementFeature<
  M extends DeepReadonly<MultiMeasurement> = MultiMeasurement,
  S extends DeepReadonly<Station> = Station
> = Feature<GeoJsonPoint, GeoJsonFeatureProperties<M, S>>;
export type GeoJsonMeasurementConnection<
  M extends DeepReadonly<MultiMeasurement> = MultiMeasurement,
  S extends DeepReadonly<Station> = Station
> = Feature<LineString, GeoJsonFeatureProperties<M, S>>;

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
    id: getGeoJsonMeasurementId(measurement),
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

export function toGeoJsonMeasurementConnection<
  M extends DeepReadonly<MultiMeasurement>,
  S extends DeepReadonly<Station>
>(
  measurement: M,
  getStation: (station: string) => S,
  coordinateOffset: DeepReadonly<Point>
): GeoJsonMeasurementConnection<M, S> {
  const station = getStation(measurement.station);
  return {
    type: 'Feature',
    id: getGeoJsonConnectionId(measurement),
    geometry: {
      type: 'LineString',
      coordinates: [
        [station.longitude, station.latitude, station.elevation],
        [station.longitude + coordinateOffset.x, station.latitude + coordinateOffset.y, station.elevation],
      ],
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
    id: getGeoJsonStationId(station),
    geometry: {
      type: 'Point',
      coordinates: [station.longitude, station.latitude, station.elevation],
    },
    properties: {
      station,
    },
  };
}

export const stationIdPrefix = '_s';
export const measurementIdPrefix = '_m';
export const connectionIdPrefix = '_mc';
export const idPrefixDelimiter = ':';
export function getGeoJsonStationId(station: DeepReadonly<Station>) {
  return stationIdPrefix + idPrefixDelimiter + station.station;
}
export function getGeoJsonConnectionId(measurement: DeepReadonly<MultiMeasurement>) {
  return connectionIdPrefix + idPrefixDelimiter + getMeasurementId(measurement);
}
export function getGeoJsonMeasurementId(measurement: DeepReadonly<MultiMeasurement>) {
  return measurementIdPrefix + idPrefixDelimiter + getMeasurementId(measurement);
}
