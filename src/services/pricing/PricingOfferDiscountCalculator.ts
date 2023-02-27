import { NetDiscount, Pricing, Tax } from "@octocloud/types";
import { OfferDiscountModel, OfferDiscountType } from "../../models/OfferDiscountModel";
import { OfferWithDiscountModel } from "../../models/OfferWithDiscountModel";
import * as R from "ramda";

export class PricingOfferDiscountCalculator {
  public createDiscountedPricing(pricing: Pricing, offerWithDiscountModel: OfferWithDiscountModel): Pricing {
    const discountedPricing: Pricing = R.clone(pricing);

    discountedPricing.retail = this.calculateDiscountedRetail(discountedPricing.original, offerWithDiscountModel);

    if (discountedPricing.net !== null) {
      discountedPricing.net = this.calculateDiscountedNet(
        discountedPricing.original,
        discountedPricing.retail,
        discountedPricing.net,
        offerWithDiscountModel
      );
    }

    if (discountedPricing.includedTaxes.length !== 0) {
      discountedPricing.includedTaxes.map((includedTax) => {
        return this.calculateTax(
          discountedPricing.original,
          discountedPricing.retail,
          includedTax,
          offerWithDiscountModel
        );
      });
    }

    return discountedPricing;
  }

  private calculateDiscountedRetail(originalAmount: number, offerWithDiscountModel: OfferWithDiscountModel): number {
    const discountAmount = this.getDiscountAmount(originalAmount, offerWithDiscountModel.offerDiscountModel);

    return originalAmount - Math.round(discountAmount);
  }

  private calculateDiscountedNet(
    originalAmount: number,
    retailAmount: number,
    netAmount: number,
    offerWithDiscountModel: OfferWithDiscountModel
  ): number {
    return (
      netAmount - Math.round(this.getNetDiscountAmount(originalAmount, retailAmount, netAmount, offerWithDiscountModel))
    );
  }

  private calculateTax(
    original: number,
    retail: number,
    tax: Tax,
    offerWithDiscountModel: OfferWithDiscountModel
  ): Tax {
    const taxCoefficient: number = parseFloat((original / (original - tax.original)).toFixed(2));

    tax.retail = Math.round(retail - retail / taxCoefficient);

    if (tax.net !== null) {
      tax.net = this.calculateDiscountedNet(tax.original, tax.retail, tax.net, offerWithDiscountModel);
    }

    return tax;
  }

  private getNetDiscountAmount(
    originalAmount: number,
    retailAmount: number,
    netAmount: number,
    offerWithDiscountModel: OfferWithDiscountModel
  ): number {
    const discountAmount = originalAmount - retailAmount;
    switch (offerWithDiscountModel.netDiscount) {
      case NetDiscount.NONE:
        return 0;
      case NetDiscount.FULL:
        return discountAmount;
      case NetDiscount.SPLIT:
        return discountAmount / 2;
      case NetDiscount.PRORATED:
        return discountAmount * (netAmount / retailAmount);
      default:
        return 0;
    }
  }

  private getDiscountAmount(number: number, offerDiscountModel: OfferDiscountModel): number {
    switch (offerDiscountModel.type) {
      case OfferDiscountType.FLAT:
        return offerDiscountModel.amount;
      case OfferDiscountType.PERCENTAGE:
        return (number / 100) * offerDiscountModel.amount;
      default:
        return 0;
    }
  }
}
