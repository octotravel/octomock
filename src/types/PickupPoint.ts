export interface PickupPoint {
  id: string;
  name: string;
  direction: Nullable<string>;
  latitude: number;
  longitude: number;
  googlePlaceId: string;
  street: string;
  postalCode: string;
  locality: string;
  region: string;
  state: string;
  country: string;
}
