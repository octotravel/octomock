import {
  CapabilityId,
  Restrictions,
  Unit,
  ContactField,
  PricingPer,
} from "@octocloud/types";
import {
  StringValidator,
  BooleanValidator,
  EnumArrayValidator,
  NumberValidator,
  ModelValidator,
  ValidatorError,
  StringArrayValidator,
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
  public validate = (unit: Unit, pricingPer: PricingPer): ValidatorError[] => {
    return [
      StringValidator.validate(`${this.path}.id`, unit.id),
      StringValidator.validate(`${this.path}.internalName`, unit.internalName),
      StringValidator.validate(`${this.path}.reference`, unit.reference, {
        nullable: true,
      }),
      StringValidator.validate(`${this.path}.type`, unit.type, {
        nullable: true,
      }),
      ...this.validateRestrictions(unit.restrictions),
      EnumArrayValidator.validate(
        `${this.path}.requiredContactFields`,
        unit.requiredContactFields,
        Object.values(ContactField)
      ),
      ...this.validatePricingCapability(unit, pricingPer),
    ].filter(Boolean);
  };

  private validatePricingCapability = (
    unit: Unit,
    pricingPer: PricingPer
  ): ValidatorError[] => {
    if (
      this.capabilities.includes(CapabilityId.Pricing) &&
      pricingPer === PricingPer.UNIT
    ) {
      const pricingValidator = new UnitPricingValidator({
        path: this.path,
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
      StringArrayValidator.validate(
        `${this.path}.restrictions.accompaniedBy`,
        restrictions.accompaniedBy
      ),
    ].filter(Boolean);
  };
}
