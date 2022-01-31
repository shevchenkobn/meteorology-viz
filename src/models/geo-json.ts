import { Feature, Point as GeoJsonPoint } from 'geojson';
import { Point } from '../lib/dom';
import { DeepReadonly } from '../lib/types';
import { getMeasurementId, Measurement } from './measurement';
import { Station } from './station';

export interface StationWithMeasurements<M extends DeepReadonly<Measurement>, S extends DeepReadonly<Station>> {
  station: S;
  measurements: M[];
}

export const measurementYOffsetDegree = -0.5;
export const measurementXDistanceDegree = 0.5;

export function* toGeoJsonMeasurementFeatures<M extends DeepReadonly<Measurement>, S extends DeepReadonly<Station>>(
  stationsWithMeasurements: Iterable<DeepReadonly<StationWithMeasurements<M, S>>>,
  countryNameGetter: (countryCode: string) => string
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
      yield toGeoJsonMeasurementFeature<M, S>(m as M, () => d.station as S, countryNameGetter, {
        x: xOffset,
        y: measurementYOffsetDegree,
      });
    }
  }
}

export type GeoJsonMeasurementFeature<
  M extends DeepReadonly<Measurement> = Measurement,
  S extends DeepReadonly<Station> = Station
> = Feature<GeoJsonPoint, GeoJsonFeatureProperties<M, S>>;

export interface GeoJsonFeatureProperties<M extends DeepReadonly<Measurement>, S extends DeepReadonly<Station>> {
  station: S;
  measurement: M;
  countryName: string;
}

export interface GeoJsonStationProperties<S extends DeepReadonly<Station> = Station> {
  station: S;
  countryName: string;
}

export function toGeoJsonMeasurementFeature<M extends DeepReadonly<Measurement>, S extends DeepReadonly<Station>>(
  measurement: M,
  stationGetter: (station: string) => S,
  countryNameGetter: (countryCode: string) => string,
  coordinateOffset: DeepReadonly<Point>
): GeoJsonMeasurementFeature<M, S> {
  const station = stationGetter(measurement.station);
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
      countryName: countryNameGetter(station.countryCode),
    },
  };
}

export type GeoJsonStationFeature<P extends DeepReadonly<GeoJsonStationProperties> = GeoJsonStationProperties> =
  Feature<GeoJsonPoint, P>;

export function toGeoJsonStationFeature<S extends DeepReadonly<Station>>(
  station: S,
  countryNameGetter: (countryCode: string) => string
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
      countryName: countryNameGetter(station.countryCode),
    },
  };
}
