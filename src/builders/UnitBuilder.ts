import { UnitModel } from "./../models/Unit";
import { UnitId } from "./../types/Unit";
import { Currency } from "../types/Currency";
import { CapabilityId } from "../types/Capability";

interface UnitBuilderData {
  unitId: UnitId;
  capabilities: CapabilityId[];
  currency: Currency;
}

export class UnitBuilder {
  private unit: UnitModel;
  build(data: UnitBuilderData): UnitModel {
    const { unitId, capabilities, currency } = data;

    this.unit = new UnitModel({
      id: unitId,
      restrictions: {
        minAge: 18,
        maxAge: 100,
        idRequired: false,
        minQuantity: null,
        maxQuantity: null,
        paxCount: 1,
        accompaniedBy: [],
      },
    });

    if (capabilities.includes(CapabilityId.Content)) {
      this.unit = this.unit.addContent();
    }

    if (capabilities.includes(CapabilityId.Pricing)) {
      this.unit = this.unit.addPricing(currency);
    }

    return this.unit;
  }
}
