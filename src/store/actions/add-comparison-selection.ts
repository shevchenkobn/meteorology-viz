import { createAction } from '@reduxjs/toolkit';
import { iterate } from 'iterare';
import { objectKeys } from '../../lib/object';
import { MeasurementDate } from '../../models/measurement';
import { ActionType } from '../lib';
import { AppCaseReducer } from '../reducers';
import { calculateAverageByStation, getNextId } from './lib/comparison';

export interface NewComparisonSelection {
  dates: MeasurementDate[];
}

export type AddComparisonSelection = ReturnType<typeof addComparisonSelection>;

export const addComparisonSelection = createAction<NewComparisonSelection, ActionType.AddComparisonSelection>(
  ActionType.AddComparisonSelection
);

export const addComparisonSelectionCaseReducer: AppCaseReducer<AddComparisonSelection> = (
  state,
  { payload: { dates } }
) => {
  const nextId = getNextId(state.comparison.lastSelectionId, (id) => !!state.comparison.selections[id]);
  state.comparison.selections = { ...state.comparison.selections };
  state.comparison.selections[nextId] = dates.slice();
  state.comparison = { ...state.comparison };
  state.comparison.lastSelectionId = nextId;

  const averageByStation = calculateAverageByStation(dates, objectKeys(state.mapped.stations), (date) =>
    iterate(state.geo.measurementsByDate[date]).map((f) => f.properties.measurement)
  );
  for (const [station, average] of averageByStation) {
    state.comparison.measurements[station] = { ...state.comparison.measurements[station] };
    state.comparison.measurements[station][nextId] = {
      station,
      dates: dates.slice(),
      temperature: average.count > 0 ? average.value : Number.NaN,
      observations: average.observations,
    };
  }
  return state;
};
