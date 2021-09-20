import { Currency } from "./../types/Currency";
import { UnitBuilder } from "./UnitBuilder";
import { UnitModel } from "./../models/Unit";
import { OptionModel } from "./../models/Option";
import { UnitId } from "../types/Unit";
import { PricingPer } from "../types/Pricing";
import { CapabilityId } from "../types/Capability";

interface OptionBuilderData {
  id: string;
  name: string;
  primary;
  units: UnitId[];
  capabilities: CapabilityId[];
  pricingPer?: PricingPer;
  currency?: Currency;
}

export class OptionBuilder {
  private unitBuilder = new UnitBuilder();
  private option: OptionModel;

  build(data: OptionBuilderData): OptionModel {
    const { id, name, units, capabilities, currency, primary } = data;

    this.option = new OptionModel({
      id,
      internalName: name,
      primary,
      availabilityLocalStartTimes: ["00:00"],
      restrictions: {
        minUnits: null,
        maxUnits: null,
      },
      units: this.generateUnitModels(units, capabilities, currency),
    });

    if (capabilities.includes(CapabilityId.Content)) {
      this.option = this.option.addContent();
    }

    if (capabilities.includes(CapabilityId.Pickups)) {
      this.option = this.option.addPickup();
    }

    return this.option;
  }

  private generateUnitModels = (
    units: UnitId[],
    capabilities: CapabilityId[],
    currency: Currency
  ): UnitModel[] => {
    return units.map((unitId) =>
      this.unitBuilder.build({ unitId, capabilities, currency })
    );
  };
}
