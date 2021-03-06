import { createAction } from '@reduxjs/toolkit';
import { MeasurementDate } from '../../models/measurement';
import { ActionType } from '../lib';
import { AppCaseReducer } from '../reducers';
import { getNextId } from './lib/comparison';

export interface NewComparisonSelection {
  readonly dates: ReadonlyArray<MeasurementDate>;
}

export type AddComparisonSelection = ReturnType<typeof addComparisonSelection>;

export const addComparisonSelection = createAction<NewComparisonSelection, ActionType.AddComparisonSelection>(
  ActionType.AddComparisonSelection
);

export const addComparisonSelectionCaseReducer: AppCaseReducer<AddComparisonSelection> = (
  state,
  { payload: { dates } }
) => {
  const nextId = getNextId(
    state.comparison.lastSelectionId,
    (id) => !!state.comparison.selections.map[id] || !!state.comparison.draftSelectionsDelta.map[id]
  );
  state.comparison.draftSelectionsDelta = { ...state.comparison.draftSelectionsDelta };
  state.comparison.draftSelectionsDelta.map = { ...state.comparison.draftSelectionsDelta.map };
  state.comparison.draftSelectionsDelta.map[nextId] = dates.slice();
  state.comparison.draftSelectionsDelta.order = state.comparison.draftSelectionsDelta.order.slice();
  state.comparison.draftSelectionsDelta.order.push(nextId);
  state.comparison = { ...state.comparison };
  state.comparison.lastSelectionId = nextId;
  return { ...state };
};
