import React from 'react';
import './App.scss';
import { loadCountries, loadObservations, loadStations } from './data';

function App() {
  console.log('parsed CSV', loadCountries(), loadStations(), loadObservations());

  return <div className="App"></div>;
}

export default App;
