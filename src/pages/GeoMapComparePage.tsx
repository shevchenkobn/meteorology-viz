import { iterate } from 'iterare';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { GrowingGeoMap } from '../components/GeoMap';
import './GeoMapComparePage.scss';
import { objectEntries } from '../lib/object';
import { toGeoJsonMeasurementFeatures } from '../models/geo-json';
import {
  selectComparisonMeasurements,
  selectComparisonSelectionOrder,
  selectGeoStations,
  selectMappedStations,
} from '../store/lib';

export function GeoMapComparePage() {
  const stationMap = useSelector(selectMappedStations);
  const stations = useSelector(selectGeoStations);
  const comparisonMeasurements = useSelector(selectComparisonMeasurements);
  const comparisonOrder = useSelector(selectComparisonSelectionOrder);
  const measurements = useMemo(
    () =>
      Array.from(
        iterate(objectEntries(comparisonMeasurements))
          .map(([station, measurementMap]) =>
            toGeoJsonMeasurementFeatures([
              {
                station: stationMap[station],
                measurements: comparisonOrder.map((id) => measurementMap[id]),
              },
            ])
          )
          .flatten()
      ),
    [comparisonMeasurements, comparisonOrder, stationMap]
  );

  return (
    <div className="grow-size GeoMapComparePage">
      <div className="map-container">
        <GrowingGeoMap stations={stations} measurements={measurements} />
      </div>
      <div>filters</div>
    </div>
  );
}
