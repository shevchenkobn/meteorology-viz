import { actions } from './actions';
import { AddComparisonSelection } from './actions/add-comparison-selection';
import { initActionStart } from './actions/init';
import { RemoveComparisonSelection } from './actions/remove-comparison-selection';
import { SetTimelinePlaying } from './actions/set-timeline-playing';
import { SetTimelinePosition } from './actions/set-timeline-position';
import { UpdateComparisonSelection } from './actions/update-comparison-selection';
import { ActionType, loadState, RootState } from './lib';

export interface AppActionMap {
  [ActionType.SetTimelinePosition]: SetTimelinePosition;
  [ActionType.SetTimelinePlaying]: SetTimelinePlaying;
  [ActionType.AddComparisonSelection]: AddComparisonSelection;
  [ActionType.RemoveComparisonSelection]: RemoveComparisonSelection;
  [ActionType.UpdateComparisonSelection]: UpdateComparisonSelection;
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
