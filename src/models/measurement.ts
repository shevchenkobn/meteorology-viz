import { Feature, Point } from 'geojson';
import type { Station } from './station';

export interface Measurement {
  station: string;
  year: number;
  month: number;
  temperature: number;
  observations: number;
}

export interface GeoJsonFeatureProperties {
  measurement: Measurement;
  station: Station;
}

export function toGeoJsonFeature(
  measurement: Measurement,
  stationGetter: (station: string) => Station
): Feature<Point, GeoJsonFeatureProperties> {
  const station = stationGetter(measurement.station);
  return {
    type: 'Feature',
    id: getMeasurementId(measurement),
    geometry: {
      type: 'Point',
      coordinates: [station.longitude, station.latitude, station.elevation],
    },
    properties: {
      measurement,
      station,
    },
  };
}

export function getMeasurementId(measurement: Measurement) {
  return `${measurement.station}_${measurement.year}-${measurement.month}`;
}
