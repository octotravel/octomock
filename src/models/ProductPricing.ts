import { Currency, PricingPer } from "@octocloud/types";

export class ProductPricingModel {
  public defaultCurrency?: string;
  public availableCurrencies?: string[];
  public pricingPer?: PricingPer;

  constructor(pricingPer: PricingPer, currency: Currency) {
    this.defaultCurrency = currency;
    this.availableCurrencies = [currency];
    this.pricingPer = pricingPer;
  }
}
