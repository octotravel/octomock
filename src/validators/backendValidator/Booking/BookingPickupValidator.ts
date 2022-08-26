import { Booking } from "@octocloud/types";
import {
  StringValidator,
  ModelValidator,
  ValidatorError,
  BooleanValidator,
  NumberValidator,
} from "../ValidatorHelpers";

export class BookingPickupValidator implements ModelValidator {
  private path: string;
  constructor({ path }: { path: string }) {
    this.path = path;
  }

  public validate = (booking: Booking): ValidatorError[] => {
    return [
      BooleanValidator.validate(
        `${this.path}.pickupRequested`,
        booking.pickupRequested
      ),
      StringValidator.validate(
        `${this.path}.pickupPointId`,
        booking.pickupPointId,
        { nullable: true }
      ),
      StringValidator.validate(
        `${this.path}.pickupHotel`,
        booking.pickupHotel,
        { nullable: true }
      ),
      StringValidator.validate(
        `${this.path}.pickupHotelRoom`,
        booking.pickupHotelRoom,
        { nullable: true }
      ),
      ...this.validatePickupPoint(booking),
    ].filter(Boolean);
  };

  private validatePickupPoint = (booking: Booking): ValidatorError[] => {
    if (booking.pickupPoint) {
      return [
        StringValidator.validate(
          `${this.path}.booking.pickupPoint.id`,
          booking.pickupPoint.id
        ),
        StringValidator.validate(
          `${this.path}.booking.pickupPoint.name`,
          booking.pickupPoint.name
        ),
        StringValidator.validate(
          `${this.path}.booking.pickupPoint.directions`,
          booking.pickupPoint.direction
        ),
        NumberValidator.validate(
          `${this.path}.booking.pickupPoint.latitude`,
          booking.pickupPoint.latitude
        ),
        NumberValidator.validate(
          `${this.path}.booking.pickupPoint.longitude`,
          booking.pickupPoint.longitude
        ),
        // CommonValidator.validateLocalDateTime(
        //   `${this.path}.booking.pickupPoint.localDateTime`,
        //   booking.pickupPoint.localDateTime
        // ),
        StringValidator.validate(
          `${this.path}.booking.pickupPoint.googlePlaceId`,
          booking.pickupPoint.googlePlaceId
        ),
        StringValidator.validate(
          `${this.path}.booking.pickupPoint.street`,
          booking.pickupPoint.street
        ),
        StringValidator.validate(
          `${this.path}.booking.pickupPoint.postalCode`,
          booking.pickupPoint.postalCode
        ),
        StringValidator.validate(
          `${this.path}.booking.pickupPoint.locality`,
          booking.pickupPoint.locality
        ),
        StringValidator.validate(
          `${this.path}.booking.pickupPoint.region`,
          booking.pickupPoint.region
        ),
        StringValidator.validate(
          `${this.path}.booking.pickupPoint.state`,
          booking.pickupPoint.state
        ),
        StringValidator.validate(
          `${this.path}.booking.pickupPoint.country`,
          booking.pickupPoint.country
        ),
      ].filter(Boolean);
    }
    return [];
  };
}
