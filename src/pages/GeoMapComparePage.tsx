import { iterate } from 'iterare';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ComparisonSelectionsInput } from '../components/ComparisonSelectionsInput';
import { GrowingGeoMap } from '../components/GeoMap';
import { fromEntries, objectEntries } from '../lib/object';
import { DeepReadonly } from '../lib/types';
import { GeoJsonMeasurementFeatures, toGeoJsonMeasurementFeatures } from '../models/geo-json';
import { cloneDeepMultiMeasurement, MultiMeasurement } from '../models/measurement';
import { Station } from '../models/station';
import { useAppDispatch } from '../store';
import { addComparisonSelection } from '../store/actions/add-comparison-selection';
import { applyComparisonSelection } from '../store/actions/apply-comparison-selection';
import { editComparisonSelection } from '../store/actions/edit-comparison-selection';
import { removeComparisonSelection } from '../store/actions/remove-comparison-selection';
import { restoreComparisonSelection } from '../store/actions/restore-comparison-selection';
import { updateComparisonSelection } from '../store/actions/update-comparison-selection';
import {
  selectComparisonMeasurements,
  selectComparisonSelection,
  selectGeoStations,
  selectMappedStations,
  ComparisonSelections,
  selectComparisonDraftSelectionDelta,
  selectComparisonIsEditing,
} from '../store/lib';
import './GeoMapComparePage.scss';

interface MeasurementWithDatesId extends MultiMeasurement {
  datesId: string;
}
export function GeoMapComparePage() {
  const dispatch = useAppDispatch();

  const stationMap = useSelector(selectMappedStations);
  const stations = useSelector(selectGeoStations);
  const comparisonMeasurements = useSelector(selectComparisonMeasurements);

  const isEditing = useSelector(selectComparisonIsEditing);
  const comparisonSelection = useSelector(selectComparisonSelection);
  const draftComparisonSelection = useSelector(selectComparisonDraftSelectionDelta);
  const editedComparisonOrder =
    draftComparisonSelection.order.length === 0 ? draftComparisonSelection.order : comparisonSelection.order;
  const editedComparisonSelection = useMemo(
    () =>
      ({
        order: editedComparisonOrder,
        map: fromEntries(
          iterate(editedComparisonOrder).map((id) => [
            id,
            draftComparisonSelection.map[id] ?? comparisonSelection.map[id],
          ])
        ),
      } as ComparisonSelections),
    [comparisonSelection.map, draftComparisonSelection.map, editedComparisonOrder]
  );

  const features = useMemo(
    () =>
      iterate(objectEntries(comparisonMeasurements))
        .map(([station, measurementMap]) =>
          toGeoJsonMeasurementFeatures(
            [
              {
                station: stationMap[station],
                measurements: comparisonSelection.order.map((id) => {
                  const measurement = cloneDeepMultiMeasurement(measurementMap[id]) as MeasurementWithDatesId;
                  measurement.datesId = '_' + id.toString();
                  return measurement;
                }),
              },
            ],
            (m) => m.datesId
          )
        )
        .flatten()
        .reduce(
          (o, { feature, connection }) => {
            o.measurements.push(feature);
            o.connections.push(connection);
            return o;
          },
          { measurements: [], connections: [] } as GeoJsonMeasurementFeatures<
            DeepReadonly<MultiMeasurement>,
            DeepReadonly<Station>
          >
        ),
    [comparisonMeasurements, comparisonSelection.order, stationMap]
  );

  return (
    <div className="grow-size GeoMapComparePage">
      <div className="map-container">
        <GrowingGeoMap
          stations={stations}
          measurements={features.measurements}
          connections={features.connections}
          produceResizeEvent={true}
        />
      </div>
      <div>
        <ComparisonSelectionsInput
          comparisonSelections={editedComparisonSelection}
          isEditing={isEditing}
          onEditStart={() => dispatch(editComparisonSelection())}
          onComparisonSelectionAdd={(dates) => dispatch(addComparisonSelection({ dates }))}
          onComparisonSelectionUpdate={(id, dates) =>
            dispatch(updateComparisonSelection({ comparisonSelectionId: id, dates }))
          }
          onComparisonSelectionRemove={(id) => dispatch(removeComparisonSelection({ comparisonSelectionId: id }))}
          onEditCancel={() => dispatch(restoreComparisonSelection())}
          onEditSubmit={() => dispatch(applyComparisonSelection())}
        />
      </div>
    </div>
  );
}
