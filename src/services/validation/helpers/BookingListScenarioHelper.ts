import { Booking } from "@octocloud/types";
import * as R from "ramda";
import { BookingEndpointValidator } from "../../../validators/backendValidator/Booking/BookingEndpointValidator";
import { BookingValidator } from "../../../validators/backendValidator/Booking/BookingValidator";
import { ScenarioHelper, ScenarioHelperData } from "./ScenarioHelper";

export class BookingListScenarioHelper extends ScenarioHelper {
  private bookingEndpointValidator = new BookingEndpointValidator();

  public validateBookingList = (data: ScenarioHelperData<Booking[]>) => {
    const { result } = data;
    const bookings = R.is(Array, result.data) ? result.data : [];
    const request = result?.request;
    const response = result?.response;
    const schema = request?.body;
    if (response?.error) {
      return this.handleResult({
        ...data,
        success: false,
        errors: [],
      });
    }
    const errors = [
      ...this.bookingEndpointValidator.validateGetBookings({
        bookings,
        schema,
      }),
      ...bookings
        .map(
          new BookingValidator({
            capabilities: this.config.getCapabilityIDs(),
          }).validate
        )
        .flat(),
    ];
    return this.handleResult({
      ...data,
      errors,
    });
  };
}
