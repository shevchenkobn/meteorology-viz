import { useEffect, useState } from 'react';
import { distinctUntilChanged, map } from 'rxjs';
import { GrowingGeoMap } from '../components/GeoMap';
import { asEffectReset } from '../lib/rx';
import { useRxAppStore } from '../store';
import { areGeoDataShallowEqual, selectGeoData, selectGeoTimelinePosition } from '../store/lib';

export function GeoMapPage() {
  const { store, state$ } = useRxAppStore();
  const state = store.getState();
  const [{ stations, measurementsByDate }, setGeoData] = useState(selectGeoData(state));
  useEffect(
    () =>
      asEffectReset(
        state$.pipe(map(selectGeoData), distinctUntilChanged(areGeoDataShallowEqual)).subscribe(setGeoData)
      ),
    [state$]
  );

  const [position, setPosition] = useState(selectGeoTimelinePosition(state));
  useEffect(
    () => asEffectReset(state$.pipe(map(selectGeoTimelinePosition), distinctUntilChanged()).subscribe(setPosition)),
    [state$]
  );

  return <GrowingGeoMap stations={stations} measurements={measurementsByDate[position]} />;
}
