import { iterate, zip } from 'iterare';
import { loadCountries, loadMeasurements, loadStations } from '../../data';
import { fromEntries } from '../../lib/object';
import { asNotMaybe, t } from '../../lib/types';
import {
  GeoJsonMeasurementFeature,
  toGeoJsonMeasurementFeatures,
  toGeoJsonStationFeature,
} from '../../models/geojson';
import { getDate, Measurement } from '../../models/measurement';
import { Station } from '../../models/station';
import { RootState } from '../lib';

export const initActionStart = '@@redux/INIT';

export function getInitialState(): RootState {
  const countries = loadCountries();
  const stations = loadStations();
  const measurements = loadMeasurements();

  const stationMap = fromEntries(iterate(stations.data).map((s) => t(s.station, s)));

  const timeline: RootState['geo']['timeline'] = {};
  for (const feature of toGeoJsonMeasurementFeatures(
    iterate(measurements.data)
      .map((m) => ({
        station: asNotMaybe(stationMap[m.station]),
        measurements: [m],
      }))
      .flatten()
  )) {
    const m = feature.properties.measurement;
    const date = getDate(m);
    let measurements: GeoJsonMeasurementFeature<Measurement, Station>[];
    if (!(date in timeline)) {
      measurements = [];
      timeline[date] = measurements;
    } else {
      measurements = timeline[date];
    }
    measurements.push(feature);
  }

  return {
    raw: {
      countries: countries.data,
      stations: stations.data,
      measurements: measurements.data,
    },
    mapped: {
      countries: fromEntries(iterate(countries.data).map((c) => t(c.code, c.name))),
      stations: stationMap,
    },
    geo: {
      timeline,
      stations: stations.data.map((s) => toGeoJsonStationFeature(s)),
    },
  };
}
