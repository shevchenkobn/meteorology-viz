import { Autocomplete, IconButton, TextField } from '@mui/material';
import Chip from '@mui/material/Chip';
import { DeepReadonlyArray } from '../lib/types';
import { MeasurementDate } from '../models/measurement';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import './ComparisonSelection.scss';

export interface ComparisonSelectionProps {
  /**
   * If provided, the edit mode will be enabled.
   */
  readonly datesOptions?: DeepReadonlyArray<MeasurementDate>;
  readonly dates: DeepReadonlyArray<MeasurementDate>;
  onUpdate(dates: DeepReadonlyArray<MeasurementDate>): void;
  onDelete(): void;
  readonly className?: string;
}

export function ComparisonSelection({
  datesOptions,
  dates,
  onUpdate,
  onDelete,
  className = '',
}: ComparisonSelectionProps) {
  return datesOptions ? (
    <div className={'ComparisonSelection flex editable ' + className}>
      <Autocomplete
        multiple
        className="flex-grow"
        disableCloseOnSelect={true}
        size="small"
        renderInput={(params) => (
          <TextField {...params} variant="filled" label="Edit Selection" placeholder="Edit Selection" />
        )}
        value={dates.slice()}
        options={datesOptions}
        onChange={(event, values) => {
          if (values.length !== 0) {
            onUpdate(values);
          } else if (dates.length - values.length > 1) {
            onUpdate(dates.slice(0, 1));
          }
        }}
      />
      <div className="flex flex-items-center">
        <IconButton color="primary" size="large" onClick={() => onDelete()}>
          <DeleteOutlineIcon />
        </IconButton>
      </div>
    </div>
  ) : (
    <div className={'ComparisonSelection flex flex-wrap readonly' + className}>
      {dates.map((date) => (
        <Chip key={date} label={date} color="primary" variant="outlined" />
      ))}
    </div>
  );
}
