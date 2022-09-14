import { Booking, BookingStatus } from "@octocloud/types";
import * as R from "ramda";
import { BookingValidator } from "../../../validators/backendValidator/Booking/BookingValidator";
import { ValidatorError } from "../../../validators/backendValidator/ValidatorHelpers";
import { BookingScenarioHelper } from "./BookingScenarioHelper";
import {
  ScenarioConfigData,
  ScenarioHelper,
  ScenarioHelperData,
} from "./ScenarioHelper";

export class BookingExtendScenarioHelper extends ScenarioHelper {
  private bookingScenarioHelper = new BookingScenarioHelper();

  public validateBookingExtend = (
    data: ScenarioHelperData<Booking>,
    configData: ScenarioConfigData,
    reservation: Booking
  ) => {
    const { result } = data;
    const extendedReservation = result.data;
    if (result.response.error) {
      return this.handleResult({
        ...data,
        success: false,
        errors: [],
      });
    }

    const checkErrors = [
      ...this.extendCheck(reservation, extendedReservation),
      ...this.bookingScenarioHelper.bookingCheck({
        newBooking: reservation,
        oldBooking: extendedReservation,
        configData,
      }),
    ];

    const errors = new BookingValidator({
      capabilities: configData.capabilities,
    }).validate(result.data);
    return this.handleResult({
      ...data,
      success: R.isEmpty([...checkErrors, ...errors]),
      errors,
    });
  };

  private extendCheck = (
    createdBooking: Booking,
    extendedBooking: Booking
  ): ValidatorError[] => {
    const errors = new Array<ValidatorError>();
    if (extendedBooking.status !== BookingStatus.ON_HOLD) {
      errors.push(
        new ValidatorError({ message: "Booking status is not ON_HOLD" })
      );
    }
    if (createdBooking.utcExpiresAt >= extendedBooking.utcExpiresAt) {
      errors.push(
        new ValidatorError({ message: "Booking expire time was not extended" })
      );
    }

    return errors;
  };
}
