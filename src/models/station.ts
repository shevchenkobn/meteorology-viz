export interface Station {
  /**
   * Station ID.
   */
  station: string;
  latitude: number;
  longitude: number;
  elevation: number;
  countryCode: string;
  name: string;
  yearFirst: number;
  yearLast: number;
}
