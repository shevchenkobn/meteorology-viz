import { AnyAction } from '@reduxjs/toolkit';
import { loadState, RootState } from './lib';

export type AppAction = AnyAction;

// export function buildReducers(builder: ActionReducerMapBuilder<RootState>) {
//
// }

export function storeReducer(state: RootState = loadState(), action: AppAction) {
  switch (action.type) {
    default:
      console.warn(`Unknown action "${action.type}", action object: `, action);
      return state;
  }
}
