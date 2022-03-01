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

The project uses React.JS, MaterialUI, VegaJS and a set of helper libraries.

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

## PLAN:
- comparison selection inputs (use autocopmlete with groups and apply with `import PublishIcon from '@mui/icons-material/Publish';` and update with `import RefreshIcon from '@mui/icons-material/Refresh';`)
  - select by entire years
  - select by entire seasons - separate component (for timeline)
  - select by months for all years
- timeline:
  - add step configuration
  - add speed configuration
- dialog with details measurement
- apply date format everywhere
- move timeline logic to the `GeoMapPage` component.
- TODOs
