import {
  BookingStatus,
  CapabilityId,
  UnitItem,
  PricingPer,
  DeliveryMethod,
  Ticket,
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
import { TicketValidator } from "../Ticket/TicketValidator";

export class UnitItemValidator implements ModelValidator {
  private path: string;
  private capabilities: CapabilityId[];
  private unitValidator: UnitValidator;
  private ticketValidator: TicketValidator;
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
    this.ticketValidator = new TicketValidator({ path: `${this.path}.ticket` });
  }
  public validate = (
    unitItem: UnitItem,
    pricingPer: PricingPer,
    deliveryMethods: DeliveryMethod[]
  ): ValidatorError[] => {
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
      ...this.unitValidator.validate(unitItem.unit, pricingPer),
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

      ...this.validatePricingCapability(unitItem, pricingPer),
      ...this.validateTicket(unitItem.ticket, deliveryMethods),
    ];
    return errors.filter(Boolean);
  };

  private validateTicket = (
    ticket: Ticket,
    deliveryMethods: DeliveryMethod[]
  ): ValidatorError[] => {
    if (deliveryMethods.includes(DeliveryMethod.TICKET)) {
      return this.ticketValidator.validate(ticket);
    }

    return [NullValidator.validate(`${this.path}.ticket`, ticket)];
  };

  private validatePricingCapability = (
    unitItem: UnitItem,
    pricingPer: PricingPer
  ): ValidatorError[] => {
    if (
      this.capabilities.includes(CapabilityId.Pricing) &&
      pricingPer === PricingPer.UNIT
    ) {
      const pricingValidator = new PricingValidator(`${this.path}.pricing`);
      return pricingValidator.validate(unitItem.pricing);
    }
    return [];
  };
}
