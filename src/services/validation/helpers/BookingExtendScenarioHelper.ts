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

export class BookingExtendScenarioHelper {
  private scenarioHelper = new ScenarioHelper();
  private bookingScenarioHelper = new BookingScenarioHelper();

  private getErrors = (
    booking: any,
    capabilities: CapabilityId[]
  ): ValidatorError[] => {
    return new BookingValidator({ capabilities }).validate(booking);
  };

  private extendCheck = (
    createdBooking: Booking,
    extendedBooking: Booking
  ): string[] => {
    return [
      extendedBooking.status === BookingStatus.ON_HOLD
        ? null
        : "Booking status is not ON_HOLD",
      createdBooking.utcExpiresAt < extendedBooking.utcExpiresAt
        ? null
        : "Booking expire time was not extended",
    ].filter(Boolean);
  };

  public validateBookingExtend = (
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
      ...this.extendCheck(createdBooking, data.response.data.body),
      ...this.bookingScenarioHelper.bookingCheck({
        newBooking: createdBooking,
        oldBooking: data.response.data.body,
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

  public validateBookingReservationError = (
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
