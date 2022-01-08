import { parseCsv } from '../lib/data';
import { Country } from '../models/country';
import { Measurement } from '../models/measurement';
import { Station } from '../models/station';
import countriesCsv from './country-codes-europe.csv';
import stationsCsv from './stations-europe.csv';
import measurementsCsv from './temperature-monthly-europe.csv';

export function loadCountries() {
  return parseCsv<Country>(countriesCsv);
}

export function loadStations() {
  return parseCsv<Station>(stationsCsv, {
    parseFieldsAs: {
      int: ['yearFirst', 'yearLast'],
      float: ['latitude', 'longitude', 'elevation'],
    },
  });
}

export function loadMeasurements() {
  return parseCsv<Measurement>(measurementsCsv, {
    parseFieldsAs: {
      int: ['year', 'month', 'observations'],
      float: ['temperature'],
    },
  });
}
