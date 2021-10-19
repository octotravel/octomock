import { Option } from "../types/Option";
import { UnitModel } from "./Unit";
import { PickupPoint } from "../types/PickupPoint";
import { ContactField, UnitRestrictions } from "../types/Option";
import { CapabilityId } from "../types/Capability";
import { Itinerary } from "../types/Option";
import { OptionPricingModel } from "./OptionPricing";
import { Pricing } from "../types/Pricing";
import { DurationUnit } from "../types/Duration";

export class OptionModel {
  public id: string;
  private primary: boolean;
  private internalName: string;
  private reference: Nullable<string>;
  public availabilityLocalStartTimes: Array<string>;
  private cancellationCutoff: string;
  private cancellationCutoffAmount: number;
  private cancellationCutoffUnit: string;
  private requiredContactFields: Array<ContactField>;
  public restrictions: UnitRestrictions;
  private units: Array<UnitModel>;
  // content
  private title?: string;
  private subtitle?: string;
  private language?: string;
  private shortDescription?: string;
  private duration?: string;
  public durationAmount?: string;
  public durationUnit?: DurationUnit;
  private itinerary?: Nullable<Itinerary[]>;
  private optionPricingModel?: OptionPricingModel;
  // pickup
  private pickupRequired?: boolean;
  private pickupAvailable?: boolean;
  private pickupPoints?: Array<PickupPoint> = [];

  private capabilities: CapabilityId[] = [];

  constructor({
    id,
    primary,
    internalName,
    availabilityLocalStartTimes,
    restrictions,
    units,
    durationAmount,
    durationUnit,
  }: {
    id: string;
    primary?: boolean;
    internalName: string;
    availabilityLocalStartTimes: string[];
    restrictions: UnitRestrictions;
    units: UnitModel[];
    durationUnit?: DurationUnit;
    durationAmount?: string;
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
    this.durationUnit = durationUnit ?? DurationUnit.HOURS;
    this.durationAmount = durationAmount ?? "0";

    this.title = "title";
    this.subtitle = "subtitle";
    this.language = "en";
    this.shortDescription = "shortDescription";
    this.duration = `${this.durationAmount} ${this.durationUnit}`;
    this.itinerary = [];
  }

  public addContent = (): OptionModel => {
    this.capabilities.push(CapabilityId.Content);

    return this;
  };

  public addPricing = (pricing: Pricing[]) => {
    this.optionPricingModel = new OptionPricingModel(pricing);
    return this;
  };

  public addPickup = (): OptionModel => {
    this.capabilities.push(CapabilityId.Pickups);
    this.pickupRequired = false;
    this.pickupAvailable = false;
    this.pickupPoints = [];
    return this;
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

    if (this.capabilities.includes(CapabilityId.Content)) {
      pojo.title = this.title;
      pojo.subtitle = this.subtitle;
      pojo.language = this.language;
      pojo.shortDescription = this.shortDescription;
      pojo.duration = this.duration;
      pojo.durationAmount = this.durationAmount;
      pojo.durationUnit = this.durationUnit;
      pojo.itinerary = this.itinerary;
    }

    if (this.capabilities.includes(CapabilityId.Pricing)) {
      pojo.pricingFrom = this.optionPricingModel.pricingFrom;
    }

    if (this.capabilities.includes(CapabilityId.Pickups)) {
      pojo.pickupRequired = this.pickupRequired;
      pojo.pickupAvailable = this.pickupAvailable;
      pojo.pickupPoints = this.pickupPoints;
    }

    return pojo;
  };
}
