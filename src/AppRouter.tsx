import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { GeoMapComparePage } from './pages/GeoMapComparePage';
import { GeoMapPage } from './pages/GeoMapPage';

export function AppRouter() {
  return (
    <Routes>
      {routes.map((p) => (
        <Route key={p.path} path={p.path} element={p.component} />
      ))}
      <Route path="*" element={<Navigate to={routes[0].path} />} />
    </Routes>
  );
}

export interface Route {
  path: string;
  label: string;
  component: React.ReactElement;
}

export const routes: ReadonlyArray<Readonly<Route>> = [
  { path: 'timeline', label: 'Timeline', component: <GeoMapPage /> },
  { path: 'compare', label: 'Comparison', component: <GeoMapComparePage /> },
];
