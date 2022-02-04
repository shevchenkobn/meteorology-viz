import { ActionType } from '../lib';
import { AppCaseReducer } from '../reducers';
import { addComparisonSelectionCaseReducer } from './add-comparison-selection';
import { removeComparisonSelectionCaseReducer } from './remove-comparison-selection';
import { setTimelinePlayingCaseReducer } from './set-timeline-playing';
import { setTimelinePositionCaseReducer } from './set-timeline-position';
import { updateComparisonSelectionCaseReducer } from './update-comparison-selection';

export const actions: Record<ActionType, AppCaseReducer<any>> = {
  [ActionType.SetTimelinePosition]: setTimelinePositionCaseReducer,
  [ActionType.SetTimelinePlaying]: setTimelinePlayingCaseReducer,
  [ActionType.AddComparisonSelection]: addComparisonSelectionCaseReducer,
  [ActionType.RemoveComparisonSelection]: removeComparisonSelectionCaseReducer,
  [ActionType.UpdateComparisonSelection]: updateComparisonSelectionCaseReducer,
};
