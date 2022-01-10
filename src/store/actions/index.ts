import { ActionType } from '../lib';
import { AppCaseReducer } from '../reducers';
import { setTimelinePositionCaseReducer } from './set-timeline-position';

export const actions: Record<ActionType, AppCaseReducer> = {
  [ActionType.SetTimelinePosition]: setTimelinePositionCaseReducer,
};
