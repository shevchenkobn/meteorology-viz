import { Action, AnyAction, AsyncThunkAction, miniSerializeError, Store } from '@reduxjs/toolkit';
import { iterate } from 'iterare';
import { deserializeError } from 'serialize-error';
import { loadCountries, loadMeasurements, loadStations } from '../data';
import { storeLocalStorageKey } from '../lib/data';
import { fromEntries } from '../lib/object';
import { DeepReadonly, Nullable, t } from '../lib/types';
import { Country } from '../models/country';
import { Measurement } from '../models/measurement';
import { Station } from '../models/station';

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
  maps: {
    countries: Record<Country['code'], Country['name']>;
    stations: Record<Station['station'], Station>;
  };
}

export type DeepReadonlyReadState = DeepReadonly<RootState>;

export function getInitialState(): RootState {
  const countries = loadCountries();
  const stations = loadStations();
  const measurements = loadMeasurements();
  return {
    raw: {
      countries: countries.data,
      stations: stations.data,
      measurements: measurements.data,
    },
    maps: {
      countries: fromEntries(iterate(countries.data).map((c) => t(c.code, c.name))),
      stations: fromEntries(iterate(stations.data).map((s) => t(s.station, s))),
    },
  };
}

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
