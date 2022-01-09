import { AnyAction } from '@reduxjs/toolkit';
import { loadState, RootState } from './lib';

export type AppAction = AnyAction;

// export function buildReducers(builder: ActionReducerMapBuilder<RootState>) {
//
// }

export function storeReducer(state: RootState = loadState(), action: AppAction) {
  switch (action.type) {
    default:
      if (!action.type.toString().startsWith('@@redux/INIT')) {
        console.warn(`Unknown action "${action.type}", action object: `, action);
      }
      return state;
  }
}
