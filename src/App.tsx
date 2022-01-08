import React from 'react';
import './App.scss';
import { loadCountries, loadMeasurements, loadStations } from './data';

function App() {
  console.log('parsed CSV', loadCountries(), loadStations(), loadMeasurements());

  return <div className="App"></div>;
}

export default App;
