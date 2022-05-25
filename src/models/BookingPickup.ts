import { PickupPoint } from "@octocloud/types";

export class BookingPickupModel {
  public pickupRequired?: boolean;
  public pickupPoints?: PickupPoint[];

  constructor() {
    this.pickupRequired = false;
    this.pickupPoints = [];
  }
}
