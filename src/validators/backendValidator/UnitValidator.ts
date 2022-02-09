import { CapabilityId } from "./../../types/Capability";
import { Restrictions, Unit } from "./../../types/Unit";
import { PricingValidator } from "./PricingValidator";

import {
  StringValidator,
  BooleanValidator,
  EnumArrayValidator,
  NumberValidator,
  NumberArrayValidator,
} from "./ValidatorHelpers";
import { ContactField } from "../../types/Option";
import { Pricing } from "../../types/Pricing";

export class UnitValidator {
  private path: string;
  private capabilites: CapabilityId[];
  constructor(path: string, capabilites: CapabilityId[]) {
    this.path = `${path}.units`;
    this.capabilites = capabilites;
  }
  public validate = (unit: Unit, index: number): void => {
    StringValidator.validate(`${this.path}[${index}].id`, unit.id);
    StringValidator.validate(
      `${this.path}[${index}].internalName`,
      unit.internalName
    );
    StringValidator.validate(
      `${this.path}[${index}].reference`,
      unit.reference
    );
    StringValidator.validate(`${this.path}[${index}].type`, unit.type, {
      nullable: true,
    });
    this.validateRestrictions(unit.restrictions, index);
    EnumArrayValidator.validate(
      `${this.path}[${index}].requiredContactFields`,
      unit.requiredContactFields,
      Object.values(ContactField)
    );

    this.validatePricingCapability(unit, index);
  };
  private validatePricingCapability = (unit: Unit, index: number): void => {
    if (this.capabilites.includes(CapabilityId.Pricing)) {
      const pricingValidator = new UnitPricingValidator(
        `${this.path}[${index}]`
      );
      pricingValidator.validate(unit);
    }
  };

  private validateRestrictions = (
    restrictions: Restrictions,
    index: number
  ) => {
    NumberValidator.validate(
      `${this.path}[${index}].restrictions.minAge`,
      restrictions.minAge,
      {
        integer: true,
      }
    );
    NumberValidator.validate(
      `${this.path}[${index}].restrictions.maxAge`,
      restrictions.maxAge,
      {
        integer: true,
      }
    );
    BooleanValidator.validate(
      `${this.path}[${index}].restrictions.idRequired`,
      restrictions.idRequired
    );
    NumberValidator.validate(
      `${this.path}[${index}].restrictions.minQuantity`,
      restrictions.minQuantity,
      { integer: true, nullable: true }
    );
    NumberValidator.validate(
      `${this.path}[${index}].restrictions.maxQuantity`,
      restrictions.maxQuantity,
      { integer: true, nullable: true }
    );
    NumberValidator.validate(
      `${this.path}[${index}].restrictions.paxCount`,
      restrictions.paxCount,
      { integer: true }
    );
    NumberArrayValidator.validate(
      `${this.path}[${index}].restrictions.accompaniedBy`,
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
