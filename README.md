# Publication Analysis Tool.

## Running

This project contains an already prebuilt version as a single standalone file `./build/index.html`.

This file can be safely copied to any place, all the information is bundled in the file.

An up-to-date HTML5 browser is required to open the project.

## Building

To build the project (to `./build`) run 2 commands in the project root:
```shell
npm i
npm run build
```

The project uses React.JS, Antd design, Vega (D3), RxJS and a set of helper libraries.

However, it uses WebPack, TypeScript, SCSS for building from the sources. For code linting _eslint_ with _prettier_ is used.

## Development

To start the local web server with watcher run:
```shell
npm start
```

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

## Description

The project is recommended to be open using a horizontal FullHD display (1920x1080) with a cursor interface (the project heavily uses hovering mechanics).

The page consists of 3 parts:
1. slider to select year range;
2. tree view (like directory tree) of the citations of LNU;
3. sunburst (circle treemap) chart;

Both views are connected and have two-way data linking. The page is responsive, it will slightly adapt upon changing window size.

## FIXES:
- `"react-error-overlay": "6.0.9"` in `package.json`: https://github.com/facebook/create-react-app/issues/11771;

## TODO:
- update gradient checkpoints with more precise limits (perhaps, adaptive) **OR** change temperature gradient;
- Local Storage cache overflow.
- global average (where? near legend? bottom?)
- timeline with global average
- Understand if { ...state } is required in all actions
- TopoJSON to country code (by updating ID of TopoJSON points):
  - hover country border
  - bg country border

## PLAN:
- comparison selection inputs
  - select or autocomplete
  - select by entire years
  - select by entire seasons
  - select by months for all years
- timeline:
  - add step configuration
  - add speed configuration
- move timeline logic to the `GeoMapPage` component.
- TODOs
