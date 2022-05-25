import { PricingPer, Pricing, PricingUnit } from "@octocloud/types";

export class AvailabilityPricingModel {
  public unitPricing?: PricingUnit[];
  public pricing?: Pricing;
  private containsUnits?: boolean;
  private pricingPer: PricingPer;

  constructor({
    unitPricing,
    pricing,
    pricingPer,
    containsUnits,
  }: {
    unitPricing?: PricingUnit[];
    pricing?: Pricing;
    pricingPer: PricingPer;
    containsUnits?: boolean;
  }) {
    this.unitPricing = unitPricing;
    this.pricing = pricing;
    this.containsUnits = containsUnits ?? false;
    this.pricingPer = pricingPer;
  }

  public shouldUsePricing = (): boolean => {
    if (this.pricingPer === PricingPer.BOOKING || this.containsUnits) {
      return true;
    }
    return false;
  };

  public shouldUseUnitPricing = (): boolean => {
    return this.pricingPer === PricingPer.UNIT;
  };
}
