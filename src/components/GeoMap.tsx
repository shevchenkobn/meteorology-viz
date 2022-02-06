import { Theme, useTheme } from '@mui/material';
import dayjs from 'dayjs';
import { Feature, Point as GeoJsonPoint } from 'geojson';
import { iterate } from 'iterare';
import { useMemo, useRef } from 'react';
import { View } from 'react-vega';
import * as ReactVega from 'react-vega';
import type { Spec } from 'vega';
import { Point } from '../lib/dom';
import { GeoJsonMeasurementConnection, GeoJsonMeasurementFeature, GeoJsonStationFeature } from '../models/geo-json';
import { cloneDeepCommonMeasurementProps, MeasurementDate, MultiMeasurement } from '../models/measurement';
import { Station } from '../models/station';
import { withGrowSize } from './with-grow-size';
import topoJsonData from '../data/europe.topo.json';
import { DeepReadonly, DeepReadonlyArray, Nullable } from '../lib/types';
import { defaultHeight, defaultWidth, SizeProps } from '../models/common';
import './GeoMap.scss';

export interface GeoMapProps extends DeepReadonly<SizeProps> {
  readonly stations: DeepReadonlyArray<GeoJsonStationFeature>;
  readonly measurements: DeepReadonlyArray<GeoJsonMeasurementFeature>;
  readonly connections?: DeepReadonlyArray<GeoJsonMeasurementConnection>;
  /**
   * Map from country code to country name.
   */
  readonly countries?: DeepReadonly<Record<string, string>>;
  readonly currentYear?: number;
  /**
   * **[CRUTCH]** The VegaJS might suck and resizing, so after the first render the second one might be required to make sure the resize is successful.
   * Other programmatic are not working :'(
   * @default false
   */
  readonly produceResizeEvent?: boolean;
}

type FormattedMeasurement = Omit<MultiMeasurement, 'dates'> & {
  dates: string[];
};
type MeasurementFeature = DeepReadonly<
  Feature<
    GeoJsonPoint,
    {
      station: Station;
      measurement: FormattedMeasurement;
    }
  >
>;

enum DataSetName {
  Stations = 'stations',
  Measurements = 'measurements',
  Connections = 'connections',
}

enum Signal {
  CurrentYear = 'currentYear',
  Countries = 'countries',
}

