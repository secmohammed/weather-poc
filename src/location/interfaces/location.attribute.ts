export enum LocationType {
  STATE = 'state',
  CITY = 'city',
  COUNTRY = 'country',
}
export interface LocationAttribute {
  id: number;
  name: string;
  parentId: number | null;
  type: LocationType;
}
