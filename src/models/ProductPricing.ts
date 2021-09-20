import { pricingEUR } from "./../data/Pricing";
import { Currency } from "./../types/Currency";
import { Pricing, PricingPer } from "../types/Pricing";

export class ProductPricingModel {
  public defaultCurrency?: string;
  public availableCurrencies?: string[];
  public pricingPer?: PricingPer;
  public pricingFrom?: Pricing;

  constructor(pricingPer: PricingPer, currency: Currency) {
    this.defaultCurrency = currency;
    this.availableCurrencies = [currency];
    this.pricingPer = pricingPer;
    if (pricingPer === PricingPer.BOOKING) {
      if (currency === Currency.EUR) {
        this.pricingFrom = pricingEUR;
      } else {
        throw new Error(`${currency} currency not supported`);
      }
    }
  }
}
