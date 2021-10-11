import { Pricing } from "../types/Pricing";

export class BookingPricingModel {
  public pricing: Pricing;

  constructor(pricing: Pricing) {
    this.pricing = pricing;
  }
}
