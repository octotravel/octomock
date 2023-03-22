import { AvailabilityUnit, Pricing, PricingUnit } from "@octocloud/types";
import R from "ramda";
import { InvalidUnitIdError } from "../models/Error";

export abstract class PricingFactory {
  public static createFromAvailabilityUnits(
    pricingUnit: PricingUnit[],
    availabilityUnits: AvailabilityUnit[],
  ): Pricing[] {
    return availabilityUnits
      .map(({ id, quantity }) => {
        const specificPricingUnit: Nullable<PricingUnit> =
          pricingUnit.find((p) => p.unitId === id) ?? null;

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
      (acc, unitPricing) => ({
        original: acc.original + unitPricing.original,
        retail: acc.retail + unitPricing.retail,
        net: (acc.net ?? 0) + (unitPricing.net ?? 0),
        currency: unitPricing.currency,
        currencyPrecision: unitPricing.currencyPrecision,
        includedTaxes: [...acc.includedTaxes, ...unitPricing.includedTaxes],
      }),
      {
        original: 0,
        retail: 0,
        net: 0,
        currency: "",
        currencyPrecision: 0,
        includedTaxes: [],
      },
    );
  }
}
