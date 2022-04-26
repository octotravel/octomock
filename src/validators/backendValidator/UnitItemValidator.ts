import { RedemptionMethod, DeliveryFormat, BookingStatus, CapabilityId, UnitItem } from '@octocloud/types';
import { UnitValidator } from "./UnitValidator";

import {
  StringValidator,
  EnumValidator,
  NullValidator,
} from "./ValidatorHelpers";
import { ContactValidator } from "./ContactValidator";
import { PricingValidator } from "./PricingValidator";

export class UnitItemValidator {
  private path: string;
  private capabilites: CapabilityId[];
  private unitValidator: UnitValidator;
  private contactValidator: ContactValidator;
  constructor(path: string, capabilites: CapabilityId[]) {
    this.path = path;
    this.capabilites = capabilites;
    this.unitValidator = new UnitValidator(this.path, capabilites);
    this.contactValidator = new ContactValidator(this.path);
  }
  public validate = (unitItem: UnitItem): void => {
    StringValidator.validate(`${this.path}.uuid`, unitItem.uuid);
    StringValidator.validate(`${this.path}.resellerReference`, unitItem.uuid, {
      nullable: true,
    });
    StringValidator.validate(`${this.path}.supplierReferecne`, unitItem.uuid, {
      nullable: true,
    });
    StringValidator.validate(`${this.path}.unitId`, unitItem.unitId);
    this.unitValidator.validate(unitItem.unit);
    EnumValidator.validate(
      `${this.path}.status`,
      unitItem.status,
      Object.values(BookingStatus)
    );
    NullValidator.validate(
      `${this.path}.utcRedeemedAt`,
      unitItem.utcRedeemedAt
    );
    this.contactValidator.validate(unitItem.contact);
    this.validateTicket(unitItem);

    this.validatePricingCapability(unitItem);
  };

  private validateTicket = (unitItem: UnitItem): void => {
    EnumValidator.validate(
      `${this.path}.ticket.redemptionMethod`,
      unitItem.ticket.redemptionMethod,
      Object.values(RedemptionMethod)
    );
    NullValidator.validate(
      `${this.path}.ticket.utcRedeemedAt`,
      unitItem.ticket.utcRedeemedAt
    );
    this.validateDeliveryOptions(unitItem);
  };

  private validateDeliveryOptions = (unitItem: UnitItem): void => {
    unitItem.ticket.deliveryOptions.forEach((deliveryOption, i) => {
      EnumValidator.validate(
        `${this.path}.ticket.deliveryOptions[${i}].deliveryFormat`,
        deliveryOption.deliveryFormat,
        Object.values(DeliveryFormat)
      );
      StringValidator.validate(
        `${this.path}.ticket.deliveryOptions[${i}].deliveryValue`,
        deliveryOption.deliveryValue
      );
    });
  };

  private validatePricingCapability = (unitItem: UnitItem): void => {
    if (this.capabilites.includes(CapabilityId.Pricing)) {
      unitItem.pricing.forEach((pricing, i) => {
        const pricingValidator = new PricingValidator(
          `${this.path}.pricing[${i}]`
        );
        pricingValidator.validate(pricing);
      });
    }
  };
}
