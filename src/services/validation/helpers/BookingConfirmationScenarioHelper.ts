import { Booking, BookingStatus, CapabilityId } from "@octocloud/types";
import { BookingValidator } from "../../../validators/backendValidator/Booking/BookingValidator";
import { ValidatorError } from "../../../validators/backendValidator/ValidatorHelpers";
import { BookingScenarioHelper } from "./BookingScenarioHelper";
import {
  ScenarioConfigData,
  ScenarioHelper,
  ScenarioHelperData,
} from "./ScenarioHelper";

export class BookingConfirmationScenarioHelper extends ScenarioHelper {
  private bookingScenarioHelper = new BookingScenarioHelper();

  private getErrors = (
    booking: any,
    capabilities: CapabilityId[]
  ): ValidatorError[] => {
    return new BookingValidator({ capabilities }).validate(booking);
  };

  private confirmationCheck = (
    data: ScenarioHelperData<Booking>,
    oldBooking: Booking
  ): ValidatorError[] => {
    const { result } = data;
    const booking = result.data;
    const reqBody = result.request.body;
    const isContactUpdated =
      booking?.contact?.firstName === reqBody?.contact?.firstName &&
      booking?.contact?.fullName === reqBody?.contact?.fullName &&
      booking?.contact?.lastName === reqBody?.contact?.lastName &&
      booking?.contact?.emailAddress === reqBody?.contact?.emailAddress &&
      booking?.contact?.notes === reqBody?.contact?.notes;

    const errors = [];
    if (!isContactUpdated) {
      errors.push(new ValidatorError({ message: "Contact was not updated" }));
    }
    if (booking.status !== BookingStatus.CONFIRMED) {
      errors.push(
        new ValidatorError({
          message: `Booking status should be CONFIRMED. Returned value was ${booking.status}`,
        })
      );
    }
    if (booking?.resellerReference !== reqBody?.resellerReference) {
      errors.push(
        new ValidatorError({ message: "Reseller reference was not updated" })
      );
    }

    if (!result?.data?.unitItems) {
      if (booking?.unitItems?.length !== oldBooking?.unitItems?.length) {
        errors.push(
          new ValidatorError({ message: "UnitItems count is not matching" })
        );
      }
    }
    return errors;
  };

  public validateBookingConfirmation = (
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
      ...this.confirmationCheck(data, createdBooking),
      ...this.bookingScenarioHelper.bookingCheck({
        newBooking: result.data,
        oldBooking: createdBooking,
        configData,
      }),
    ];

    const validatorErrors = this.getErrors(
      result.data,
      configData.capabilities
    );
    const errors = [...checkErrors, ...validatorErrors];
    return this.handleResult({
      ...data,
      errors,
    });
  };
}
