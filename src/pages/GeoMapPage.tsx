import iterate from 'iterare';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { GrowingGeoMap } from '../components/GeoMap';
import { Timeline } from '../components/Timeline';
import { parseMeasurementDate } from '../models/measurement';
import { useAppDispatch } from '../store';
import { setTimelinePosition } from '../store/actions/set-timeline-position';
import { areGeoDataShallowEqual, selectGeoData, selectGeoTimelinePosition, selectMappedCountries } from '../store/lib';
import './GeoMapPage.scss';

export function GeoMapPage() {
  const dispatch = useAppDispatch();
  const { stations, measurementsByDate } = useSelector(selectGeoData, areGeoDataShallowEqual);
  const countries = useSelector(selectMappedCountries);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showAllStations, setShowAllStations] = useState(true);

  const position = useSelector(selectGeoTimelinePosition);

  const features = useMemo(() => measurementsByDate[position] ?? [], [measurementsByDate, position]);
  const filteredStations = useMemo(() => {
    if (showAllStations) {
      return stations;
    }
    const stationIds = iterate(features.measurements)
      .map((d) => d.properties.station.station)
      .toSet();
    return stations.filter((s) => stationIds.has(s.properties.station.station));
  }, [showAllStations, stations, features]);
  return (
    <div className="GeoMapPage grow-size">
      <div className="map-container">
        <GrowingGeoMap
          stations={filteredStations}
          measurements={features.measurements}
          connections={features.connections}
          currentYear={parseMeasurementDate(position).year}
          countries={countries}
          produceResizeEvent
        />
      </div>
      <div className="timeline-container">
        <Timeline
          date={position}
          onDateChange={(newValue) => dispatch(setTimelinePosition({ timelinePosition: newValue }))}
        />
      </div>
    </div>
  );
}
