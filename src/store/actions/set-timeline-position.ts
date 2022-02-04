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

export const setTimelinePositionCaseReducer: AppCaseReducer<SetTimelinePosition> = (
  state,
  { payload: { timelinePosition } }
) => {
  const limits = selectMeasurementsLimits(state);
  if (timelinePosition < limits.min || timelinePosition > limits.max) {
    throw new TypeError(`Measurement date "${timelinePosition}" is not in the timeline!`);
  }
  state.geoTimeline = { ...state.geoTimeline };
  state.geoTimeline.currentPosition = timelinePosition;
  return state;
};
