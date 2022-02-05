import { Action, AnyAction, AsyncThunkAction, miniSerializeError, Store } from '@reduxjs/toolkit';
import { deserializeError } from 'serialize-error';
import { storeLocalStorageKey } from '../lib/data';
import { DeepReadonly } from '../lib/types';
import { Country } from '../models/country';
import { GeoJsonMeasurementFeature, GeoJsonStationFeature } from '../models/geo-json';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Measurement, MeasurementDate, MultiMeasurement } from '../models/measurement';
import { Station } from '../models/station';
import { getInitialState } from './actions/init';

export enum ActionType {
  SetTimelinePosition = 'setTimelinePosition',
  SetTimelinePlaying = 'setTimelinePlaying',
  AddComparisonSelection = 'comparisonSelection.add',
  RemoveComparisonSelection = 'comparisonSelection.remove',
  UpdateComparisonSelection = 'comparisonSelection.update',
  ApplyComparisonSelection = 'comparisonSelection.apply',
  RestoreComparisonSelection = 'comparisonSelection.restore',
}

export interface GeoState {
  measurementsByDate: Record<MeasurementDate, GeoJsonMeasurementFeature[]>;
  nonEmptyMeasurementDates: MeasurementDate[];
  stations: GeoJsonStationFeature[];
}

export interface ComparisonSelections {
  map: Record<number, MeasurementDate[]>;
  /**
   * Selection IDs ordered.
   */
  order: number[];
}
export type ComparisonMeasurements = Record<Station['station'], Record<number, MultiMeasurement>>;

export interface RootState {
  // raw: {
  //   countries: Country[];
  //   stations: Station[];
  //   measurements: Measurement[];
  // };
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
    selections: ComparisonSelections;
    draftSelectionsDelta: ComparisonSelections;
    lastSelectionId: number;
    measurements: ComparisonMeasurements;
  };
}

export type DeepReadonlyRootState = DeepReadonly<RootState>;

export function selectMappedCountries(state: DeepReadonlyRootState) {
  return state.mapped.countries;
}

export function selectMappedStations(state: DeepReadonlyRootState) {
  return state.mapped.stations;
}

export function selectGeoData(state: DeepReadonlyRootState) {
  return state.geo;
}

export function selectGeoStations(state: DeepReadonlyRootState) {
  return selectGeoData(state).stations;
}

export function selectGeoDatesWithMeasurements(state: DeepReadonlyRootState) {
  return selectGeoData(state).nonEmptyMeasurementDates;
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

export function selectComparisonMeasurements(state: DeepReadonlyRootState) {
  return state.comparison.measurements;
}

export function selectComparisonSelectionOrder(state: DeepReadonlyRootState) {
  return state.comparison.selections.order;
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
