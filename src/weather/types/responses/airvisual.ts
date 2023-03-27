export interface NearestCityResponse {
  status: string;
  data: Data;
}

export interface Data {
  city: string;
  state: string;
  country: string;
  location: Location;
  current: Current;
}

export interface Location {
  type: string;
  coordinates: number[];
}

export interface Current {
  pollution: Pollution;
  weather: Weather;
}

export interface Pollution {
  ts: string;
  aqius: number;
  mainus: string;
  aqicn: number;
  maincn: string;
}

export interface Weather {
  ts: string;
  tp: number;
  pr: number;
  hu: number;
  ws: number;
  wd: number;
  ic: string;
}
