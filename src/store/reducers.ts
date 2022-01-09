import { AnyAction } from '@reduxjs/toolkit';
import { initActionStart } from './actions/init';
import { loadState, RootState } from './lib';

export type AppAction = AnyAction;

// export function buildReducers(builder: ActionReducerMapBuilder<RootState>) {
//
// }

export function storeReducer(state: RootState = loadState(), action: AppAction) {
  switch (action.type) {
    default:
      if (!action.type.toString().startsWith(initActionStart)) {
        console.warn(`Unknown action "${action.type}", action object: `, action);
      }
      return state;
  }
}
