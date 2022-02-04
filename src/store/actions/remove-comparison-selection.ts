import { createAction } from '@reduxjs/toolkit';
import { objectKeys } from '../../lib/object';
import { ActionType } from '../lib';
import { AppCaseReducer } from '../reducers';

export interface ComparisonSelection {
  comparisonSelectionId: number;
}

export type RemoveComparisonSelection = ReturnType<typeof removeComparisonSelection>;

export const removeComparisonSelection = createAction<ComparisonSelection, ActionType.RemoveComparisonSelection>(
  ActionType.RemoveComparisonSelection
);

export const removeComparisonSelectionCaseReducer: AppCaseReducer<RemoveComparisonSelection> = (
  state,
  { payload: { comparisonSelectionId } }
) => {
  state.comparison.selections = { ...state.comparison.selections };
  delete state.comparison.selections[comparisonSelectionId];

  for (const station of objectKeys(state.mapped.stations)) {
    state.comparison.measurements[station] = { ...state.comparison.measurements[station] };
    delete state.comparison.measurements[station][comparisonSelectionId];
  }
  return state;
};
