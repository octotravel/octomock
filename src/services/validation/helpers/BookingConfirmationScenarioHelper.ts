import {
  Booking,
  BookingStatus,
  CapabilityId,
  DeliveryMethod,
} from "@octocloud/types";
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

export class BookingConfirmationScenarioHelper {
  private scenarioHelper = new ScenarioHelper();
  private bookingScenarioHelper = new BookingScenarioHelper();

  private getErrors = (
    booking: any,
    capabilities: CapabilityId[]
  ): ValidatorError[] => {
    return new BookingValidator({ capabilities }).validate(booking);
  };

  private confirmationCheck = (
    data: ScenarioHelperData<Booking>,
    oldBooking: Booking,
    deliveryMethods: DeliveryMethod[]
  ): ValidatorError[] => {
    const booking = data.response.data.body;
    const reqBody = data.request.body;
    const checkContact =
      booking.contact.firstName === reqBody.contact.firstName &&
      booking.contact.fullName === reqBody.contact.fullName &&
      booking.contact.lastName === reqBody.contact.lastName &&
      booking.contact.emailAddress === reqBody.contact.emailAddress &&
      booking.contact.notes === reqBody.contact.notes;

    let errors = [
      checkContact
        ? null
        : new ValidatorError({ message: "Contact was not updated" }),
      booking.status === BookingStatus.CONFIRMED
        ? null
        : new ValidatorError({
            message: `Booking status should be CONFIRMED. Returned value was ${booking.status}`,
          }),
      booking.resellerReference === reqBody.resellerReference
        ? null
        : new ValidatorError({ message: "Reseller reference was not updated" }),
    ];

    if (!data.request.body.unitItems) {
      errors = [
        ...errors,
        booking.unitItems.length === oldBooking.unitItems.length
          ? null
          : new ValidatorError({ message: "UnitItems count is not matching" }),
      ];
    }

    if (deliveryMethods.includes(DeliveryMethod.VOUCHER)) {
      errors = [
        ...errors,
        !R.isEmpty(booking.voucher.deliveryOptions)
          ? null
          : new ValidatorError({ message: "Voucher is missing" }),
      ];
    }
    if (deliveryMethods.includes(DeliveryMethod.TICKET)) {
      const tickets = booking.unitItems.reduce((acc, unit) => {
        return [...acc, ...unit.ticket.deliveryOptions];
      }, []);
      errors = [
        ...errors,
        !R.isEmpty(tickets)
          ? null
          : new ValidatorError({ message: "Tickets are missing" }),
      ];
    }
    return errors.filter(Boolean);
  };

  public validateBookingConfirmation = (
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
      ...this.confirmationCheck(
        data,
        createdBooking,
        configData.deliveryMethods
      ),
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

  public validateBookingConfirmationError = (
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
