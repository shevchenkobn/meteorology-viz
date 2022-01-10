import { createAction } from '@reduxjs/toolkit';
import { MeasurementDate } from '../../models/measurement';
import { ActionType } from '../lib';
import type { AppCaseReducer } from '../reducers';

export interface TimelinePosition {
  timelinePosition: MeasurementDate;
}

export type SetTimelinePosition = ReturnType<typeof setTimelinePosition>;

export const setTimelinePosition = createAction<TimelinePosition>(ActionType.SetTimelinePosition);

export const caseReducer: AppCaseReducer<SetTimelinePosition> = (state, { payload }) => {
  if (!(payload.timelinePosition in state.geo.measurementsByDate)) {
    throw new TypeError(`Measurement date "${payload.timelinePosition}" is not in the timeline!`);
  }
  state.geoTimeline = { ...state.geoTimeline };
  state.geoTimeline.currentPosition = payload.timelinePosition;
  return state;
};
