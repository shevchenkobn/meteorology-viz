import { ActionType } from '../lib';
import { AppCaseReducer } from '../reducers';
import { setTimelinePlayingCaseReducer } from './set-timeline-playing';
import { setTimelinePositionCaseReducer } from './set-timeline-position';

export const actions: Record<ActionType, AppCaseReducer<any>> = {
  [ActionType.SetTimelinePosition]: setTimelinePositionCaseReducer,
  [ActionType.SetTimelinePlaying]: setTimelinePlayingCaseReducer,
};
