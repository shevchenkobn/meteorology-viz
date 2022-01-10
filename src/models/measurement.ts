import { DeepReadonly } from '../lib/types';

export interface Measurement {
  station: string;
  year: number;
  month: number;
  temperature: number;
  observations: number;
}

export function getMeasurementId(measurement: DeepReadonly<Measurement>) {
  return `${measurement.station}_${getDate(measurement)}`;
}

/**
 * Measurement date in ISO 8601 'yyyy-MM' format (example: 2020-03, 1983-11).
 * It can be compared without casting it to the Date.
 */
export type MeasurementDate = `${number}-${number}`;

export function getDate(measurement: DeepReadonly<Measurement>): MeasurementDate {
  return `${measurement.year}-${measurement.month}`;
}
