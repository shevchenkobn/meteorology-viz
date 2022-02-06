import { createAction } from '@reduxjs/toolkit';
import { iterate } from 'iterare';
import { objectEntries, objectKeys } from '../../lib/object';
import { ActionType } from '../lib';
import { AppCaseReducer } from '../reducers';
import { calculateAverageByStation, setAverageMeasurements } from './lib/comparison';
import { doRestoreComparisonSelection } from './restore-comparison-selection';

export type ApplyComparisonSelection = ReturnType<typeof applyComparisonSelection>;

export const applyComparisonSelection = createAction<void, ActionType.ApplyComparisonSelection>(
  ActionType.ApplyComparisonSelection
);

export const applyComparisonSelectionCaseReducer: AppCaseReducer<ApplyComparisonSelection> = (state) => {
  state.comparison.selections.map = { ...state.comparison.selections.map };
  for (const [id, comparisonSelection] of objectEntries(state.comparison.draftSelectionsDelta.map)) {
    state.comparison.selections.map[id] = comparisonSelection;
  }
  const newOrder = new Set(state.comparison.draftSelectionsDelta.order);
  for (const id of state.comparison.selections.order) {
    if (!newOrder.has(id)) {
      delete state.comparison.selections.map[id];
    }
  }
  state.comparison.selections = { ...state.comparison.selections };
  state.comparison.selections.order = state.comparison.draftSelectionsDelta.order;

  for (const [id, dates] of objectEntries(state.comparison.draftSelectionsDelta.map)) {
    const averageByStation = calculateAverageByStation(dates, objectKeys(state.mapped.stations), (date) =>
      iterate(state.geo.measurementsByDate[date].measurements).map((f) => f.properties.measurement)
    );
    setAverageMeasurements(state.comparison.measurements, id, dates, averageByStation);
  }

  doRestoreComparisonSelection(state);
  return { ...state };
};
