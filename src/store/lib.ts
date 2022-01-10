import { Action, AnyAction, AsyncThunkAction, miniSerializeError, Store } from '@reduxjs/toolkit';
import { deserializeError } from 'serialize-error';
import { storeLocalStorageKey } from '../lib/data';
import { DeepReadonly, Nullable } from '../lib/types';
import { Country } from '../models/country';
import { GeoJsonMeasurementFeature, GeoJsonStationFeature } from '../models/geo-json';
import { Measurement, MeasurementDate } from '../models/measurement';
import { Station } from '../models/station';
import { getInitialState } from './actions/init';

export enum ActionType {
  SetTimelinePosition = 'setTimelinePosition',
}

export interface GeoState {
  measurementsByDate: Record<MeasurementDate, GeoJsonMeasurementFeature[]>;
  stations: GeoJsonStationFeature[];
}
export interface RootState {
  raw: {
    countries: Country[];
    stations: Station[];
    measurements: Measurement[];
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
}

export type DeepReadonlyReadState = DeepReadonly<RootState>;

export function selectGeoData(state: DeepReadonlyReadState) {
  return state.geo;
}

export function areGeoDataShallowEqual(oldData: DeepReadonly<GeoState>, newData: DeepReadonly<GeoState>) {
  return oldData.stations === newData.stations && oldData.measurementsByDate === newData.measurementsByDate;
}

export function selectGeoTimelinePosition(state: DeepReadonlyReadState) {
  return state.geoTimeline.currentPosition;
}

export function loadState() {
  let state: Nullable<RootState> = null;
  try {
    state = JSON.parse(localStorage.getItem(storeLocalStorageKey) ?? 'null');
  } catch {}
  return state ?? getInitialState();
}

export function saveState(state: DeepReadonlyReadState) {
  localStorage.setItem(storeLocalStorageKey, JSON.stringify(state));
}

export function deleteSavedState() {
  localStorage.removeItem(storeLocalStorageKey);
}

(window as Record<string, any>).appDeleteSavedState = deleteSavedState;

export function dispatchWithError<Returned>(
  store: Store<DeepReadonlyReadState>,
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
