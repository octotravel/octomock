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

export class BookingCancellationScenarioHelper extends ScenarioHelper {
  private bookingScenarioHelper = new BookingScenarioHelper();

  private cancellationCheck = (
    data: ScenarioHelperData<Booking>,
    createdBooking: Booking
  ): ValidatorError[] => {
    const { result } = data;
    const booking = result.data;
    const reqBody = result.request.body;
    let errors = [
      booking.cancellation.reason === reqBody.reason
        ? null
        : new ValidatorError({ message: "Reason was not provided" }),
    ];
    if (createdBooking.status === BookingStatus.ON_HOLD) {
      errors = [
        ...errors,
        booking.status === BookingStatus.EXPIRED
          ? null
          : new ValidatorError({
              message: `Booking status should be EXPIRED. Returned value was ${booking.status}`,
            }),
      ];
    }
    if (createdBooking.status === BookingStatus.CONFIRMED) {
      errors = [
        ...errors,
        booking.status === BookingStatus.CANCELLED
          ? null
          : new ValidatorError({
              message: `Booking status should be CANCELLED. Returned value was ${booking.status}`,
            }),
      ];
    }
    return errors.filter(Boolean);
  };

  public validateBookingCancellation = (
    data: ScenarioHelperData<Booking>,
    configData: ScenarioConfigData,
    createdBooking: Booking
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
      ...this.cancellationCheck(data, createdBooking),
      ...this.bookingScenarioHelper.bookingCheck({
        newBooking: result.data,
        oldBooking: createdBooking,
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
}
