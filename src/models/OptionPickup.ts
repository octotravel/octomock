import { PickupPoint } from "@octocloud/types";

export class OptionPickupModel {
  public pickupRequired?: boolean;
  public pickupAvailable?: boolean;
  public pickupPoints?: Array<PickupPoint> = [];

  constructor() {
    this.pickupRequired = false;
    this.pickupAvailable = false;
    this.pickupPoints = [];
  }
}
