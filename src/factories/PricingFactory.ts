import { OptionModel } from '@octocloud/generators';
import { AvailabilityUnit, Pricing, PricingUnit } from '@octocloud/types';
import * as R from 'ramda';
import { UnitHelper } from '../helpers/UnitHelper';
import { InvalidUnitIdError } from '../models/Error';

export abstract class PricingFactory {
  public static createFromAvailabilityUnits(
    pricingUnit: PricingUnit[],
    availabilityUnits: AvailabilityUnit[],
    optionModel: OptionModel,
  ): Pricing[] {
    return availabilityUnits.flatMap(({ id, quantity, type }) => {
      const unitModel = UnitHelper.findUnitByTypeOrId(optionModel, id, type);
      if (unitModel === null) {
        throw new InvalidUnitIdError(`No unit found for ${id || type}`);
      }

      const specificPricingUnit: Nullable<PricingUnit> = pricingUnit.find((p) => p.unitId === unitModel.id) ?? null;

      if (specificPricingUnit === null) {
        throw new InvalidUnitIdError(`No pricing unit found for unit ${unitModel.id}`);
      }

      const pricingWithoutUnitId: Pricing = R.omit(['unitId', 'unitType'], specificPricingUnit);
      const pricing: Pricing[] = new Array(quantity).fill(pricingWithoutUnitId);

      return pricing;
    });
  }

  public static createSummarizedPricing(pricing: Pricing[]): Pricing {
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
        currency: '',
        currencyPrecision: 0,
        includedTaxes: [],
      },
    );
  }
}
