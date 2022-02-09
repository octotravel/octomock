import { CapabilityId } from "./../../types/Capability";
import { UnitValidator } from "./UnitValidator";
import { Unit } from "./../../types/Unit";
import { PricingValidator } from "./PricingValidator";
import { Pricing } from "./../../types/Pricing";

import {
  StringValidator,
  RegExpArrayValidator,
  BooleanValidator,
  EnumArrayValidator,
  NumberValidator,
} from "./ValidatorHelpers";
import { ContactField, Option, UnitRestrictions } from "../../types/Option";

export class OptionValidator {
  private path: string;
  private capabilites: CapabilityId[];
  constructor(path: string, capabilites: CapabilityId[]) {
    this.path = `${path}.options`;
    this.capabilites = capabilites;
  }
  public validate = (option: Option, index: number): void => {
    StringValidator.validate(`${this.path}[${index}].id`, option.id);
    BooleanValidator.validate(`${this.path}[${index}].default`, option.default);
    StringValidator.validate(
      `${this.path}[${index}].internalName`,
      option.internalName
    );
    StringValidator.validate(
      `${this.path}[${index}].reference`,
      option.reference,
      {
        nullable: true,
      }
    );
    RegExpArrayValidator.validate(
      `${this.path}[${index}].availabilityLocalStartTimes`,
      option.availabilityLocalStartTimes,
      new RegExp(/^\d{2}:\d{2}$/g),
      { min: 1 }
    );
    StringValidator.validate(
      `${this.path}[${index}].cancellationCutoff`,
      option.cancellationCutoff
    );
    NumberValidator.validate(
      `${this.path}[${index}].cancellationCutoffAmount`,
      option.cancellationCutoffAmount,
      { integer: true }
    );
    StringValidator.validate(
      `${this.path}[${index}].cancellationCutoffUnit`,
      option.cancellationCutoffUnit
    );
    EnumArrayValidator.validate(
      `${this.path}[${index}].requiredContactFields`,
      option.requiredContactFields,
      Object.values(ContactField)
    );
    this.validateUnitRestrictions(option.restrictions, index);
    this.validateUnits(option.units, index);

    this.validatePricingCapability(option, index);
  };

  private validateUnitRestrictions = (
    restrictions: UnitRestrictions,
    index: number
  ) => {
    NumberValidator.validate(
      `${this.path}[${index}].restrictions.minUnits`,
      restrictions.minUnits,
      { integer: true }
    );
    NumberValidator.validate(
      `${this.path}[${index}].restrictions.maxUnits`,
      restrictions.maxUnits,
      { nullable: true, integer: true }
    );
  };

  private validateUnits = (units: Unit[], index: number) => {
    const validator = new UnitValidator(
      `${this.path}[${index}]`,
      this.capabilites
    );
    units.forEach((unit, i) => {
      validator.validate(unit, i);
    });
  };

  private validatePricingCapability = (option: Option, index: number): void => {
    if (this.capabilites.includes(CapabilityId.Pricing)) {
      const pricingValidator = new OptionPricingValidator(
        `${this.path}[${index}]`
      );
      pricingValidator.validate(option);
    }
  };
}

export class OptionPricingValidator {
  private pricingValidator: PricingValidator;
  private path: string;
  constructor(path: string) {
    this.path = path;
    this.pricingValidator = new PricingValidator(path);
  }

  public validate = (option: Option): void => {
    const isOnBooking = this.path.includes("booking");
    if (isOnBooking) {
      option?.pricing?.forEach((pricing, i) => {
        this.pricingValidator.setPath(`${this.path}.pricing[${i}]`);
        this.pricingValidator.validate(pricing as Pricing);
      });
    } else {
      option?.pricingFrom?.forEach((pricingFrom, i) => {
        this.pricingValidator.setPath(`${this.path}.pricingFrom[${i}]`);
        this.pricingValidator.validate(pricingFrom as Pricing);
      });
    }
  };
}
