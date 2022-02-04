import { createAction } from '@reduxjs/toolkit';
import { ActionType } from '../lib';
import { AppCaseReducer } from '../reducers';

export interface TimelinePlaying {
  isPlaying: boolean;
}

export type SetTimelinePlaying = ReturnType<typeof setTimelinePlaying>;

export const setTimelinePlaying = createAction<TimelinePlaying, ActionType.SetTimelinePlaying>(
  ActionType.SetTimelinePlaying
);

export const setTimelinePlayingCaseReducer: AppCaseReducer<SetTimelinePlaying> = (
  state,
  { payload: { isPlaying } }
) => {
  if (state.geoTimeline.isPlaying === isPlaying) {
    return state;
  }
  state.geoTimeline = { ...state.geoTimeline };
  state.geoTimeline.isPlaying = isPlaying;
  return { ...state };
};
