import { Autocomplete, IconButton, Paper, TextField } from '@mui/material';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { DeepReadonlyArray } from '../lib/types';
import { MeasurementDate } from '../models/measurement';
import { ComparisonSelections, selectGeoDatesWithMeasurements } from '../store/lib';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import './ComparisonSelectionsInput.scss';
import { ComparisonSelection } from './ComparisonSelection';

export interface ComparisonSelectionsProps {
  readonly comparisonSelections: ComparisonSelections;
  readonly isEditing: boolean;
  onEditStart(): void;
  onComparisonSelectionAdd(dates: DeepReadonlyArray<MeasurementDate>): void;
  onComparisonSelectionUpdate(comparisonSelectionId: number, dates: DeepReadonlyArray<MeasurementDate>): void;
  onComparisonSelectionRemove(comparisonSelectionId: number): void;
  onEditCancel(): void;
  onEditSubmit(): void;
}

export function ComparisonSelectionsInput({
  comparisonSelections,
  isEditing,
  onEditStart,
  onComparisonSelectionAdd,
  onComparisonSelectionUpdate,
  onComparisonSelectionRemove,
  onEditCancel,
  onEditSubmit,
}: ComparisonSelectionsProps) {
  const dates = useSelector(selectGeoDatesWithMeasurements);
  const [newSelectionDates, setNewSelectionDates] = useState([] as MeasurementDate[]);

  const indexWidth = comparisonSelections.order.length.toString().length * 2 + 0.5 + 'rem';

  return (
    <Paper className="ComparisonSelectionsInput" elevation={1}>
      <div className="flex">
        <Typography className="flex-grow" color="text.secondary" gutterBottom>
          Selections for comparison
        </Typography>
        {isEditing ? (
          <>
            <IconButton color="secondary" aria-label="apply" size="small" onClick={() => onEditSubmit()}>
              <CheckCircleIcon fontSize="small" />
            </IconButton>
            <IconButton color="secondary" aria-label="restore" size="small" onClick={() => onEditCancel()}>
              <CancelIcon fontSize="small" />
            </IconButton>
          </>
        ) : (
          <IconButton color="secondary" aria-label="edit" size="small" onClick={() => onEditStart()}>
            <EditIcon fontSize="small" />
          </IconButton>
        )}
      </div>
      <div className="body">
        {comparisonSelections.order.length === 0 ? (
          !isEditing && (
            <Typography variant="h6" gutterBottom>
              No selections.
            </Typography>
          )
        ) : (
          <>
            {comparisonSelections.order.map((id, i) => (
              <div key={id} className="flex flex-items-center">
                <Chip
                  className="selection-index"
                  variant="outlined"
                  label={i + 1 + '.'}
                  style={{ width: indexWidth }}
                />
                <div className="flex-grow">
                  <ComparisonSelection
                    datesOptions={isEditing ? dates : undefined}
                    dates={comparisonSelections.map[id]}
                    onUpdate={(dates) => onComparisonSelectionUpdate(id, dates)}
                    onDelete={() => onComparisonSelectionRemove(id)}
                  />
                </div>
              </div>
            ))}
          </>
        )}
        {isEditing && (
          <div className="flex">
            <Autocomplete
              multiple
              className="flex-grow"
              size="small"
              disableCloseOnSelect={true}
              renderInput={(params) => (
                <TextField
                  {...params}
                  color="secondary"
                  variant="standard"
                  label="New Selection"
                  placeholder="New Selection"
                />
              )}
              value={newSelectionDates}
              options={dates}
              onChange={(event, values) => setNewSelectionDates(values)}
            />
            <IconButton
              color="secondary"
              size="large"
              disabled={newSelectionDates.length === 0}
              onClick={() => {
                onComparisonSelectionAdd(newSelectionDates);
                setNewSelectionDates([]);
              }}
            >
              <AddIcon />
            </IconButton>
          </div>
        )}
      </div>
    </Paper>
  );
}
