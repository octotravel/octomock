import { PricingPer } from "@octocloud/types";
import { UnitBuilder } from "./UnitBuilder";
import { UnitModel } from "./../models/Unit";
import { OptionModel } from "./../models/Option";
import { OptionConfigModel } from "../models/OptionConfig";
import { UnitConfigModel } from "../models/UnitConfig";

interface OptionBuilderData {
  primary: boolean;
  pricingPer?: PricingPer;
  optionConfig: OptionConfigModel;
}

export class OptionBuilder {
  private unitBuilder = new UnitBuilder();
  private option: OptionModel;

  build(data: OptionBuilderData): OptionModel {
    const { optionConfig, primary, pricingPer } = data;

    this.option = new OptionModel({
      id: optionConfig.id,
      internalName: optionConfig.name,
      primary,
      availabilityLocalStartTimes: optionConfig.localStartTimes,
      restrictions: {
        minUnits: optionConfig.minUnits,
        maxUnits: optionConfig.maxUnits,
      },
      units: this.generateUnitModels(optionConfig.unitConfigModels, pricingPer),
      durationAmount: optionConfig.durationAmount,
      durationUnit: optionConfig.durationUnit,
      pricing: optionConfig.pricingFrom,
    });

    return this.option;
  }

  private generateUnitModels = (
    unitsConfig: UnitConfigModel[],
    pricingPer: PricingPer
  ): UnitModel[] => {
    return unitsConfig.map((unitConfig) =>
      this.unitBuilder.build({ unitConfig, pricingPer })
    );
  };
}
