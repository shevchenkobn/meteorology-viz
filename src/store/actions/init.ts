import { iterate } from 'iterare';
import { loadCountries, loadMeasurements, loadStations } from '../../data';
import { fromEntries } from '../../lib/object';
import { asNotMaybe, t } from '../../lib/types';
import {
  GeoJsonMeasurementFeature,
  toGeoJsonMeasurementFeatures,
  toGeoJsonStationFeature,
} from '../../models/geo-json';
import { getDate, MeasurementDate } from '../../models/measurement';
import { GeoState, RootState } from '../lib';

export const initActionStart = '@@redux/INIT';

export const geoTimelineStepIntervalMs = 350;

export function getInitialState(): RootState {
  const countries = loadCountries();
  const stations = loadStations();
  const measurements = loadMeasurements();

  const stationMap = fromEntries(iterate(stations.data).map((s) => t(s.station, s)));
  const countryMap = fromEntries(iterate(countries.data).map((c) => t(c.code, c.name)));
  const getCountryName = (code: string) => countryMap[code];

  const measurementsByDate: GeoState['measurementsByDate'] = {};
  let minDate: MeasurementDate = '9999-12';
  let maxDate: MeasurementDate = '0000-01';
  for (const feature of toGeoJsonMeasurementFeatures(
    iterate(measurements.data)
      .map((m) => ({
        station: asNotMaybe(stationMap[m.station]),
        measurements: [m],
      }))
      .flatten(),
    getCountryName
  )) {
    const m = feature.properties.measurement;
    const date = getDate(m);
    if (date < minDate) {
      minDate = date;
    }
    if (date > maxDate) {
      maxDate = date;
    }
    let measurements: GeoJsonMeasurementFeature[];
    if (!(date in measurementsByDate)) {
      measurements = [];
      measurementsByDate[date] = measurements;
    } else {
      measurements = measurementsByDate[date];
    }
    measurements.push(feature);
  }

  return {
    raw: {
      countries: countries.data,
      stations: stations.data,
      measurements: measurements.data,
    },
    measurementLimits: {
      min: minDate,
      max: maxDate,
    },
    mapped: {
      countries: countryMap,
      stations: stationMap,
    },
    geo: {
      measurementsByDate: measurementsByDate,
      datesWithMeasurements: (Object.keys(measurementsByDate) as MeasurementDate[]).sort(),
      stations: stations.data.map((s) => toGeoJsonStationFeature(s, getCountryName)),
    },
    geoTimeline: {
      isPlaying: false,
      currentPosition: minDate,
      stepIntervalMs: geoTimelineStepIntervalMs,
    },
    comparison: {
      selections: [],
      lastSelectionId: 0,
    },
  };
}
