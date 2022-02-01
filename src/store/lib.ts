import { Action, AnyAction, AsyncThunkAction, miniSerializeError, Store } from '@reduxjs/toolkit';
import { deserializeError } from 'serialize-error';
import { storeLocalStorageKey } from '../lib/data';
import { DeepReadonly } from '../lib/types';
import { Country } from '../models/country';
import { GeoJsonMeasurementFeature, GeoJsonStationFeature } from '../models/geo-json';
import { Measurement, MeasurementDate } from '../models/measurement';
import { Station } from '../models/station';
import { getInitialState } from './actions/init';

export enum ActionType {
  SetTimelinePosition = 'setTimelinePosition',
  SetTimelinePlaying = 'setTimelinePlaying',
}

export interface GeoState {
  measurementsByDate: Record<MeasurementDate, GeoJsonMeasurementFeature[]>;
  datesWithMeasurements: MeasurementDate[];
  stations: GeoJsonStationFeature[];
}

export interface ComparisonSelection {
  id: number;
  dates: MeasurementDate[];
}
export interface RootState {
  raw: {
    countries: Country[];
    stations: Station[];
    measurements: Measurement[];
  };
  measurementLimits: {
    min: MeasurementDate;
    max: MeasurementDate;
  };
  mapped: {
    countries: Record<Country['code'], Country['name']>;
    stations: Record<Station['station'], Station>;
  };
  geo: GeoState;
  geoTimeline: {
    isPlaying: boolean;
    stepIntervalMs: number;
    currentPosition: MeasurementDate;
  };
  comparison: {
    selections: ComparisonSelection[];
    lastSelectionId: number;
  };
}

export type DeepReadonlyRootState = DeepReadonly<RootState>;

export function selectMappedCountries(state: DeepReadonlyRootState) {
  return state.mapped.countries;
}

export function selectGeoData(state: DeepReadonlyRootState) {
  return state.geo;
}

export function selectGeoDatesWithMeasurements(state: DeepReadonlyRootState) {
  return selectGeoData(state).datesWithMeasurements;
}

export function selectGeoTimelineIsPlaying(state: DeepReadonlyRootState) {
  return state.geoTimeline.isPlaying;
}

export function areGeoDataShallowEqual(oldData: DeepReadonly<GeoState>, newData: DeepReadonly<GeoState>) {
  return oldData.stations === newData.stations && oldData.measurementsByDate === newData.measurementsByDate;
}

export function selectGeoTimelinePosition(state: DeepReadonlyRootState) {
  return state.geoTimeline.currentPosition;
}

export function selectMeasurementsLimits(state: DeepReadonlyRootState) {
  return state.measurementLimits;
}

export function loadState() {
  // return loadSavedState() ?? getInitialState();
  return getInitialState();
}

export function loadSavedState() {
  try {
    return JSON.parse(localStorage.getItem(storeLocalStorageKey) ?? 'null');
  } catch {
    return null;
  }
}

(window as Record<string, any>).appLoadSavedState = loadSavedState;

export function hasSavedState() {
  return !!localStorage.getItem(storeLocalStorageKey);
}

export function saveState(state: DeepReadonlyRootState) {
  localStorage.setItem(storeLocalStorageKey, JSON.stringify(state));
}

export function deleteSavedState() {
  localStorage.removeItem(storeLocalStorageKey);
}

(window as Record<string, any>).appDeleteSavedState = deleteSavedState;

export function dispatchWithError<Returned>(
  store: Store<DeepReadonlyRootState>,
  action: AsyncThunkAction<Returned, any, Record<string, any>>
): Promise<Returned> {
  return store.dispatch(action as any).then((action: AnyAction) => {
    const error =
      action.meta && 'rejectedWithValue' in action.meta && action.meta.rejectedWithValue
        ? action.payload
        : 'error' in action
        ? action.error
        : null;
    if (error) {
      throw deserializeError(error);
    }
    return action.payload as Returned;
  });
}

export const serializeStoreError = miniSerializeError;

export interface ActionWithPayload<T> extends Action<string> {
  payload: T;
}
