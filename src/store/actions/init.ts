import { iterate } from 'iterare';
import { loadCountries, loadMeasurements, loadStations } from '../../data';
import { fromEntries, objectKeys } from '../../lib/object';
import { asNotMaybe } from '../../lib/types';
import {
  GeoJsonMeasurementFeatures,
  toGeoJsonMeasurementFeatures,
  toGeoJsonStationFeature,
} from '../../models/geo-json';
import { MeasurementDate, toMultiMeasurement } from '../../models/measurement';
import { GeoState, RootState } from '../lib';

export const initActionStart = '@@redux/INIT';

export const geoTimelineStepIntervalMs = 350;

export function getInitialState(): RootState {
  const countries = loadCountries();
  const stations = loadStations();
  const measurements = loadMeasurements();

  const stationMap = fromEntries(iterate(stations.data).map((s) => [s.station, s]));
  const countryMap = fromEntries(iterate(countries.data).map((c) => [c.code, c.name]));

  const measurementsByDate: GeoState['measurementsByDate'] = {};
  let minDate: MeasurementDate = '9999-12';
  let maxDate: MeasurementDate = '0000-01';
  for (const { feature, connection } of toGeoJsonMeasurementFeatures(
    iterate(measurements.data)
      .map((m) => ({
        station: asNotMaybe(stationMap[m.station]),
        measurements: [toMultiMeasurement(m)],
      }))
      .flatten()
  )) {
    const m = feature.properties.measurement;
    const date = m.dates[0];
    if (date < minDate) {
      minDate = date;
    }
    if (date > maxDate) {
      maxDate = date;
    }
    let features: GeoJsonMeasurementFeatures;
    if (!(date in measurementsByDate)) {
      features = {
        measurements: [],
        connections: [],
      };
      measurementsByDate[date] = features;
    } else {
      features = measurementsByDate[date];
    }
    features.measurements.push(feature);
    features.connections.push(connection);
  }

  return {
    // raw: {
    //   countries: countries.data,
    //   stations: stations.data,
    //   measurements: measurements.data,
    // },
    measurementLimits: {
      min: minDate,
      max: maxDate,
    },
    mapped: {
      countries: countryMap,
      stations: stationMap,
    },
    geo: {
      measurementsByDate,
      nonEmptyMeasurementDates: (Object.keys(measurementsByDate) as MeasurementDate[]).sort(),
      stations: stations.data.map((s) => toGeoJsonStationFeature(s)),
    },
    geoTimeline: {
      isPlaying: false,
      currentPosition: minDate,
      stepIntervalMs: geoTimelineStepIntervalMs,
    },
    comparison: {
      selections: {
        map: {},
        order: [],
      },
      draftSelectionsDelta: {
        map: {},
        order: [],
      },
      lastSelectionId: 0,
      measurements: fromEntries(iterate(objectKeys(stationMap)).map((s) => [s, {}])),
    },
  };
}
