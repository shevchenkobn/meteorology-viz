import { iterate } from 'iterare';
import { GuardedMap } from '../../../lib/map';
import { DeepReadonly, DeepReadonlyArray, Iter } from '../../../lib/types';
import { CommonMeasurementProps, MeasurementDate } from '../../../models/measurement';
import { Station } from '../../../models/station';
import { ComparisonMeasurements, DeepReadonlyRootState } from '../../lib';

export function getNextId(lastId: number, isTaken: (id: number) => boolean) {
  let id = lastId;
  while (isTaken(id)) {
    id = overflowIncrement(id);
  }
  return id;
}

export function overflowIncrement(i: number) {
  return i >= Number.MAX_SAFE_INTEGER ? Number.MIN_SAFE_INTEGER : i + 1;
}

export type AverageByStation = GuardedMap<
  Station['station'],
  {
    value: number;
    observations: number;
    count: number;
  }
>;

export function getOrder(state: DeepReadonlyRootState['comparison']) {
  return state.draftSelectionsDelta.order.length > 0 ? state.draftSelectionsDelta.order : state.selections.order;
}

export function calculateAverageByStation(
  dates: Iterable<MeasurementDate>,
  stations: Iter<Station['station']>,
  getMeasurements: (station: MeasurementDate) => Iterable<CommonMeasurementProps>
): AverageByStation {
  const averageByStation: AverageByStation = new GuardedMap(
    iterate(stations).map((s) => [s, { value: 0, observations: 0, count: 0 }])
  );
  for (const date of dates) {
    const measurements = getMeasurements(date);
    for (const { station, temperature, observations } of measurements) {
      const average = averageByStation.get(station);
      average.value = (average.value * average.count + temperature) / (average.count + 1);
      average.observations += observations;
      average.count += 1;
    }
  }
  return averageByStation;
}

export function setAverageMeasurements(
  measurements: ComparisonMeasurements,
  comparisonSelectionId: number,
  dates: DeepReadonlyArray<MeasurementDate>,
  averageByStation: DeepReadonly<AverageByStation>
) {
  for (const [station, average] of averageByStation) {
    measurements[station] = { ...measurements[station] };
    measurements[station][comparisonSelectionId] = {
      station,
      dates: dates.slice(),
      nonEmptyDates: average.count,
      temperature: average.count > 0 ? average.value : Number.NaN,
      observations: average.observations / average.count,
    };
  }
}
