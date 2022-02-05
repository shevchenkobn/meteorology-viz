import { DeepReadonlyArray } from '../lib/types';
import { MeasurementDate } from '../models/measurement';

export interface ComparisonSelectionProps {
  onUpdate(dates: DeepReadonlyArray<MeasurementDate>): void;
}

export function ComparisonSelection(props: ComparisonSelectionProps) {
  return <p>selection</p>;
}
