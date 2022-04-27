import { Pricing } from '@octocloud/types';

export class OptionPricingModel {
  public pricingFrom?: Pricing[];

  constructor(pricing: Pricing[]) {
    this.pricingFrom = pricing;
  }
}
