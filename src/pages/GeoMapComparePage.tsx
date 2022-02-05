import { iterate } from 'iterare';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { GrowingGeoMap } from '../components/GeoMap';
import { objectEntries } from '../lib/object';
import { DeepReadonly } from '../lib/types';
import { GeoJsonMeasurementFeatures, toGeoJsonMeasurementFeatures } from '../models/geo-json';
import { cloneDeepMultiMeasurement, MultiMeasurement } from '../models/measurement';
import { Station } from '../models/station';
import {
  selectComparisonMeasurements,
  selectComparisonSelectionOrder,
  selectGeoStations,
  selectMappedStations,
} from '../store/lib';
import './GeoMapComparePage.scss';

interface MeasurementWithDatesId extends MultiMeasurement {
  datesId: string;
}
export function GeoMapComparePage() {
  const stationMap = useSelector(selectMappedStations);
  const stations = useSelector(selectGeoStations);
  const comparisonMeasurements = useSelector(selectComparisonMeasurements);
  const comparisonOrder = useSelector(selectComparisonSelectionOrder);
  const features = useMemo(
    () =>
      iterate(objectEntries(comparisonMeasurements))
        .map(([station, measurementMap]) =>
          toGeoJsonMeasurementFeatures(
            [
              {
                station: stationMap[station],
                measurements: comparisonOrder.map((id) => {
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
    [comparisonMeasurements, comparisonOrder, stationMap]
  );

  return (
    <div className="grow-size GeoMapComparePage">
      <div className="map-container">
        <GrowingGeoMap stations={stations} measurements={features.measurements} connections={features.connections} />
      </div>
      <div>filters</div>
    </div>
  );
}
