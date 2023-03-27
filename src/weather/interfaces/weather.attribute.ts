export interface WeatherAttribute {
  createdAt: Date;
  updatedAt: Date;
  id: number;
  locationId: number;
  tp: number;
  pr: number;
  hu: number;
  ws: number;
  wd: number;
  ic: string;
}
