import iterate from 'iterare';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { distinctUntilChanged, map } from 'rxjs';
import { GrowingGeoMap } from '../components/GeoMap';
import { Timeline } from '../components/Timeline';
import { asEffectReset } from '../lib/rx';
import { parseMeasurementDate } from '../models/measurement';
import { useRxAppStore } from '../store';
import { setTimelinePosition } from '../store/actions/set-timeline-position';
import { areGeoDataShallowEqual, selectGeoData, selectGeoTimelinePosition, selectMappedCountries } from '../store/lib';
import './GeoMapPage.scss';

export function GeoMapPage() {
  const { store, state$ } = useRxAppStore();
  const state = store.getState();
  const { stations, measurementsByDate } = useSelector(selectGeoData, areGeoDataShallowEqual);
  const countries = useSelector(selectMappedCountries);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showAllStations, setShowAllStations] = useState(true);

  const [position, setPosition] = useState(selectGeoTimelinePosition(state));
  useEffect(
    () => asEffectReset(state$.pipe(map(selectGeoTimelinePosition), distinctUntilChanged()).subscribe(setPosition)),
    [state$]
  );

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
          onDateChange={(newValue) => store.dispatch(setTimelinePosition({ timelinePosition: newValue }))}
        />
      </div>
    </div>
  );
}
