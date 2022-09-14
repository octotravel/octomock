import { ErrorType } from "./../../../validators/backendValidator/ValidatorHelpers";
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

export class BookingReservationScenarioHelper extends ScenarioHelper {
  private bookingScenarioHelper = new BookingScenarioHelper();

  public validateBookingReservation = (
    data: ScenarioHelperData<Booking>,
    configData: ScenarioConfigData
  ) => {
    const { result } = data;
    if (result.response.error) {
      return this.handleResult({
        ...data,
        success: false,
        errors: [],
      });
    }

    const checkErrors = [
      ...this.reservationCheck(data),
      ...this.bookingScenarioHelper.bookingCheck({
        newBooking: result.data,
        // TODO: this is clearly wrong redo it
        oldBooking: result.request.body as Booking,
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

  private reservationCheck = (
    data: ScenarioHelperData<Booking>
  ): ValidatorError[] => {
    const { result } = data;
    const booking = result.data;
    const request = result.request;

    // TODO: this should be checked in general check, not in reservation one
    const unitIdCheck =
      booking.unitItems.length === request.body.unitItems.length
        ? result.data.unitItems
            .map((unitItem) => {
              return booking.unitItems
                .map((item) => item.unitId)
                .includes(unitItem.unitId);
            })
            .every((status) => status)
        : false;

    const errors = new Array<ValidatorError>();

    if (booking.notes !== request.body.notes) {
      errors.push(
        new ValidatorError({ message: "Notes are not matching request" })
      );
    }
    if (booking.status !== BookingStatus.ON_HOLD) {
      errors.push(
        new ValidatorError({
          message: `Booking status should be ON_HOLD. Returned value was ${booking.status}`,
          type: ErrorType.CRITICAL,
        })
      );
    }
    if (!unitIdCheck) {
      errors.push(
        new ValidatorError({
          message: "UnitIds are not matching",
          type: ErrorType.CRITICAL,
        })
      );
    }
    return errors;
  };
}
