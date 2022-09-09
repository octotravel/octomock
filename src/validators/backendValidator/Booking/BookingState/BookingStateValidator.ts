import { Booking, BookingStatus } from "@octocloud/types";
import {
  ErrorType,
  ModelValidator,
  ValidatorError,
} from "../../ValidatorHelpers";
import { BookingStateCancelledValidator } from "./BookingStateCancelledValidator";
import { BookingStateConfirmedValidator } from "./BookingStateConfirmedValidator";
import { BookingStateExpiredValidator } from "./BookingStateExpiredValidator";
import { BookingStateOnHoldValidator } from "./BookingStateOnHoldValidator";

export class BookingStateValidator implements ModelValidator {
  private onHoldValidator: BookingStateOnHoldValidator;
  private confirmedValidator: BookingStateConfirmedValidator;
  private cancelledValidator: BookingStateCancelledValidator;
  private expiredValidator: BookingStateExpiredValidator;
  private path: string;
  constructor({ path }: { path: string }) {
    this.path = path;
    this.onHoldValidator = new BookingStateOnHoldValidator({ path: this.path });
    this.confirmedValidator = new BookingStateConfirmedValidator({
      path: this.path,
    });
    this.cancelledValidator = new BookingStateCancelledValidator({
      path: this.path,
    });
    this.expiredValidator = new BookingStateExpiredValidator({
      path: this.path,
    });
  }
  public validate = (booking: Booking): ValidatorError[] => {
    switch (booking.status) {
      case BookingStatus.ON_HOLD: {
        return this.onHoldValidator.validate(booking);
      }
      case BookingStatus.CONFIRMED: {
        return this.confirmedValidator.validate(booking);
      }
      case BookingStatus.CANCELLED: {
        return this.cancelledValidator.validate(booking);
      }
      case BookingStatus.EXPIRED: {
        return this.expiredValidator.validate(booking);
      }
      default:
        return [
          new ValidatorError({
            type: ErrorType.WARNING,
            message: `validation for booking.status: ${booking.status} not implemented`,
          }),
        ];
    }
  };
}
