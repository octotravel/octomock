import {
  CapabilityId,
  Restrictions,
  Unit,
  ContactField,
} from "@octocloud/types";
import {
  StringValidator,
  BooleanValidator,
  EnumArrayValidator,
  NumberValidator,
  NumberArrayValidator,
  ModelValidator,
  ValidatorError,
} from "../ValidatorHelpers";
import { UnitPricingValidator } from "./UnitPricingValidator";

export class UnitValidator implements ModelValidator {
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
  public validate = (unit: Unit): ValidatorError[] => {
    return [
      StringValidator.validate(`${this.path}.id`, unit.id),
      StringValidator.validate(`${this.path}.internalName`, unit.internalName),
      StringValidator.validate(`${this.path}.reference`, unit.reference),
      StringValidator.validate(`${this.path}.type`, unit.type, {
        nullable: true,
      }),
      ...this.validateRestrictions(unit.restrictions),
      EnumArrayValidator.validate(
        `${this.path}.requiredContactFields`,
        unit.requiredContactFields,
        Object.values(ContactField)
      ),
      ...this.validatePricingCapability(unit),
    ].filter(Boolean);
  };

  private validatePricingCapability = (unit: Unit): ValidatorError[] => {
    if (this.capabilities.includes(CapabilityId.Pricing)) {
      const pricingValidator = new UnitPricingValidator({
        path: ``,
      });
      return pricingValidator.validate(unit);
    }
    return [];
  };

  private validateRestrictions = (
    restrictions: Restrictions
  ): ValidatorError[] => {
    return [
      NumberValidator.validate(
        `${this.path}.restrictions.minAge`,
        restrictions.minAge,
        {
          integer: true,
        }
      ),
      NumberValidator.validate(
        `${this.path}.restrictions.maxAge`,
        restrictions.maxAge,
        {
          integer: true,
        }
      ),
      BooleanValidator.validate(
        `${this.path}.restrictions.idRequired`,
        restrictions.idRequired
      ),
      NumberValidator.validate(
        `${this.path}.restrictions.minQuantity`,
        restrictions.minQuantity,
        { integer: true, nullable: true }
      ),
      NumberValidator.validate(
        `${this.path}.restrictions.maxQuantity`,
        restrictions.maxQuantity,
        { integer: true, nullable: true }
      ),
      NumberValidator.validate(
        `${this.path}.restrictions.paxCount`,
        restrictions.paxCount,
        { integer: true }
      ),
      NumberArrayValidator.validate(
        `${this.path}.restrictions.accompaniedBy`,
        restrictions.accompaniedBy,
        { integer: true }
      ),
    ].filter(Boolean);
  };
}
