import { CapabilityId, Restrictions, Unit, ContactField, Pricing } from '@octocloud/types';
import { PricingValidator } from "./PricingValidator";

import {
  StringValidator,
  BooleanValidator,
  EnumArrayValidator,
  NumberValidator,
  NumberArrayValidator,
} from "./ValidatorHelpers";

export class UnitValidator {
  private path: string;
  private capabilites: CapabilityId[];
  constructor(path: string, capabilites: CapabilityId[]) {
    this.path = path;
    this.capabilites = capabilites;
  }
  public validate = (unit: Unit): void => {
    StringValidator.validate(`${this.path}.id`, unit.id);
    StringValidator.validate(`${this.path}.internalName`, unit.internalName);
    StringValidator.validate(`${this.path}.reference`, unit.reference);
    StringValidator.validate(`${this.path}.type`, unit.type, {
      nullable: true,
    });
    this.validateRestrictions(unit.restrictions);
    EnumArrayValidator.validate(
      `${this.path}.requiredContactFields`,
      unit.requiredContactFields,
      Object.values(ContactField)
    );

    this.validatePricingCapability(unit);
  };
  private validatePricingCapability = (unit: Unit): void => {
    if (this.capabilites.includes(CapabilityId.Pricing)) {
      const pricingValidator = new UnitPricingValidator(`${this.path}`);
      pricingValidator.validate(unit);
    }
  };

  private validateRestrictions = (restrictions: Restrictions) => {
    NumberValidator.validate(
      `${this.path}.restrictions.minAge`,
      restrictions.minAge,
      {
        integer: true,
      }
    );
    NumberValidator.validate(
      `${this.path}.restrictions.maxAge`,
      restrictions.maxAge,
      {
        integer: true,
      }
    );
    BooleanValidator.validate(
      `${this.path}.restrictions.idRequired`,
      restrictions.idRequired
    );
    NumberValidator.validate(
      `${this.path}.restrictions.minQuantity`,
      restrictions.minQuantity,
      { integer: true, nullable: true }
    );
    NumberValidator.validate(
      `${this.path}.restrictions.maxQuantity`,
      restrictions.maxQuantity,
      { integer: true, nullable: true }
    );
    NumberValidator.validate(
      `${this.path}.restrictions.paxCount`,
      restrictions.paxCount,
      { integer: true }
    );
    NumberArrayValidator.validate(
      `${this.path}.restrictions.accompaniedBy`,
      restrictions.accompaniedBy,
      { integer: true }
    );
  };
}

export class UnitPricingValidator {
  private pricingValidator: PricingValidator;
  private path: string;
  constructor(path: string) {
    this.path = path;
    this.pricingValidator = new PricingValidator(path);
  }

  public validate = (unit: Unit): void => {
    const isOnBooking = this.path.includes("booking");
    if (isOnBooking) {
      unit?.pricing?.forEach((pricing, i) => {
        this.pricingValidator.setPath(`${this.path}.pricing[${i}]`);
        this.pricingValidator.validate(pricing as Pricing);
      });
    } else {
      unit?.pricingFrom?.forEach((pricingFrom, i) => {
        this.pricingValidator.setPath(`${this.path}.pricingFrom[${i}]`);
        this.pricingValidator.validate(pricingFrom as Pricing);
      });
    }
  };
}
