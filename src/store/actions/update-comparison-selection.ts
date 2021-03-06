import { createAction } from '@reduxjs/toolkit';
import { MeasurementDate } from '../../models/measurement';
import { ActionType } from '../lib';
import { AppCaseReducer } from '../reducers';

export interface ComparisonSelectionUpdate {
  readonly comparisonSelectionId: number;
  readonly dates: ReadonlyArray<MeasurementDate>;
}

export type UpdateComparisonSelection = ReturnType<typeof updateComparisonSelection>;

export const updateComparisonSelection = createAction<ComparisonSelectionUpdate, ActionType.UpdateComparisonSelection>(
  ActionType.UpdateComparisonSelection
);

export const updateComparisonSelectionCaseReducer: AppCaseReducer<UpdateComparisonSelection> = (
  state,
  { payload: { comparisonSelectionId, dates } }
) => {
  state.comparison.draftSelectionsDelta = { ...state.comparison.draftSelectionsDelta };
  state.comparison.draftSelectionsDelta.map = { ...state.comparison.draftSelectionsDelta.map };
  state.comparison.draftSelectionsDelta.map[comparisonSelectionId] = dates.slice();

  return { ...state };
};
