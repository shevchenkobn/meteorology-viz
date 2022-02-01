import { GrowingGeoMap } from '../components/GeoMap';
import './GeoMapComparePage.scss';

export function GeoMapComparePage() {
  return (
    <div className="grow-size GeoMapComparePage">
      <div className="map-container">
        <GrowingGeoMap stations={[]} measurements={[]} />
      </div>
      <div>filters</div>
    </div>
  );
}
