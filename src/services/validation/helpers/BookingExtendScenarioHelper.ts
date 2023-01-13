import { Booking, ExtendBookingBodySchema } from "@octocloud/types";
import { BookingEndpointValidator } from "../../../validators/backendValidator/Booking/BookingEndpointValidator";
import { BookingValidator } from "../../../validators/backendValidator/Booking/BookingValidator";
import { ScenarioConfigData, ScenarioHelper, ScenarioHelperData } from "./ScenarioHelper";

export class BookingExtendScenarioHelper extends ScenarioHelper {
  private bookingEndpointValidator = new BookingEndpointValidator();

  public validateBookingExtend = (
    data: ScenarioHelperData<Booking>,
    configData: ScenarioConfigData,
    reservation: Booking
  ) => {
    const { result } = data;
    const request = result?.request;
    const response = result?.response;
    const reservationExtended = result?.data;
    if (response?.error) {
      return this.handleResult({
        ...data,
        success: false,
        errors: [],
      });
    }

    const errors = [
      ...this.bookingEndpointValidator.validateReservationExtend({
        reservation,
        reservationExtended,
        schema: request?.body as ExtendBookingBodySchema,
      }),
      ...this.bookingEndpointValidator.validate({
        booking: reservationExtended,
        productId: reservationExtended?.productId,
        optionId: reservationExtended?.optionId,
        availabilityId: reservationExtended?.availabilityId,
      }),
      ...new BookingValidator({
        capabilities: configData.capabilities,
      }).validate(result.data),
    ];

    return this.handleResult({
      ...data,
      errors,
    });
  };
}
