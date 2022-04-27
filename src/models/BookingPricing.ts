import { UnitItem, PricingPer, Pricing } from '@octocloud/types';
import { defaultPricing } from '../_types/Pricing';
import { ProductModel } from "./Product";
import { OptionModel } from "./Option";

export class BookingPricingModel {
  private product: ProductModel;
  private option: OptionModel;
  private unitItems: UnitItem[];

  constructor(
    product: ProductModel,
    option: OptionModel,
    unitItems: UnitItem[]
  ) {
    this.product = product;
    this.option = option;
    this.unitItems = unitItems;
  }

  public getPricing = (): Pricing => {
    const isPricingPerBooking =
      this.product.productPricingModel.pricingPer === PricingPer.BOOKING;
    if (isPricingPerBooking) {
      return this.calculatePerBookingPricing();
    }

    return this.calculatePerUnitPricing();
  };

  private calculatePerBookingPricing = (): Pricing => {
    return this.option.optionPricingModel.pricingFrom[0];
  };

  private calculatePerUnitPricing = (): Pricing => {
    return this.unitItems.reduce((acc: Pricing, item: UnitItem) => {
      const itemPricing = item.pricing[0];
      return {
        original: acc.original + itemPricing.original,
        retail: acc.retail + itemPricing.retail,
        net: acc.net + itemPricing.net,
        currency: itemPricing.currency,
        currencyPrecision: itemPricing.currencyPrecision,
        includedTaxes: [...acc.includedTaxes, ...itemPricing.includedTaxes],
      };
    }, defaultPricing);
  };
}
