import { actions } from './actions';
import { initActionStart } from './actions/init';
import { SetTimelinePlaying, setTimelinePlayingCaseReducer } from './actions/set-timeline-playing';
import { SetTimelinePosition, setTimelinePositionCaseReducer } from './actions/set-timeline-position';
import { ActionType, loadState, RootState } from './lib';

export interface AppActionMap {
  [ActionType.SetTimelinePosition]: SetTimelinePosition;
  [ActionType.SetTimelinePlaying]: SetTimelinePlaying;
}

export type AppAction = AppActionMap[keyof AppActionMap];

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
