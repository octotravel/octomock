import { OfferDiscountModel, OfferDiscountType } from "../models/OfferDiscountModel";
import { AvailabilityUnit, Pricing, PricingUnit } from "@octocloud/types";
import { InvalidUnitIdError } from "../models/Error";
import R from "ramda";

export abstract class PricingFactory {
  public static createDiscountedUnitPricing(
    pricingUnit: PricingUnit,
    offerDiscountModel: OfferDiscountModel
  ): PricingUnit {
    return {
      unitId: pricingUnit.unitId,
      ...this.createDiscountedPricing(pricingUnit, offerDiscountModel),
    };
  }

  public static createDiscountedPricing(pricing: Pricing, offerDiscountModel: OfferDiscountModel): Pricing {
    const discountedPricing: Pricing = { ...pricing };

    let discount: number;

    switch (offerDiscountModel.type) {
      case OfferDiscountType.FLAT:
        discount = offerDiscountModel.amount;
        break;
      case OfferDiscountType.PERCENTAGE:
        discount = (discountedPricing.original / 100) * offerDiscountModel.amount;
        break;
      default:
        discount = 0;
    }

    discountedPricing.retail -= discount;

    return discountedPricing;
  }

  public static createFromAvailabilityUnits(
    pricingUnit: PricingUnit[],
    availabilityUnits: AvailabilityUnit[]
  ): Pricing[] {
    return availabilityUnits
      .map(({ id, quantity }) => {
        const specificPricingUnit: Nullable<PricingUnit> = pricingUnit.find((p) => p.unitId === id) ?? null;

        if (specificPricingUnit === null) {
          throw new InvalidUnitIdError(id);
        }

        const pricingWithoutUnitId: Pricing = R.omit(["unitId"], specificPricingUnit);
        const pricing: Pricing[] = new Array(quantity).fill(pricingWithoutUnitId);

        return pricing;
      })
      .flat();
  }

  public static createSummarizedPricing(pricing: Pricing[]) {
    return pricing.reduce(
      (acc, unitPricing) => {
        return {
          original: acc.original + unitPricing.original,
          retail: acc.retail + unitPricing.retail,
          net: (acc.net ?? 0) + (unitPricing.net ?? 0),
          currency: unitPricing.currency,
          currencyPrecision: unitPricing.currencyPrecision,
          includedTaxes: [...acc.includedTaxes, ...unitPricing.includedTaxes],
        };
      },
      {
        original: 0,
        retail: 0,
        net: 0,
        currency: "",
        currencyPrecision: 0,
        includedTaxes: [],
      }
    );
  }
}
