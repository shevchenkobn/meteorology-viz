import { Paper } from '@mui/material';
import { DeepReadonlyArray } from '../lib/types';
import { MeasurementDate } from '../models/measurement';
import { ComparisonSelections } from '../store/lib';
import './ComparisonSelectionsInput.scss';

export interface ComparisonSelectionsProps {
  comparisonSelections: ComparisonSelections;
  isEditing: boolean;
  onEditStart(): void;
  onComparisonSelectionAdd(dates: DeepReadonlyArray<MeasurementDate>): void;
  onComparisonSelectionUpdate(comparisonSelectionId: number, dates: DeepReadonlyArray<MeasurementDate>): void;
  onComparisonSelectionRemove(comparisonSelectionId: number): void;
  onEditCancel(): void;
  onEditSubmit(): void;
}

export function ComparisonSelectionsInput(props: ComparisonSelectionsProps) {
  return (
    <Paper className="ComparisonSelectionsInput" elevation={1}>
      filters
    </Paper>
  );
}
