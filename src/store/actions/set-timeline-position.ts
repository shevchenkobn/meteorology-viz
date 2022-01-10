import { createAction } from '@reduxjs/toolkit';
import { MeasurementDate } from '../../models/measurement';
import { ActionType, selectMeasurementsLimits } from '../lib';
import type { AppCaseReducer } from '../reducers';

export interface TimelinePosition {
  timelinePosition: MeasurementDate;
}

export type SetTimelinePosition = ReturnType<typeof setTimelinePosition>;

export const setTimelinePosition = createAction<TimelinePosition, ActionType.SetTimelinePosition>(
  ActionType.SetTimelinePosition
);

export const setTimelinePositionCaseReducer: AppCaseReducer<SetTimelinePosition> = (state, { payload }) => {
  const limits = selectMeasurementsLimits(state);
  if (payload.timelinePosition < limits.min || payload.timelinePosition > limits.max) {
    throw new TypeError(`Measurement date "${payload.timelinePosition}" is not in the timeline!`);
  }
  state.geoTimeline = { ...state.geoTimeline };
  state.geoTimeline.currentPosition = payload.timelinePosition;
  return state;
};
