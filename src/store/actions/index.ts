import { ActionType } from '../lib';
import { AppCaseReducer } from '../reducers';
import { addComparisonSelectionCaseReducer } from './add-comparison-selection';
import { applyComparisonSelectionCaseReducer } from './apply-comparison-selection';
import { editComparisonSelectionCaseReducer } from './edit-comparison-selection';
import { removeComparisonSelectionCaseReducer } from './remove-comparison-selection';
import { restoreComparisonSelectionCaseReducer } from './restore-comparison-selection';
import { setTimelinePlayingCaseReducer } from './set-timeline-playing';
import { setTimelinePositionCaseReducer } from './set-timeline-position';
import { updateComparisonSelectionCaseReducer } from './update-comparison-selection';

export const actions: Record<ActionType, AppCaseReducer<any>> = {
  [ActionType.SetTimelinePosition]: setTimelinePositionCaseReducer,
  [ActionType.SetTimelinePlaying]: setTimelinePlayingCaseReducer,
  [ActionType.EditComparisonSelection]: editComparisonSelectionCaseReducer,
  [ActionType.AddComparisonSelection]: addComparisonSelectionCaseReducer,
  [ActionType.RemoveComparisonSelection]: removeComparisonSelectionCaseReducer,
  [ActionType.UpdateComparisonSelection]: updateComparisonSelectionCaseReducer,
  [ActionType.ApplyComparisonSelection]: applyComparisonSelectionCaseReducer,
  [ActionType.RestoreComparisonSelection]: restoreComparisonSelectionCaseReducer,
};
