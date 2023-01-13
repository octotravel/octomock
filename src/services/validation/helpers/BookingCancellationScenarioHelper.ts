import { Booking, CancelBookingBodySchema } from "@octocloud/types";
import { BookingEndpointValidator } from "../../../validators/backendValidator/Booking/BookingEndpointValidator";
import { BookingValidator } from "../../../validators/backendValidator/Booking/BookingValidator";
import { ScenarioHelper, ScenarioHelperData } from "./ScenarioHelper";

export class BookingCancellationScenarioHelper extends ScenarioHelper {
  private bookingEndpointValidator = new BookingEndpointValidator();

  public validateBookingCancellation = (data: ScenarioHelperData<Booking>, booking: Booking) => {
    const { result } = data;
    const bookingCancelled = result?.data;
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
      ...this.bookingEndpointValidator.validateCancel({
        booking,
        bookingCancelled,
        schema: request?.body as CancelBookingBodySchema,
      }),
      ...this.bookingEndpointValidator.validate({
        booking: result.data,
        productId: booking?.productId,
        optionId: booking?.optionId,
        availabilityId: booking?.availabilityId,
      }),
      ...new BookingValidator({
        capabilities: this.config.getCapabilityIDs(),
      }).validate(booking),
    ];

    return this.handleResult({
      ...data,
      errors,
    });
  };
}
