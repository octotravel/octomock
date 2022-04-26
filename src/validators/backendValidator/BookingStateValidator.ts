import { Booking, BookingStatus } from '@octocloud/types';
import {
  ArrayValidator,
  NullValidator,
  RegExpValidator,
  StringValidator,
} from "./ValidatorHelpers";

export class BookingStateValidator {
  private path: string;
  constructor() {
    this.path = `booking`;
  }
  public validate = (booking: Booking): void => {
    switch (booking.status) {
      case BookingStatus.ON_HOLD: {
        this.validateOnHold(booking);
        break;
      }
      case BookingStatus.CONFIRMED: {
        this.validateConfirmed(booking);
        break;
      }
      case BookingStatus.CANCELLED: {
        this.validateCancelled(booking);
        break;
      }
    }
  };

  private validateOnHold = (booking: Booking): void => {
    this.validateUTCDate({
      label: `${this.path}.utcCreatedAt`,
      utcDate: booking.utcCreatedAt,
    });
    this.validateUTCDate({
      label: `${this.path}.utcUpdatedAt`,
      utcDate: booking.utcUpdatedAt,
    });
    this.validateUTCDate({
      label: `${this.path}.utcExpiresAt`,
      utcDate: booking.utcExpiresAt,
    });
    NullValidator.validate(`${this.path}.utcRedeemedAt`, booking.utcRedeemedAt);
    NullValidator.validate(
      `${this.path}.utcConfirmedAt`,
      booking.utcConfirmedAt
    );
    NullValidator.validate(`${this.path}.cancellation`, booking.cancellation);
  };

  private validateConfirmed = (booking: Booking): void => {
    this.validateUTCDate({
      label: `${this.path}.utcCreatedAt`,
      utcDate: booking.utcCreatedAt,
    });
    this.validateUTCDate({
      label: `${this.path}.utcUpdatedAt`,
      utcDate: booking.utcUpdatedAt,
    });
    NullValidator.validate(`${this.path}.utcExpiresAt`, booking.utcExpiresAt);
    NullValidator.validate(`${this.path}.utcRedeemedAt`, booking.utcRedeemedAt);
    this.validateUTCDate({
      label: `${this.path}.utcConfirmedAt`,
      utcDate: booking.utcConfirmedAt,
    });
    NullValidator.validate(`${this.path}.cancellation`, booking.cancellation);
  };

  private validateCancelled = (booking: Booking): void => {
    this.validateUTCDate({
      label: `${this.path}.utcCreatedAt`,
      utcDate: booking.utcCreatedAt,
    });
    this.validateUTCDate({
      label: `${this.path}.utcUpdatedAt`,
      utcDate: booking.utcUpdatedAt,
    });
    this.validateUTCDate({
      label: `${this.path}.utcExpiresAt`,
      utcDate: booking.utcExpiresAt,
    });
    NullValidator.validate(`${this.path}.utcRedeemedAt`, booking.utcRedeemedAt);
    NullValidator.validate(
      `${this.path}.utcConfirmedAt`,
      booking.utcConfirmedAt
    );
    this.validateCancellation(booking);
    NullValidator.validate(`${this.path}.voucher`, booking.voucher);
    ArrayValidator.validate(`${this.path}.unitItems`, booking.unitItems, {
      empty: true,
    });
  };

  private validateCancellation = (booking: Booking): void => {
    StringValidator.validate(
      `${this.path}.cancellation.refund`,
      booking.cancellation.refund
    );
    StringValidator.validate(
      `${this.path}.cancellation.reason`,
      booking.cancellation.reason,
      { nullable: true }
    );
    this.validateUTCDate({
      label: `${this.path}.cancellation.utcCancelledAt`,
      utcDate: booking.cancellation.utcCancelledAt,
    });
  };

  private validateUTCDate = ({
    label,
    utcDate,
    nullable,
    isNull,
  }: {
    label: string;
    utcDate: string;
    nullable?: boolean;
    isNull?: boolean;
  }): void => {
    const regExp = new RegExp(
      /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])Z$/
    );
    RegExpValidator.validate(label, utcDate, regExp, { nullable, isNull });
  };
}
