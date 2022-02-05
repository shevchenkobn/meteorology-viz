import { createAction } from '@reduxjs/toolkit';
import { ActionType, RootState } from '../lib';
import { AppCaseReducer } from '../reducers';

export type RestoreComparisonSelection = ReturnType<typeof restoreComparisonSelection>;

export const restoreComparisonSelection = createAction<void, ActionType.ApplyComparisonSelection>(
  ActionType.ApplyComparisonSelection
);

export function doRestoreComparisonSelection(state: RootState) {
  state.comparison.draftSelectionsDelta = { ...state.comparison.draftSelectionsDelta };
  state.comparison.draftSelectionsDelta.order = [];
  state.comparison.draftSelectionsDelta.map = {};

  return state;
}

export const restoreComparisonSelectionCaseReducer: AppCaseReducer<RestoreComparisonSelection> =
  doRestoreComparisonSelection;
