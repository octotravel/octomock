import { UnitBuilder } from "./UnitBuilder";
import { UnitModel } from "./../models/Unit";
import { OptionModel } from "./../models/Option";
import { PricingPer } from "../types/Pricing";
import { CapabilityId } from "../types/Capability";
import { OptionConfigModel } from "../models/OptionConfig";
import { UnitConfigModel } from "../models/UnitConfig";

interface OptionBuilderData {
  primary: boolean;
  capabilities: CapabilityId[];
  pricingPer?: PricingPer;
  optionConfig: OptionConfigModel;
}

export class OptionBuilder {
  private unitBuilder = new UnitBuilder();
  private option: OptionModel;

  build(data: OptionBuilderData): OptionModel {
    const { optionConfig, capabilities, primary, pricingPer } = data;

    this.option = new OptionModel({
      id: optionConfig.id,
      internalName: optionConfig.name,
      primary,
      availabilityLocalStartTimes: optionConfig.localStartTimes,
      restrictions: {
        minUnits: optionConfig.minUnits,
        maxUnits: optionConfig.maxUnits,
      },
      units: this.generateUnitModels(
        optionConfig.unitConfigModels,
        capabilities
      ),
      durationAmount: optionConfig.durationAmount,
      durationUnit: optionConfig.durationUnit,
    });

    if (capabilities.includes(CapabilityId.Content)) {
      this.option = this.option.addContent();
    }

    if (capabilities.includes(CapabilityId.Pricing)) {
      if (pricingPer === PricingPer.BOOKING) {
        this.option = this.option.addPricing(optionConfig.pricingFrom);
      }
    }

    if (capabilities.includes(CapabilityId.Pickups)) {
      this.option = this.option.addPickup();
    }

    return this.option;
  }

  private generateUnitModels = (
    unitsConfig: UnitConfigModel[],
    capabilities: CapabilityId[]
  ): UnitModel[] => {
    return unitsConfig.map((unitConfig) =>
      this.unitBuilder.build({ unitConfig, capabilities })
    );
  };
}
