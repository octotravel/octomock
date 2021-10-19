import { Pricing, PricingUnit } from "../types/Pricing";

export class AvailabilityPricingModel {
  public unitPricing?: PricingUnit[]; // pricingPer = UNIT
  public pricing?: Pricing; // pricingPer = BOOKING

  constructor({
    unitPricing,
    pricing,
  }: {
    unitPricing?: PricingUnit[];
    pricing?: Pricing;
  }) {
    this.unitPricing = unitPricing;
    this.pricing = pricing;
  }
}
