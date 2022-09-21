import { Booking } from "@octocloud/types";
import { CommonValidator } from "../../CommonValidator";
import {
  ModelValidator,
  NullValidator,
  ValidatorError,
} from "../../ValidatorHelpers";

export class BookingStateConfirmedValidator implements ModelValidator {
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
        booking?.utcUpdatedAt
      ),
      NullValidator.validate(
        `${this.path}.utcExpiresAt`,
        booking?.utcExpiresAt
      ),
      NullValidator.validate(
        `${this.path}.utcRedeemedAt`,
        booking?.utcRedeemedAt
      ),
      CommonValidator.validateUTCDateTime(
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
