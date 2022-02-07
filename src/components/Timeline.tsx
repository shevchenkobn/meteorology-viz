import { Autocomplete, IconButton, Mark, Slider, TextField } from '@mui/material';
import Grid from '@mui/material/Grid';
import './Timeline.scss';
import { iterate } from 'iterare';
import { debounce } from 'lodash-es';
import React, { useMemo } from 'react';
import { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { GuardedMap } from '../lib/map';
import { Optional } from '../lib/types';
import { getDate, isMeasurementDate, MeasurementDate, parseMeasurementDate } from '../models/measurement';
import { useAppDispatch } from '../store';
import { geoTimelineStepIntervalMs } from '../store/actions/init';
import { setTimelinePlaying } from '../store/actions/set-timeline-playing';
import { selectGeoDatesWithMeasurements, selectGeoTimelineIsPlaying, selectMeasurementsLimits } from '../store/lib';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

export interface TimelineProps {
  readonly date: MeasurementDate;
  onDateChange(newValue: MeasurementDate): void;
}

export function Timeline({ date, onDateChange }: TimelineProps) {
  const isPlaying = useSelector(selectGeoTimelineIsPlaying);
  const dispatch = useAppDispatch();
  const handleDateChange: typeof onDateChange = useMemo(
    () => (value) => {
      if (isPlaying) {
        dispatch(setTimelinePlaying({ isPlaying: false }));
      }
      onDateChange(value);
    },
    [isPlaying, onDateChange, dispatch]
  );
  const handleSliderChange: React.ComponentProps<typeof Slider>['onChange'] = useMemo(
    () =>
      debounce((event: Event, newValue: number | number[]) => {
        if (typeof newValue === 'number') {
          handleDateChange(numberToMeasurementDate(newValue));
        } else {
          console.warn('Unknown timeline slider value:', newValue);
        }
      }, 10),
    [handleDateChange]
  );
  const handleInputChange: React.ComponentProps<typeof Autocomplete>['onChange'] = useCallback(
    (event, newValue) => {
      if (isMeasurementDate(newValue)) {
        handleDateChange(newValue);
      } else {
        console.warn('Unknown timeline input value:', newValue);
      }
    },
    [handleDateChange]
  );
  const { min, max } = useSelector(selectMeasurementsLimits);
  const timelineDates = useSelector(selectGeoDatesWithMeasurements);
  const validSliderMarks: Mark[] = useMemo(
    () => timelineDates.map((v) => ({ value: measurementDateToNumber(v), label: null })),
    [timelineDates]
  );
  const dateIndexes: GuardedMap<MeasurementDate, number> = useMemo(
    () => new GuardedMap<MeasurementDate, number>(iterate(timelineDates.entries()).map(([i, v]) => [v, i])),
    [timelineDates]
  );

  const step = useCallback(
    (date: MeasurementDate, offset: number) =>
      timelineDates[dateIndexes.get(date) + offset] as Optional<MeasurementDate>,
    [timelineDates, dateIndexes]
  );
  useEffect(() => {
    if (isPlaying) {
      const timeout = setTimeout(() => {
        const nextDate = step(date, 1);
        if (typeof nextDate !== 'string') {
          dispatch(setTimelinePlaying({ isPlaying: false }));
          return;
        }
        onDateChange(nextDate);
      }, geoTimelineStepIntervalMs);
      return () => clearTimeout(timeout);
    }
  }, [date, dispatch, isPlaying, onDateChange, step]);
  const handlePlay = useCallback(() => {
    dispatch(setTimelinePlaying({ isPlaying: !isPlaying }));
  }, [dispatch, isPlaying]);

  const handleStep = useCallback(
    (offset: number) => {
      if (isPlaying) {
        dispatch(setTimelinePlaying({ isPlaying: false }));
      }
      const nextDate = step(date, offset);
      if (typeof nextDate !== 'string') {
        return;
      }
      onDateChange(nextDate);
    },
    [isPlaying, onDateChange, step, date, dispatch]
  );

  return (
    <Grid container spacing={2} alignItems="center" className="Timeline">
      <Grid item>
        <IconButton onClick={() => handleStep(-1)} disabled={dateIndexes.get(date) === 0}>
          <NavigateBeforeIcon />
        </IconButton>
        <IconButton onClick={handlePlay}>{isPlaying ? <PauseIcon /> : <PlayArrowIcon />}</IconButton>
        <IconButton onClick={() => handleStep(1)} disabled={dateIndexes.get(date) === timelineDates.length - 1}>
          <NavigateNextIcon />
        </IconButton>
      </Grid>
      <Grid item xs>
        <Slider
          value={measurementDateToNumber(date)}
          onChange={handleSliderChange}
          aria-labelledby="timeline-slider"
          min={measurementDateToNumber(min)}
          max={measurementDateToNumber(max)}
          step={null}
          marks={validSliderMarks}
          getAriaValueText={numberToMeasurementDate}
          valueLabelFormat={numberToMeasurementDate}
          valueLabelDisplay="auto"
        />
      </Grid>
      <Grid item className="input">
        <Autocomplete
          size="small"
          renderInput={(params) => <TextField {...params} size="small" variant="standard" />}
          disableClearable
          options={timelineDates}
          value={date}
          onChange={handleInputChange}
        />
      </Grid>
    </Grid>
  );
}

function measurementDateToNumber(date: MeasurementDate) {
  const { year, month } = parseMeasurementDate(date);
  return year * 12 + month - 1;
}

function numberToMeasurementDate(value: number) {
  const monthIndex = value % 12;
  return getDate({ year: (value - monthIndex) / 12, month: monthIndex + 1 });
}
