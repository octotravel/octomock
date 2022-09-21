import { Booking } from "@octocloud/types";
import { CommonValidator } from "../../CommonValidator";
import { NullValidator } from "../../ValidatorHelpers";
import { ModelValidator, ValidatorError } from "./../../ValidatorHelpers";

export class BookingStateOnHoldValidator implements ModelValidator {
  private path: string;
  constructor({ path }: { path: string }) {
    this.path = path;
  }
  public validate = (booking: Booking): ValidatorError[] => {
    return [
      CommonValidator.validateUTCDateTime(
        `${this.path}.utcCreatedAt`,
        booking?.utcCreatedAt
      ),
      CommonValidator.validateUTCDateTime(
        `${this.path}.utcUpdatedAt`,
        booking?.utcUpdatedAt,
        { nullable: true }
      ),
      CommonValidator.validateUTCDateTime(
        `${this.path}.utcExpiresAt`,
        booking?.utcExpiresAt,
        { nullable: true }
      ),
      NullValidator.validate(
        `${this.path}.utcRedeemedAt`,
        booking?.utcRedeemedAt
      ),
      NullValidator.validate(
        `${this.path}.utcConfirmedAt`,
        booking?.utcConfirmedAt
      ),
      NullValidator.validate(
        `${this.path}.cancellation`,
        booking?.cancellation
      ),
    ].flatMap((v) => (v ? [v] : []));
  };
}
