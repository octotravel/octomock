import { PricingPer, Pricing } from "@octocloud/types";
import { UnitItemModel } from "./UnitItemModel";
import { ProductModel } from "./Product";
import { OptionModel } from "./Option";

const defaultPricing = {
  original: 0,
  retail: 0,
  net: 0,
  currency: "",
  currencyPrecision: 0,
  includedTaxes: [],
};
export class BookingPricingModel {
  private product: ProductModel;
  private option: OptionModel;
  private unitItems: UnitItemModel[];

  constructor(
    product: ProductModel,
    option: OptionModel,
    unitItems: UnitItemModel[]
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
    return this.unitItems.reduce((acc: Pricing, item: UnitItemModel) => {
      const itemPricing = item.pricing;
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
