import { OptionPickupModel } from "./OptionPickup";
import { OptionContentModel } from "./OptionContent";
import { UnitId } from "./../types/Unit";
import { Option } from "../types/Option";
import { UnitModel } from "./Unit";
import { ContactField, UnitRestrictions } from "../types/Option";
import { OptionPricingModel } from "./OptionPricing";
import { Pricing } from "../types/Pricing";
import { DurationUnit } from "../types/Duration";

export class OptionModel {
  public id: string;
  public primary: boolean;
  public internalName: string;
  public reference: Nullable<string>;
  public availabilityLocalStartTimes: Array<string>;
  public cancellationCutoff: string;
  public cancellationCutoffAmount: number;
  public cancellationCutoffUnit: string;
  public requiredContactFields: Array<ContactField>;
  public restrictions: UnitRestrictions;
  public units: Array<UnitModel>;
  // content
  public optionContentModel?: OptionContentModel;
  // pricing
  public optionPricingModel?: OptionPricingModel;
  // pickup
  public optionPickupModel?: OptionPickupModel;

  constructor({
    id,
    primary,
    internalName,
    availabilityLocalStartTimes,
    restrictions,
    units,
    durationAmount,
    durationUnit,
    pricing,
  }: {
    id: string;
    primary?: boolean;
    internalName: string;
    availabilityLocalStartTimes: string[];
    restrictions: UnitRestrictions;
    units: UnitModel[];
    durationUnit?: DurationUnit;
    durationAmount?: string;
    pricing: Pricing[];
  }) {
    this.id = id;
    this.primary = primary ?? true;
    this.internalName = internalName;
    this.reference = null;
    this.availabilityLocalStartTimes = availabilityLocalStartTimes;
    this.cancellationCutoff = "0 hours";
    this.cancellationCutoffAmount = 0;
    this.cancellationCutoffUnit = "hour";
    this.requiredContactFields = [];
    this.restrictions = restrictions;
    this.units = units;
    this.optionContentModel = new OptionContentModel({
      durationAmount,
      durationUnit,
    });
    this.optionPricingModel = new OptionPricingModel(pricing);
    this.optionPickupModel = new OptionPickupModel();
  }

  public findUnitModel = (unitId: UnitId): Nullable<UnitModel> => {
    return this.units.find((unit) => unit.id === unitId) ?? null;
  };

  public toPOJO = (): Option => {
    const {
      id,
      primary,
      internalName,
      reference,
      availabilityLocalStartTimes,
      cancellationCutoff,
      cancellationCutoffAmount,
      cancellationCutoffUnit,
      requiredContactFields,
      restrictions,

      units,
    } = this;
    const pojo: Option = {
      id,
      default: primary,
      internalName,
      reference,
      availabilityLocalStartTimes,
      cancellationCutoff,
      cancellationCutoffAmount,
      cancellationCutoffUnit,
      requiredContactFields,
      restrictions,
      units: units.map((unit) => unit.toPOJO()),
    };

    Object.keys(this.optionContentModel).forEach((key) => {
      pojo[key] = this.optionContentModel[key];
    });

    pojo.pricingFrom = this.optionPricingModel.pricingFrom;

    Object.keys(this.optionPickupModel).forEach((key) => {
      pojo[key] = this.optionPickupModel[key];
    });

    return pojo;
  };

  public static fromPOJO = (option: Option): OptionModel => {
    return new OptionModel({
      id: option.id,
      internalName: option.id,
      primary: option.default,
      availabilityLocalStartTimes: option.availabilityLocalStartTimes,
      restrictions: option.restrictions,
      units: option.units.map((unit) => UnitModel.fromPOJO(unit)),
      durationAmount: option.durationAmount,
      durationUnit: option.durationUnit,
      pricing: option.pricingFrom,
    });
  };
}
