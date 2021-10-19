import { PickupPoint } from "../types/PickupPoint";

export class AvailabilityPickupModel {
  public pickupRequired: boolean;
  public pickupAvailable: boolean;
  public pickupPoints: Array<PickupPoint> = [];

  constructor() {
    this.pickupRequired = false;
    this.pickupAvailable = false;
    this.pickupPoints = [];
  }
}
