import { Booking, BookingStatus, CapabilityId } from "@octocloud/types";
import * as R from "ramda";
import { BookingValidator } from "../../../validators/backendValidator/Booking/BookingValidator";
import {
  ModelValidator,
  ValidatorError,
} from "../../../validators/backendValidator/ValidatorHelpers";
import { BookingScenarioHelper } from "./BookingScenarioHelper";
import {
  ScenarioConfigData,
  ScenarioHelper,
  ScenarioHelperData,
} from "./ScenarioHelper";

export class BookingCancellationScenarioHelper {
  private scenarioHelper = new ScenarioHelper();
  private bookingScenarioHelper = new BookingScenarioHelper();

  private getErrors = (
    booking: any,
    capabilities: CapabilityId[]
  ): ValidatorError[] => {
    return new BookingValidator({ capabilities }).validate(booking);
  };

  private cancellationCheck = (
    data: ScenarioHelperData<Booking>,
    createdBooking: Booking
  ): string[] => {
    const booking = data.response.data.body;
    const reqBody = data.request.body as any;
    let errors = [
      booking.cancellation.reason === reqBody.reason
        ? null
        : "Reason was not provided",
    ];
    if (createdBooking.status === BookingStatus.ON_HOLD) {
      errors = [
        ...errors,
        booking.status === BookingStatus.EXPIRED
          ? null
          : `Booking status should be EXPIRED. Returned value was ${booking.status}`,
      ];
    }
    if (createdBooking.status === BookingStatus.CONFIRMED) {
      errors = [
        ...errors,
        booking.status === BookingStatus.CANCELLED
          ? null
          : `Booking status should be CANCELLED. Returned value was ${booking.status}`,
      ];
    }
    return errors.filter(Boolean);
  };

  public validateBookingCancellation = (
    data: ScenarioHelperData<Booking>,
    configData: ScenarioConfigData,
    createdBooking: Booking
  ) => {
    if (data.response.error) {
      return this.scenarioHelper.handleResult({
        ...data,
        success: false,
        errors: [],
      });
    }

    const checkErrors = [
      ...this.cancellationCheck(data, createdBooking),
      ...this.bookingScenarioHelper.bookingCheck({
        newBooking: data.response.data.body,
        oldBooking: createdBooking,
        configData,
      }),
    ];

    if (!R.isEmpty(checkErrors)) {
      return this.scenarioHelper.handleResult({
        ...data,
        success: false,
        errors: checkErrors.map((error) => {
          return {
            message: error,
          };
        }),
      });
    }

    const errors = this.getErrors(
      data.response.data.body,
      configData.capabilities
    );
    return this.scenarioHelper.handleResult({
      ...data,
      success: R.isEmpty(errors),
      errors,
    });
  };

  public validateBookingCancellationError = (
    data: ScenarioHelperData<Booking>,
    error: string,
    validator: ModelValidator
  ) => {
    if (data.response.data) {
      return this.scenarioHelper.handleResult({
        ...data,
        success: false,
        errors: [error],
      });
    }

    const errors = validator.validate(data.response.error);
    return this.scenarioHelper.handleResult({
      ...data,
      success: R.isEmpty(errors),
      errors: errors.map((error) => error.message),
    });
  };
}
