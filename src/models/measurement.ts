import { DeepReadonly } from '../lib/types';

export interface MeasurementDateObject {
  year: number;
  month: number;
}

export interface Measurement extends MeasurementDateObject {
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

const measurementDateRegex = /^\d{4}-[01]\d$/;
export function isMeasurementDate(value: unknown): value is MeasurementDate {
  return typeof value === 'string' && measurementDateRegex.test(value);
}

export function getDate(measurement: DeepReadonly<MeasurementDateObject>): MeasurementDate {
  return `${measurement.year.toString().padStart(4, '0')}-${measurement.month
    .toString()
    .padStart(2, '0')}` as MeasurementDate;
}

export function parseMeasurementDate(date: MeasurementDate): MeasurementDateObject {
  const parts = date.split('-');
  return {
    year: Number(parts[0]),
    month: Number(parts[1]),
  };
}
