import { Booking, ConfirmBookingBodySchema } from "@octocloud/types";
import { BookingEndpointValidator } from "../../../validators/backendValidator/Booking/BookingEndpointValidator";
import { BookingValidator } from "../../../validators/backendValidator/Booking/BookingValidator";
import {
  ScenarioConfigData,
  ScenarioHelper,
  ScenarioHelperData,
} from "./ScenarioHelper";

export class BookingConfirmationScenarioHelper extends ScenarioHelper {
  private bookingEndpointValidator = new BookingEndpointValidator();

  public validateBookingConfirmation = (
    data: ScenarioHelperData<Booking>,
    configData: ScenarioConfigData,
    reservation: Booking
  ) => {
    const { result } = data;
    const booking = result?.data;
    const request = result?.request;
    const response = result?.response;
    if (response?.error) {
      return this.handleResult({
        ...data,
        success: false,
        errors: [],
      });
    }

    const errors = [
      ...this.bookingEndpointValidator.validateConfirmation({
        booking,
        reservation,
        schema: request?.body as ConfirmBookingBodySchema,
      }),
      ...this.bookingEndpointValidator.validate({
        booking: result.data,
        productId: reservation?.productId,
        optionId: reservation?.optionId,
        availabilityId: reservation?.availabilityId,
      }),
      ...new BookingValidator({
        capabilities: configData.capabilities,
      }).validate(booking),
    ];

    if (!this.isSuccess(errors)) {
      this.config.terminateValidation = true;
    }
    return this.handleResult({
      ...data,
      errors,
    });
  };
}
