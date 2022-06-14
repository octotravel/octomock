import {
  RedemptionMethod,
  DeliveryFormat,
  BookingStatus,
  CapabilityId,
  UnitItem,
} from "@octocloud/types";
import { UnitValidator } from "../Unit/UnitValidator";

import {
  StringValidator,
  EnumValidator,
  NullValidator,
  ModelValidator,
  ValidatorError,
} from "../ValidatorHelpers";
import { ContactValidator } from "../Contact/ContactValidator";
import { PricingValidator } from "../Pricing/PricingValidator";

export class UnitItemValidator implements ModelValidator {
  private path: string;
  private capabilities: CapabilityId[];
  private unitValidator: UnitValidator;
  private contactValidator: ContactValidator;
  constructor({
    path,
    capabilities,
  }: {
    path: string;
    capabilities: CapabilityId[];
  }) {
    this.path = path;
    this.capabilities = capabilities;
    this.unitValidator = new UnitValidator({ path: this.path, capabilities });
    this.contactValidator = new ContactValidator({ path: this.path });
  }
  public validate = (unitItem: UnitItem): ValidatorError[] => {
    const errors = [
      StringValidator.validate(`${this.path}.uuid`, unitItem.uuid),
      StringValidator.validate(
        `${this.path}.resellerReference`,
        unitItem.uuid,
        {
          nullable: true,
        }
      ),
      StringValidator.validate(
        `${this.path}.supplierReference`,
        unitItem.uuid,
        {
          nullable: true,
        }
      ),
      StringValidator.validate(`${this.path}.unitId`, unitItem.unitId),
      ...this.unitValidator.validate(unitItem.unit),
      EnumValidator.validate(
        `${this.path}.status`,
        unitItem.status,
        Object.values(BookingStatus)
      ),
      NullValidator.validate(
        `${this.path}.utcRedeemedAt`,
        unitItem.utcRedeemedAt
      ),
      ...this.contactValidator.validate(unitItem.contact),

      ...this.validatePricingCapability(unitItem),
    ];

    if (unitItem.ticket) {
      errors.push(...this.validateTicket(unitItem));
    }
    return errors.filter(Boolean);
  };

  private validateTicket = (unitItem: UnitItem): ValidatorError[] =>
    [
      EnumValidator.validate(
        `${this.path}.ticket.redemptionMethod`,
        unitItem.ticket.redemptionMethod,
        Object.values(RedemptionMethod)
      ),
      NullValidator.validate(
        `${this.path}.ticket.utcRedeemedAt`,
        unitItem.ticket.utcRedeemedAt
      ),
      this.validateDeliveryOptions(unitItem),
    ]
      .flat(1)
      .filter(Boolean);

  private validateDeliveryOptions = (unitItem: UnitItem): ValidatorError[] => {
    return unitItem.ticket.deliveryOptions
      .map((deliveryOption, i) => [
        EnumValidator.validate(
          `${this.path}.ticket.deliveryOptions[${i}].deliveryFormat`,
          deliveryOption.deliveryFormat,
          Object.values(DeliveryFormat)
        ),
        StringValidator.validate(
          `${this.path}.ticket.deliveryOptions[${i}].deliveryValue`,
          deliveryOption.deliveryValue
        ),
      ])
      .flat(1)
      .filter(Boolean);
  };

  private validatePricingCapability = (
    unitItem: UnitItem
  ): ValidatorError[] => {
    if (this.capabilities.includes(CapabilityId.Pricing)) {
      const pricingValidator = new PricingValidator(`${this.path}.pricing`);
      return pricingValidator.validate(unitItem.pricing);
    }
    return [];
  };
}
