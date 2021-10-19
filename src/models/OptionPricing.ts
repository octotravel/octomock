import { Pricing } from "../types/Pricing";

export class OptionPricingModel {
  public pricingFrom?: Pricing[];

  constructor(pricing: Pricing[]) {
    this.pricingFrom = pricing;
  }
}
