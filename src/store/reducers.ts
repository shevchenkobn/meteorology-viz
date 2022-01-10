import { actions } from './actions';
import { initActionStart } from './actions/init';
import { SetTimelinePosition } from './actions/set-timeline-position';
import { loadState, RootState } from './lib';

export type AppAction = SetTimelinePosition;

export type AppCaseReducer<A extends AppAction = AppAction> = (state: RootState, action: A) => RootState;

// export function buildReducers(builder: ActionReducerMapBuilder<RootState>) {
//
// }

export function storeReducer(state: RootState = loadState(), action: AppAction) {
  if (action.type in actions) {
    return actions[action.type](state, action);
  }
  if (!action.type.toString().startsWith(initActionStart)) {
    console.warn(`Unknown action "${action.type}", action object: `, action);
  }
  return state;
}
