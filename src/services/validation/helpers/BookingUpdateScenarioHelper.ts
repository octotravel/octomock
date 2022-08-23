import { Booking, CapabilityId, DeliveryMethod } from "@octocloud/types";
import R from "ramda";
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

export class BookingUpdateScenarioHelper {
  private scenarioHelper = new ScenarioHelper();
  private bookingScenarioHelper = new BookingScenarioHelper();

  private getErrors = (
    booking: any,
    capabilities: CapabilityId[]
  ): ValidatorError[] => {
    return new BookingValidator({ capabilities }).validate(booking);
  };

  private updateCheck = (
    data: ScenarioHelperData<Booking>,
    oldBooking: Booking,
    _deliveryMethods: DeliveryMethod[]
  ): string[] => {
    const booking = data.response.data.body;
    const reqBody = data.request.body;
    let errors = [];

    if (!reqBody.unitItems) {
      errors = [
        ...errors,
        booking.unitItems.length === oldBooking.unitItems.length
          ? null
          : "UnitItems count is not matching",
      ];
    } else {
      const unitIdCheck =
        booking.unitItems.length === reqBody.unitItems.length
          ? booking.unitItems
              .map((unitItem) => {
                return reqBody.unitItems
                  .map((item) => item.unitId)
                  .includes(unitItem.unitId);
              })
              .every((status) => status)
          : false;
      errors = [...errors, unitIdCheck ? null : "UnitIds are not matching"];
    }

    if (reqBody.availabilityId) {
      errors = [
        ...errors,
        booking.availabilityId === reqBody.availabilityId
          ? null
          : "AvailabilityId was not updated",
        booking.availability.id === reqBody.availabilityId
          ? null
          : "Availability was not updated",
      ];
    }

    if (reqBody.contact) {
      const contactCheck = [
        reqBody.contact.fullName
          ? reqBody.contact.fullName === booking.contact.fullName
          : null,
        reqBody.contact.firstName
          ? reqBody.contact.firstName === booking.contact.firstName
          : null,
        reqBody.contact.lastName
          ? reqBody.contact.lastName === booking.contact.lastName
          : null,
        reqBody.contact.emailAddress
          ? reqBody.contact.emailAddress === booking.contact.emailAddress
          : null,
        reqBody.contact.phoneNumber
          ? reqBody.contact.phoneNumber === booking.contact.phoneNumber
          : null,
        reqBody.contact.country
          ? reqBody.contact.country === booking.contact.country
          : null,
        reqBody.contact.notes
          ? reqBody.contact.notes === booking.contact.notes
          : null,
        reqBody.contact.locales
          ? reqBody.contact.locales
              .map((locale) => booking.contact.locales.includes(locale))
              .every((status) => status)
          : null,
      ]
        .filter((field) => field !== null)
        .every((status) => status);
      errors = [...errors, contactCheck ? null : "Contact was not updated"];
    }

    if (reqBody.notes) {
      errors = [
        ...errors,
        reqBody.notes === booking.notes ? null : "Notes was not updated",
      ];
    }
    return errors.filter(Boolean);
  };

  public validateBookingUpdate = (
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
      ...this.updateCheck(data, createdBooking, configData.deliveryMethods),
      ...this.bookingScenarioHelper.bookingCheck({
        newBooking: data.response.data.body,
        oldBooking: createdBooking,
        configData,
        rebooked: data.request.body.productId !== undefined,
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

  public validateBookingConfirmationError = (
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
