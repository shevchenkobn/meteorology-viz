import { createAction } from '@reduxjs/toolkit';
import { iterate } from 'iterare';
import { objectKeys } from '../../lib/object';
import { MeasurementDate } from '../../models/measurement';
import { ActionType } from '../lib';
import { AppCaseReducer } from '../reducers';
import { calculateAverageByStation, setAverageMeasurements } from './lib/comparison';

export interface ComparisonSelectionUpdate {
  comparisonSelectionId: number;
  dates: MeasurementDate[];
}

export type UpdateComparisonSelection = ReturnType<typeof updateComparisonSelection>;

export const updateComparisonSelection = createAction<ComparisonSelectionUpdate, ActionType.UpdateComparisonSelection>(
  ActionType.UpdateComparisonSelection
);

export const updateComparisonSelectionCaseReducer: AppCaseReducer<UpdateComparisonSelection> = (
  state,
  { payload: { comparisonSelectionId, dates } }
) => {
  state.comparison.selections = { ...state.comparison.selections };
  state.comparison.selections[comparisonSelectionId] = dates.slice();

  const averageByStation = calculateAverageByStation(dates, objectKeys(state.mapped.stations), (date) =>
    iterate(state.geo.measurementsByDate[date]).map((f) => f.properties.measurement)
  );
  setAverageMeasurements(state.comparison.measurements, comparisonSelectionId, dates, averageByStation);
  return state;
};
