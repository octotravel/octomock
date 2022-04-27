import { PricingPer } from '@octocloud/types';
import { UnitModel } from "./../models/Unit";
import { UnitConfigModel } from "../models/UnitConfig";

interface UnitBuilderData {
  unitConfig: UnitConfigModel;
  pricingPer: PricingPer;
}

export class UnitBuilder {
  private unit: UnitModel;
  build(data: UnitBuilderData): UnitModel {
    const { unitConfig, pricingPer } = data;
    const pricing =
      pricingPer === PricingPer.UNIT
        ? unitConfig.pricingFrom.map((pricing) => ({
            currency: pricing.currency,
            currencyPrecision: pricing.currencyPrecision,
            includedTaxes: pricing.includedTaxes,
            net: pricing.net,
            original: pricing.original,
            retail: pricing.retail,
          }))
        : [];
    this.unit = new UnitModel({
      id: unitConfig.id,
      type: unitConfig.type,
      restrictions: {
        minAge: 18,
        maxAge: 100,
        idRequired: false,
        minQuantity: null,
        maxQuantity: null,
        paxCount: 1,
        accompaniedBy: [],
      },
      pricing,
    });

    return this.unit;
  }
}
