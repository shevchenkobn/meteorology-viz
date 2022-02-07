import { createAction } from '@reduxjs/toolkit';
import { ActionType } from '../lib';
import { AppCaseReducer } from '../reducers';

export interface ComparisonSelection {
  readonly comparisonSelectionId: number;
}

export type RemoveComparisonSelection = ReturnType<typeof removeComparisonSelection>;

export const removeComparisonSelection = createAction<ComparisonSelection, ActionType.RemoveComparisonSelection>(
  ActionType.RemoveComparisonSelection
);

export const removeComparisonSelectionCaseReducer: AppCaseReducer<RemoveComparisonSelection> = (
  state,
  { payload: { comparisonSelectionId } }
) => {
  state.comparison.draftSelectionsDelta = { ...state.comparison.draftSelectionsDelta };
  state.comparison.draftSelectionsDelta.map = { ...state.comparison.draftSelectionsDelta.map };
  delete state.comparison.draftSelectionsDelta.map[comparisonSelectionId];
  state.comparison.draftSelectionsDelta.order = state.comparison.draftSelectionsDelta.order.filter(
    (id) => id !== comparisonSelectionId
  );
  return { ...state };
};
