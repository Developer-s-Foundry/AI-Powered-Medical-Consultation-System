export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  coordinates: Coordinates;
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}
