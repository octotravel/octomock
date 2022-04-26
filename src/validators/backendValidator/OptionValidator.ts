import { CapabilityId, Unit, Pricing, ContactField, Option, UnitRestrictions} from '@octocloud/types';
import { UnitValidator } from "./UnitValidator";
import { PricingValidator } from "./PricingValidator";
import {
  StringValidator,
  RegExpArrayValidator,
  BooleanValidator,
  EnumArrayValidator,
  NumberValidator,
} from "./ValidatorHelpers";

export class OptionValidator {
  private path: string;
  private capabilites: CapabilityId[];
  constructor(path: string, capabilites: CapabilityId[]) {
    this.path = path;
    this.capabilites = capabilites;
  }
  public validate = (option: Option): void => {
    StringValidator.validate(`${this.path}.id`, option.id);
    BooleanValidator.validate(`${this.path}.default`, option.default);
    StringValidator.validate(`${this.path}.internalName`, option.internalName);
    StringValidator.validate(`${this.path}.reference`, option.reference, {
      nullable: true,
    });
    RegExpArrayValidator.validate(
      `${this.path}.availabilityLocalStartTimes`,
      option.availabilityLocalStartTimes,
      new RegExp(/^\d{2}:\d{2}$/g),
      { min: 1 }
    );
    StringValidator.validate(
      `${this.path}.cancellationCutoff`,
      option.cancellationCutoff
    );
    NumberValidator.validate(
      `${this.path}.cancellationCutoffAmount`,
      option.cancellationCutoffAmount,
      { integer: true }
    );
    StringValidator.validate(
      `${this.path}.cancellationCutoffUnit`,
      option.cancellationCutoffUnit
    );
    EnumArrayValidator.validate(
      `${this.path}.requiredContactFields`,
      option.requiredContactFields,
      Object.values(ContactField)
    );
    this.validateUnitRestrictions(option.restrictions);
    this.validateUnits(option.units);

    this.validatePricingCapability(option);
  };

  private validateUnitRestrictions = (restrictions: UnitRestrictions) => {
    NumberValidator.validate(
      `${this.path}.restrictions.minUnits`,
      restrictions.minUnits,
      { integer: true }
    );
    NumberValidator.validate(
      `${this.path}.restrictions.maxUnits`,
      restrictions.maxUnits,
      { nullable: true, integer: true }
    );
  };

  private validateUnits = (units: Unit[]) => {
    units.forEach((unit, i) => {
      const validator = new UnitValidator(
        `${this.path}.units[${i}]`,
        this.capabilites
      );
      validator.validate(unit);
    });
  };

  private validatePricingCapability = (option: Option): void => {
    if (this.capabilites.includes(CapabilityId.Pricing)) {
      const pricingValidator = new OptionPricingValidator(`${this.path}`);
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
