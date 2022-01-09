import { Theme, useTheme } from '@mui/material';
import { iterate } from 'iterare';
import { useMemo, useRef } from 'react';
import { View } from 'react-vega';
import * as ReactVega from 'react-vega';
import type { Spec } from 'vega';
import { withGrowingSize } from '../components/with-growing-size';
import topoJsonData from '../data/europe.topo.json';
import { Nullable } from '../lib/types';
import { defaultHeight, defaultWidth, SizeProps } from '../models/common';
import classNames from './MapPage.module.scss';

export function MapPage(props: SizeProps) {
  const theme = useTheme();
  const Chart = useMemo(() => createChart(theme), [theme]);

  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<Nullable<View>>(null);
  if (viewRef.current && containerRef.current) {
    const detailsNode = containerRef.current.querySelector('details > summary');
    const width = props.width - (detailsNode ? detailsNode.getBoundingClientRect().width : 0);
    const nonChartNodes = containerRef.current.querySelectorAll('.chart-wrapper > :not(.marks)');
    const height = iterate(nonChartNodes).reduce(
      (height, n) => height - (n as Element).getBoundingClientRect().height - 7,
      props.height
    );
    viewRef.current.width(width).height(height).run();
  }

  return (
    <div ref={containerRef} className={classNames.MapPage}>
      <Chart
        onNewView={(view) => {
          viewRef.current = view;
        }}
      />
    </div>
  );
}

export const GrowingMapPage = withGrowingSize(MapPage);

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
          value: 1200,
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
          domain: [0, 500],
          range: ['#e5f5e0', '#00441b'],
          clamp: true,
        },
        {
          name: 'temperature',
          type: 'linear',
          domain: [-25, 0, 35],
          range: ['#053061', '#f7f7f7', '#67001f'],
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
          // encode: {
          //   labels: {
          //     update: {
          //     },
          //   },
          // },
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
          name: 'stations',
          values: [
            {
              type: 'Feature',
              properties: {
                mag: 10,
                sig: 40,
              },
              geometry: {
                type: 'MultiPoint',
                coordinates: [[35.232845, 49.988358, 26.49]], // Kharkiv
              },
              id: 'ci37868143',
            },
            {
              type: 'Feature',
              properties: {
                mag: 16,
                sig: 40,
              },
              geometry: {
                type: 'MultiPoint',
                coordinates: [[35.732845, 49.988358, 26.49]], // Kharkiv
              },
              id: 'ci37868143',
            },
            {
              type: 'Feature',
              properties: {
                mag: 31,
                sig: 40,
              },
              geometry: {
                type: 'MultiPoint',
                coordinates: [[36.232845, 49.988358, 26.49]], // Kharkiv
              },
              id: 'ci37868143',
            },
            {
              type: 'Feature',
              properties: {
                mag: 28,
                sig: 40,
              },
              geometry: {
                type: 'MultiPoint',
                coordinates: [[36.732845, 49.988358, 26.49]], // Kharkiv
              },
              id: 'ci37868143',
            },
            {
              type: 'Feature',
              properties: {
                mag: 10,
                sig: 25,
              },
              geometry: {
                type: 'Point',
                coordinates: [-0.118092, 51.509865, 26.49], // London
              },
              id: 'ci37868144',
            },
          ],
        },
      ],

      marks: [
        {
          type: 'shape',
          from: { data: 'graticule' },
          encode: {
            update: {
              strokeWidth: { value: 1 },
              strokeDash: { value: 0 },
              stroke: { value: theme.palette.grey['300'] },
              fill: { value: null },
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
          from: { data: 'stations' },
          encode: {
            update: {
              opacity: { signal: 'datum.properties.sig / 100' },
              fill: { value: 'red' },
            },
          },
          transform: [
            {
              type: 'geoshape',
              projection: 'projection',
              pointRadius: { expr: "scale('measurementsPerMonth', datum.properties.mag)" },
            },
          ],
        },
      ],
    } as Spec,
  });
}
