import { Input, Slider } from '@mui/material';
import Grid from '@mui/material/Grid';
import './Timeline.scss';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useState } from 'react';
import { distinctUntilChanged, map } from 'rxjs';
import { asEffectReset } from '../lib/rx';
import { getDate, MeasurementDate, parseMeasurementDate } from '../models/measurement';
import { useRxAppStore } from '../store';
import { selectMeasurementsLimits } from '../store/lib';

export interface TimelineProps {
  date: MeasurementDate;
  onDateChange(newValue: MeasurementDate): void;
}

export function Timeline({ date, onDateChange }: TimelineProps) {
  // Add field from here: https://mui.com/components/slider/#slider-with-input-field
  const handleSliderChange = useCallback(
    (event: Event, newValue: number | number[]) => {
      if (typeof newValue === 'number') {
        onDateChange(numberToMeasurementDate(newValue));
      }
    },
    [onDateChange]
  );
  const { state$, store } = useRxAppStore();
  const [{ min, max }, setLimits] = useState(selectMeasurementsLimits(store.getState()));
  useEffect(
    () => asEffectReset(state$.pipe(map(selectMeasurementsLimits), distinctUntilChanged()).subscribe(setLimits)),
    [state$]
  );

  return (
    <Grid container spacing={2} alignItems="center" className="Timeline">
      <Grid item xs>
        <Slider
          value={measurementDateToNumber(date)}
          onChange={handleSliderChange}
          aria-labelledby="timeline-slicer"
          min={measurementDateToNumber(min)}
          max={measurementDateToNumber(max)}
          step={1}
          getAriaValueText={numberToMeasurementDate}
          valueLabelFormat={numberToMeasurementDate}
        />
      </Grid>
      <Grid item>
        <Typography>{date}</Typography>
        {/*<Input*/}
        {/*  value={value}*/}
        {/*  size="small"*/}
        {/*  onChange={handleInputChange}*/}
        {/*  onBlur={handleBlur}*/}
        {/*  inputProps={{*/}
        {/*    step: 10,*/}
        {/*    min: 0,*/}
        {/*    max: 100,*/}
        {/*    type: 'number',*/}
        {/*    'aria-labelledby': 'input-slider',*/}
        {/*  }}*/}
        {/*/>*/}
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
