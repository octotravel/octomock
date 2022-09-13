import { Booking, BookingStatus, CapabilityId } from "@octocloud/types";
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

  private getErrors = (
    booking: any,
    capabilities: CapabilityId[]
  ): ValidatorError[] => {
    return new BookingValidator({ capabilities }).validate(booking);
  };

  private reservationCheck = (
    data: ScenarioHelperData<Booking>
  ): ValidatorError[] => {
    const { result } = data;
    const unitIdCheck =
      result.data.unitItems.length === result.data.unitItems.length
        ? result.data.unitItems
            .map((unitItem) => {
              return result.data.unitItems
                .map((item) => item.unitId)
                .includes(unitItem.unitId);
            })
            .every((status) => status)
        : false;
    const booking = result.data;
    return [
      booking.notes === result.data.notes
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
        // TODO: this is clearly wrong
        oldBooking: result.request.body as Booking,
        configData,
      }),
    ];

    if (!R.isEmpty(checkErrors)) {
      return this.handleResult({
        ...data,
        success: false,
        errors: checkErrors,
      });
    }

    const errors = this.getErrors(result.data, configData.capabilities);
    return this.handleResult({
      ...data,
      success: R.isEmpty(errors),
      errors,
    });
  };
}