export function GeoMap(props: GeoMapProps) {
  const theme = useTheme();
  const Chart = useMemo(() => createChart(theme), [theme]);
  const measurements = useMemo(
    () =>
      props.measurements.map((f) => {
        const measurement = cloneDeepCommonMeasurementProps(f.properties.measurement) as FormattedMeasurement;
        measurement.dates = f.properties.measurement.dates.map(formatDate);
        const newFeature: MeasurementFeature = {
          type: f.type,
          geometry: f.geometry,
          properties: {
            station: f.properties.station,
            measurement,
          },
        };
        if ('id' in f) {
          (newFeature as Feature<any, any>).id = f.id;
        }
        return newFeature;
      }),
    [props.measurements]
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<Nullable<View>>(null);
  if (viewRef.current) {
    rerenderView(viewRef.current);
  }

  return (
    <div ref={containerRef} className="GeoMap" style={{ width: props.width, height: props.height }}>
      <Chart
        style={{ width: props.width, height: props.height }}
        data={{
          [DataSetName.Stations]: props.stations,
          [DataSetName.Measurements]: measurements,
        }}
        onNewView={(view) => {
          viewRef.current = view;
          rerenderView(viewRef.current, true);
        }}
      />
    </div>
  );

  function setCurrentYear(view: View) {
    view.signal(Signal.CurrentYear, props.currentYear ?? null).run();
  }
  function rerenderView(view: View, firstRun = false) {
    setCurrentYear(view);
    if (props.countries) {
      view.signal(Signal.Countries, props.countries);
    }
    if (containerRef.current) {
      const { x, y } = getChartSize(containerRef.current);
      view.width(x).height(y);
    }
    // required for actual dataset rerendering.
    view.data(DataSetName.Measurements, measurements);
    view.data(DataSetName.Stations, props.stations);
    view.data(DataSetName.Connections, props.connections || []);
    if (props.produceResizeEvent) {
      view.runAsync().finally(() => window.dispatchEvent(new Event('resize')));
    } else {
      view.run();
    }
  }
  function getChartSize(container: HTMLDivElement): Point {
    const detailsNode = container.querySelector('details > summary');
    const width = props.width - (detailsNode ? detailsNode.getBoundingClientRect().width : 0);
    const nonChartNodes = container.querySelectorAll('.chart-wrapper > :not(.marks)');
    const height = iterate(nonChartNodes).reduce(
      (height, n) => height - (n as Element).getBoundingClientRect().height - 7,
      props.height
    );
    return { x: width, y: height };
  }
}

export const GrowingGeoMap = withGrowSize(GeoMap);

const measurementsRadiusLimits = [4, 7];
function createChart(theme: Theme) {
  const measurementsPerMonthLimits = [10, 31];
  return ReactVega.createClassFromSpec({
    mode: 'vega',
    spec: {
      $schema: 'https://vega.github.io/schema/vega/v5.json',
      description: 'A configurable map of countries of the world.',
      width: defaultWidth,
      height: defaultHeight,
      autosize: 'none',

      config: {
        background: theme.palette.background.default,
      },

      signals: [
        { name: 'translate0', update: 'width / 2' },
        { name: 'translate1', update: 'height / 2' },

        {
          name: 'type',
          value: 'stereographic',
          bind: {
            name: 'Projection',
            input: 'select',
            options: [
              'albers',
              'albersUsa',
              'azimuthalEqualArea',
              'azimuthalEquidistant',
              'conicConformal',
              'conicEqualArea',
              'conicEquidistant',
              'equalEarth',
              'equirectangular',
              'gnomonic',
              'mercator',
              'naturalEarth1',
              'orthographic',
              'stereographic',
              'transverseMercator',
            ],
          },
        },

        {
          name: 'center0',
          value: 20,
          bind: { name: 'Center longitude (X)', input: 'range', min: -29, max: 69, step: 1 },
        },
        {
          name: 'center1',
          value: 55,
          bind: { name: 'Center latitude (Y)', input: 'range', min: 34.6, max: 80, step: 1 },
          on: [
            {
              events: { signal: 'delta' },
              update: 'clamp(angles[1] + delta[1], -60, 60)',
            },
          ],
        },

        {
          name: 'rotate0',
          value: 0,
          bind: { name: 'Rotate 1', input: 'range', min: -180, max: 180, step: 1 },
          on: [
            {
              events: { signal: 'delta' },
              update: 'angles[0] + delta[0]',
            },
          ],
        },
        { name: 'rotate1', value: 0, bind: { name: 'Rotate 2', input: 'range', min: -90, max: 90, step: 1 } },
        { name: 'rotate2', value: 0, bind: { name: 'Rotate 3', input: 'range', min: -180, max: 180, step: 1 } },

        {
          name: 'scale',
          value: 2030,
          bind: { name: 'Scale', input: 'range', min: 0, max: 10000, step: 1 },
          on: [
            {
              events: { type: 'wheel', consume: true },
              update: 'clamp(scale * pow(1.002, -event.deltaY * pow(16, event.deltaMode)), 150, 10000)',
            },
          ],
        },

        {
          name: 'angles',
          value: [0, 0],
          on: [
            {
              events: 'mousedown',
              update: '[rotate0, center1]',
            },
          ],
        },
        {
          name: 'cloned',
          value: null,
          on: [
            {
              events: 'mousedown',
              update: "copy('projection')",
            },
          ],
        },
        {
          name: 'start',
          value: null,
          on: [
            {
              events: 'mousedown',
              update: 'invert(cloned, xy())',
            },
          ],
        },
        {
          name: 'drag',
          value: null,
          on: [
            {
              events: '[mousedown, window:mouseup] > window:mousemove',
              update: 'invert(cloned, xy())',
            },
          ],
        },
        {
          name: 'delta',
          value: null,
          on: [
            {
              events: { signal: 'drag' },
              update: '[drag[0] - start[0], start[1] - drag[1]]',
            },
          ],
        },

        {
          name: Signal.CurrentYear,
          value: null,
        },
        {
          name: Signal.Countries,
          value: {},
        },

        {
          name: 'hoveredStation',
          value: null,
          on: [
            {
              events: 'mouseover',
              update: 'datum && datum.geometry && datum.geometry.type === "Point" ? datum.properties.station : null',
            },
          ],
        },
      ],

      projections: [
        {
          name: 'projection',
          type: { signal: 'type' },
          scale: { signal: 'scale' },
          rotate: [{ signal: 'rotate0' }, { signal: 'rotate1' }, { signal: 'rotate2' }],
          center: [{ signal: 'center0' }, { signal: 'center1' }],
          translate: [{ signal: 'translate0' }, { signal: 'translate1' }],
        },
      ],

      scales: [
        {
          name: 'measurementsPerMonth',
          type: 'linear',
          domainMin: measurementsPerMonthLimits[0],
          domainMax: measurementsPerMonthLimits[1],
          domain: measurementsPerMonthLimits,
          range: measurementsRadiusLimits.slice(),
        },
        {
          name: 'measurementsPerMonth_dummySize',
          type: 'linear',
          domainMin: measurementsPerMonthLimits[0],
          domainMax: measurementsPerMonthLimits[1],
          domain: measurementsPerMonthLimits,
          range: measurementsRadiusLimits.map((v) => v * v * Math.PI),
        },
        {
          name: 'elevation',
          type: 'linear',
          domain: [0, 166.666666667, 333.33333333, 500],
          range: ['#00441b', '#a1d99b', '#fdae6b', '#d95f0e'],
          clamp: true,
        },
        {
          name: 'temperature',
          type: 'linear',
          domain: [-25, -20, -15, -10, -5, 0, 7, 14, 21, 28, 35],
          range: [
            '#053061',
            '#2166ac',
            '#4393c3',
            '#92c5de',
            '#d1e5f0',
            '#f7f7f7',
            '#fddbc7',
            '#f4a582',
            '#d6604d',
            '#b2182b',
            '#67001f',
          ],
          clamp: true,
        },
      ],

      legends: [
        {
          type: 'gradient',
          fill: 'temperature',
          orient: 'top-left',
          title: 'Temperature, °C',
          direction: 'horizontal',
          gradientStrokeWidth: 1,
          gradientStrokeColor: { value: theme.palette.grey['300'] },
        },
        {
          type: 'gradient',
          fill: 'elevation',
          orient: 'top-right',
          title: 'Elevation, m',
          direction: 'horizontal',
          gradientStrokeWidth: 1,
          gradientStrokeColor: { value: theme.palette.grey['300'] },
        },
        {
          type: 'symbol',
          orient: 'top-left',
          title: 'Measurements per month',
          symbolFillColor: { value: theme.palette.secondary.main },
          size: 'measurementsPerMonth_dummySize',
          tickMinStep: 5,
          direction: 'horizontal',
          columns: undefined,
          columnPadding: 5,
          symbolStrokeWidth: 0,
        },
      ],

      data: [
        {
          name: 'world',
          values: topoJsonData,
          format: {
            type: 'topojson',
            feature: 'europe',
          },
        },
        {
          name: 'graticule',
          transform: [{ type: 'graticule' }],
        },
        {
          name: DataSetName.Stations,
        },
        {
          name: DataSetName.Measurements,
        },
        {
          name: DataSetName.Connections,
        },
      ],

      marks: [
        {
          type: 'shape',
          from: { data: 'graticule' },
          encode: {
            update: {
              strokeWidth: { value: 1 },
              stroke: { value: theme.palette.grey['300'] },
            },
          },
          transform: [{ type: 'geoshape', projection: 'projection' }],
        },
        {
          type: 'shape',
          from: { data: 'world' },
          encode: {
            update: {
              strokeWidth: { value: 1 },
              stroke: { value: theme.palette.primary.main },
              fill: { value: theme.palette.grey.A100 },
              zindex: { value: 0 },
            },
            hover: {
              strokeWidth: { value: 2 },
              stroke: { value: theme.palette.secondary.main },
              zindex: { value: 1 },
            },
          },
          transform: [{ type: 'geoshape', projection: 'projection' }],
        },
        {
          type: 'shape',
          from: { data: DataSetName.Connections },
          encode: {
            update: {
              strokeWidth: {
                signal: 'hoveredStation && hoveredStation.station === datum.properties.station.station ? 3 : 2',
              },
              stroke: {
                signal: `hoveredStation && hoveredStation.station === datum.properties.station.station ? "${theme.palette.secondary.main}" : "${theme.palette.primary.main}"`,
              },
            },
          },
          transform: [
            {
              type: 'geoshape',
              projection: 'projection',
            },
          ],
        },
        {
          type: 'shape',
          from: { data: DataSetName.Stations },
          encode: {
            hover: {
              tooltip: {
                signal:
                  '{' +
                  'title: datum.properties.station.station + " - station", ' +
                  '"Status": currentYear < datum.properties.station.yearFirst ? "Not Yet Open" : currentYear > datum.properties.station.yearLast ? "Already Closed" : "Active", ' +
                  '"Name": datum.properties.station.name, ' +
                  '"Latitude": datum.properties.station.latitude + " °", ' +
                  '"Longitude": datum.properties.station.longitude + " °", ' +
                  '"Elevation": datum.properties.station.elevation + " m", ' +
                  `"Country": isString(${Signal.Countries}[datum.properties.station.countryCode]) ? ${Signal.Countries}[datum.properties.station.countryCode] + " (" + datum.properties.station.countryCode + ")" : datum.properties.station.countryCode, ` +
                  '"First Year": datum.properties.station.yearFirst, ' +
                  '"Last Year": datum.properties.station.yearLast' +
                  '}',
              },
            },
            update: {
              strokeWidth: {
                signal: 'hoveredStation && hoveredStation.station === datum.properties.station.station ? 3 : 1',
              },
              stroke: {
                signal: `hoveredStation && hoveredStation.station === datum.properties.station.station ? "${theme.palette.secondary.main}" : "${theme.palette.primary.main}"`,
              },
              fill: {
                signal: `!isNumber(currentYear) || (currentYear >= datum.properties.station.yearFirst && currentYear <= datum.properties.station.yearLast) ? scale('elevation', datum.properties.station.elevation) : '${theme.palette.grey['50']}'`,
              },
            },
          },
          transform: [
            {
              type: 'geoshape',
              projection: 'projection',
              pointRadius: {
                expr: 'hoveredStation && hoveredStation.station === datum.properties.station.station ? 5 : 3.5',
              },
            },
          ],
        },
        {
          type: 'shape',
          from: { data: DataSetName.Measurements },
          encode: {
            hover: {
              tooltip: {
                signal:
                  '{' +
                  'title: datum.properties.measurement.temperature + " °C, " + join(datum.properties.measurement.dates, "; ") + ", " + datum.properties.station.station, ' +
                  '"Temperature": datum.properties.measurement.temperature + " °C", ' +
                  '"Dates": join(datum.properties.measurement.dates, ", "), ' +
                  '"Observations": datum.properties.measurement.observations, ' +
                  '"Station": datum.properties.station.station, ' +
                  '"Station Name": datum.properties.station.name, ' +
                  '"Latitude": datum.properties.station.latitude + " °", ' +
                  '"Longitude": datum.properties.station.longitude + " °", ' +
                  '"Elevation": datum.properties.station.elevation + " m", ' +
                  `"Country": isString(${Signal.Countries}[datum.properties.station.countryCode]) ? ${Signal.Countries}[datum.properties.station.countryCode] + " (" + datum.properties.station.countryCode + ")" : datum.properties.station.countryCode` +
                  '}',
              },
            },
            update: {
              strokeWidth: { value: 3 },
              // stroke: { value: theme.palette.primary.main },
              stroke: {
                signal: `!isNumber(currentYear) || (currentYear >= datum.properties.station.yearFirst && currentYear <= datum.properties.station.yearLast) ? scale('elevation', datum.properties.station.elevation) : '${theme.palette.primary.main}'`,
              },
              fill: { signal: "scale('temperature', datum.properties.measurement.temperature)" },
            },
          },
          transform: [
            {
              type: 'geoshape',
              projection: 'projection',
              pointRadius: { expr: "scale('measurementsPerMonth', datum.properties.measurement.observations)" },
            },
          ],
        },
      ],
    } as Spec,
  });
}

function formatDate(date: MeasurementDate) {
  return dayjs(date).format('MMM (MM) YYYY');
}
