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

export class BookingReservationScenarioHelper {
  private scenarioHelper = new ScenarioHelper();
  private bookingScenarioHelper = new BookingScenarioHelper();

  private getErrors = (
    booking: any,
    capabilities: CapabilityId[]
  ): ValidatorError[] => {
    return new BookingValidator({ capabilities }).validate(booking);
  };

  private reservationCheck = (
    data: ScenarioHelperData<Booking>
  ): ValidatorError[] => {
    const unitIdCheck =
      data.response.data.body.unitItems.length ===
      data.request.body.unitItems.length
        ? data.response.data.body.unitItems
            .map((unitItem) => {
              return data.request.body.unitItems
                .map((item) => item.unitId)
                .includes(unitItem.unitId);
            })
            .every((status) => status)
        : false;
    const booking = data.response.data.body;
    return [
      booking.notes === data.request.body.notes
        ? null
        : new ValidatorError({ message: "Notes are not matching request" }),
      booking.status === BookingStatus.ON_HOLD
        ? null
        : new ValidatorError({
            message: `Booking status should be ON_HOLD. Returned value was ${booking.status}`,
          }),
      unitIdCheck
        ? null
        : new ValidatorError({ message: "UnitIds are not matching" }),
    ].filter(Boolean);
  };

  public validateBookingReservation = (
    data: ScenarioHelperData<Booking>,
    configData: ScenarioConfigData
  ) => {
    if (data.response.error) {
      return this.scenarioHelper.handleResult({
        ...data,
        success: false,
        errors: [],
      });
    }

    const checkErrors = [
      ...this.reservationCheck(data),
      ...this.bookingScenarioHelper.bookingCheck({
        newBooking: data.response.data.body,
        oldBooking: data.request.body,
        configData,
      }),
    ];

    if (!R.isEmpty(checkErrors)) {
      return this.scenarioHelper.handleResult({
        ...data,
        success: false,
        errors: checkErrors,
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
        errors: [
          new ValidatorError({
            message: error,
          }),
        ],
      });
    }

    const errors = validator.validate(data.response.error);
    return this.scenarioHelper.handleResult({
      ...data,
      success: R.isEmpty(errors),
      errors,
    });
  };
}
