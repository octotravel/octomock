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

    const errors = [];
    if (booking?.cancellation?.reason !== reqBody?.reason) {
      errors.push(new ValidatorError({ message: "Reason was not provided" }));
    }

    if (createdBooking?.status === BookingStatus.ON_HOLD) {
      if (booking?.status !== BookingStatus.EXPIRED) {
        errors.push(
          new ValidatorError({
            message: `Booking status should be EXPIRED. Returned value was ${booking?.status}`,
          })
        );
      }
    }
    if (createdBooking?.status === BookingStatus.CONFIRMED) {
      if (booking?.status !== BookingStatus.CANCELLED) {
        new ValidatorError({
          message: `Booking status should be CANCELLED. Returned value was ${booking?.status}`,
        });
      }
    }
    return errors;
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

    const validatorErrors = new BookingValidator({
      capabilities: configData.capabilities,
    }).validate(result.data);
    const errors = [...checkErrors, ...validatorErrors];
    return this.handleResult({
      ...data,
      success: R.isEmpty(errors),
      errors,
    });
  };
}
