import {
  CapabilityId,
  Unit,
  ContactField,
  Option,
  UnitRestrictions,
  PricingPer,
  AvailabilityType,
} from "@octocloud/types";
import { OptionPickupValidator } from "./OptionPickupValidator";
import { UnitValidator } from "../Unit/UnitValidator";
import {
  StringValidator,
  RegExpArrayValidator,
  BooleanValidator,
  EnumArrayValidator,
  NumberValidator,
  ValidatorError,
  ModelValidator,
  ArrayValidator,
} from "../ValidatorHelpers";
import { OptionPricingValidator } from "./OptionPricingValidator";

export class OptionValidator implements ModelValidator {
  private path: string;
  private capabilities: CapabilityId[];
  constructor({
    path,
    capabilities,
  }: {
    path: string;
    capabilities: CapabilityId[];
  }) {
    this.path = path;
    this.capabilities = capabilities;
  }
  public validate = (
    option: Option,
    availabilityType: AvailabilityType,
    pricingPer?: PricingPer
  ): ValidatorError[] => {
    return [
      StringValidator.validate(`${this.path}.id`, option?.id),
      BooleanValidator.validate(`${this.path}.default`, option?.default),
      StringValidator.validate(
        `${this.path}.internalName`,
        option?.internalName
      ),
      StringValidator.validate(`${this.path}.reference`, option?.reference, {
        nullable: true,
      }),
      this.validateAvailabilityLocalStartTimes(
        option?.availabilityLocalStartTimes ?? [],
        availabilityType
      ),
      StringValidator.validate(
        `${this.path}.cancellationCutoff`,
        option?.cancellationCutoff
      ),
      NumberValidator.validate(
        `${this.path}.cancellationCutoffAmount`,
        option?.cancellationCutoffAmount,
        { integer: true }
      ),
      StringValidator.validate(
        `${this.path}.cancellationCutoffUnit`,
        option?.cancellationCutoffUnit
      ),
      EnumArrayValidator.validate(
        `${this.path}.requiredContactFields`,
        option?.requiredContactFields,
        Object.values(ContactField)
      ),
      ...this.validateUnitRestrictions(option?.restrictions),
      ...this.validateUnits(option?.units ?? [], pricingPer),

      ...this.validatePricingCapability(option, pricingPer),
      ...this.validatePickupCapability(option),
    ].filter(Boolean);
  };

  private validateAvailabilityLocalStartTimes = (
    availabilityLocalStartTimes: string[],
    availabilityType: AvailabilityType
  ) => {
    const path = `${this.path}.availabilityLocalStartTimes`;
    if (availabilityType === AvailabilityType.OPENING_HOURS) {
      return ArrayValidator.validate(path, availabilityLocalStartTimes, {
        empty: true,
      });
    }

    return RegExpArrayValidator.validate(
      path,
      availabilityLocalStartTimes,
      new RegExp(/^\d{2}:\d{2}$/g),
      { min: 1 }
    );
  };

  private validateUnitRestrictions = (
    restrictions: UnitRestrictions
  ): ValidatorError[] =>
    [
      NumberValidator.validate(
        `${this.path}.restrictions.minUnits`,
        restrictions?.minUnits,
        { integer: true }
      ),
      NumberValidator.validate(
        `${this.path}.restrictions.maxUnits`,
        restrictions?.maxUnits,
        { nullable: true, integer: true }
      ),
    ].filter(Boolean);

  private validateUnits = (
    units: Unit[],
    pricingPer: PricingPer
  ): ValidatorError[] => {
    return units
      .map((unit, i) => {
        const validator = new UnitValidator({
          path: `${this.path}.units[${i}]`,
          capabilities: this.capabilities,
        });
        return validator.validate(unit, pricingPer);
      })
      .flat(1)
      .filter(Boolean);
  };

  private validatePricingCapability = (
    option: Option,
    pricingPer?: PricingPer
  ): ValidatorError[] => {
    if (
      this.capabilities.includes(CapabilityId.Pricing) &&
      pricingPer === PricingPer.BOOKING
    ) {
      const pricingValidator = new OptionPricingValidator({
        path: `${this.path}`,
      });
      return pricingValidator.validate(option);
    }
    return [];
  };

  private validatePickupCapability = (option: Option): ValidatorError[] => {
    if (this.capabilities.includes(CapabilityId.Pickups)) {
      const pickupValidator = new OptionPickupValidator({
        path: `${this.path}`,
      });
      return pickupValidator.validate(option);
    }
    return [];
  };
}
