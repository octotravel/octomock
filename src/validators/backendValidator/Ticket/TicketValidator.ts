import { RedemptionMethod, DeliveryFormat, Ticket } from "@octocloud/types";
import {
  StringValidator,
  EnumValidator,
  NullValidator,
  ModelValidator,
  ValidatorError,
} from "../ValidatorHelpers";

export class TicketValidator implements ModelValidator {
  private path: string;
  constructor({ path }: { path: string }) {
    this.path = path;
  }
  public validate = (ticket: Ticket): ValidatorError[] => {
    const errors = [
      EnumValidator.validate(
        `${this.path}.redemptionMethod`,
        ticket?.redemptionMethod,
        Object.values(RedemptionMethod)
      ),
      NullValidator.validate(
        `${this.path}.utcRedeemedAt`,
        ticket?.utcRedeemedAt
      ),
      ...this.validateDeliveryOptions(ticket),
    ];

    return errors.filter(Boolean);
  };
  private validateDeliveryOptions = (ticket: Ticket): ValidatorError[] => {
    const deliveryOptions = ticket?.deliveryOptions ?? [];
    return deliveryOptions
      .map((deliveryOption, i) => [
        EnumValidator.validate(
          `${this.path}.deliveryOptions[${i}].deliveryFormat`,
          deliveryOption?.deliveryFormat,
          Object.values(DeliveryFormat)
        ),
        StringValidator.validate(
          `${this.path}.deliveryOptions[${i}].deliveryValue`,
          deliveryOption?.deliveryValue
        ),
      ])
      .flat(1)
      .filter(Boolean);
  };
}
