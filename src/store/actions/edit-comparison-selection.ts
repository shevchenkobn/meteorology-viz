import { createAction } from '@reduxjs/toolkit';
import { ActionType, RootState } from '../lib';
import { AppCaseReducer } from '../reducers';

export type EditComparisonSelection = ReturnType<typeof editComparisonSelection>;

export const editComparisonSelection = createAction<void, ActionType.EditComparisonSelection>(
  ActionType.EditComparisonSelection
);

export const editComparisonSelectionCaseReducer: AppCaseReducer<EditComparisonSelection> = (state: RootState) => {
  state.comparison = { ...state.comparison };
  state.comparison.isEditing = true;

  return { ...state };
};
