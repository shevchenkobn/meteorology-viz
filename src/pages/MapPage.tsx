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

function createChart(theme: Theme) {
  return ReactVega.createClassFromSpec({
    mode: 'vega',
    spec: {
      $schema: 'https://vega.github.io/schema/vega/v5.json',
      description: 'A configurable map of countries of the world.',
      width: defaultWidth,
      height: defaultHeight,
      autosize: 'none',

      signals: [
        {
          name: 'type',
          value: 'stereographic',
          bind: {
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
        { name: 'scale', value: 1200, bind: { input: 'range', min: 50, max: 2000, step: 1 } },
        { name: 'rotate0', value: 0, bind: { input: 'range', min: -180, max: 180, step: 1 } },
        { name: 'rotate1', value: 0, bind: { input: 'range', min: -90, max: 90, step: 1 } },
        { name: 'rotate2', value: 0, bind: { input: 'range', min: -180, max: 180, step: 1 } },
        { name: 'center0', value: 20, bind: { input: 'range', min: -29, max: 69, step: 1 } },
        { name: 'center1', value: 55, bind: { input: 'range', min: 34.6, max: 80, step: 1 } },
        { name: 'translate0', update: 'width / 2' },
        { name: 'translate1', update: 'height / 2' },

        { name: 'graticuleDash', value: 0, bind: { input: 'radio', options: [0, 3, 5, 10] } },
        { name: 'borderWidth', value: 1, bind: { input: 'text' } },
        { name: 'background', value: '#ffffff', bind: { input: 'color' } },
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
      ],

      marks: [
        {
          type: 'shape',
          from: { data: 'graticule' },
          encode: {
            update: {
              strokeWidth: { value: 1 },
              strokeDash: { signal: '[+graticuleDash, +graticuleDash]' },
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
              strokeWidth: { signal: '+borderWidth' },
              stroke: { value: theme.palette.primary.main },
              fill: { value: theme.palette.grey.A100 },
              zindex: { value: 0 },
            },
            hover: {
              strokeWidth: { signal: '+borderWidth + 1' },
              stroke: { value: theme.palette.secondary.main },
              zindex: { value: 1 },
            },
          },
          transform: [{ type: 'geoshape', projection: 'projection' }],
        },
      ],
    } as Spec,
  });
}
