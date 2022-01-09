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

export function getDate(measurement: DeepReadonly<Measurement>) {
  return `${measurement.year}-${measurement.month}`;
}
