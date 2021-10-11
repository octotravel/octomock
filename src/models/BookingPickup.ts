import { PickupPoint } from "./../types/PickupPoint";

export class BookingPickupModel {
  public pickupRequired?: boolean;
  public pickupPoints?: PickupPoint[];

  constructor() {
    this.pickupRequired = false;
    this.pickupPoints = [];
  }
}
