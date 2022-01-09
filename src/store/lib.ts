import {
  Action,
  AnyAction,
  AsyncThunkAction,
  miniSerializeError,
  Store,
} from '@reduxjs/toolkit';
import { deserializeError } from 'serialize-error';
import { storeLocalStorageKey } from '../lib/data';
import { DeepReadonly, Nullable } from '../lib/types';
import { Country } from '../models/country';
import {
  GeoJsonMeasurementFeature,
  GeoJsonStationFeature,
} from '../models/geojson';
import { Measurement } from '../models/measurement';
import { Station } from '../models/station';
import { getInitialState } from './actions/init';

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

export enum ActionType {
  LoadRaw = 'loadRaw',
  SetTreeRoot = 'setRoot',
  SelectIds = 'selectIds',
  SetYearRange = 'setYearRange',
  HoverNode = 'hover',
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
  geo: {
    /**
     * Map of ISO 8601 'yyyy-MM' format (example: 2020-03, 1983-11) to measurement.
     */
    timeline: Record<string, GeoJsonMeasurementFeature<Measurement, Station>[]>;
    stations: GeoJsonStationFeature<Station>[];
  };
}

export type DeepReadonlyReadState = DeepReadonly<RootState>;

// export function selectHoveredNodeParentIds(state: RootState) {
//   return state.data.hoveredNodeParentIds;
// }
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
