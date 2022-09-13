import { Booking, CapabilityId, DeliveryMethod } from "@octocloud/types";
import * as R from "ramda";
import { BookingValidator } from "../../../validators/backendValidator/Booking/BookingValidator";
import { ValidatorError } from "../../../validators/backendValidator/ValidatorHelpers";
import { BookingScenarioHelper } from "./BookingScenarioHelper";
import {
  ScenarioConfigData,
  ScenarioHelper,
  ScenarioHelperData,
} from "./ScenarioHelper";

export class BookingUpdateScenarioHelper extends ScenarioHelper {
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
  ): ValidatorError[] => {
    const { result } = data;
    const booking = result.data;
    const reqBody = result.request.body;
    let errors = [];

    if (!reqBody.unitItems) {
      errors = [
        ...errors,
        booking.unitItems.length === oldBooking.unitItems.length
          ? null
          : new ValidatorError({ message: "UnitItems count is not matching" }),
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
      errors = [
        ...errors,
        unitIdCheck
          ? null
          : new ValidatorError({ message: "UnitIds are not matching" }),
      ];
    }

    if (reqBody.availabilityId) {
      errors = [
        ...errors,
        booking.availabilityId === reqBody.availabilityId
          ? null
          : new ValidatorError({ message: "AvailabilityId was not updated" }),
        booking.availability.id === reqBody.availabilityId
          ? null
          : new ValidatorError({ message: "Availability was not updated" }),
      ];
    } else {
      errors = [
        ...errors,
        booking.availabilityId === oldBooking.availabilityId
          ? null
          : new ValidatorError({
              message: "AvailabilityId is not matching request",
            }),
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
      errors = [
        ...errors,
        contactCheck
          ? null
          : new ValidatorError({ message: "Contact was not updated" }),
      ];
    }

    if (reqBody.notes) {
      errors = [
        ...errors,
        reqBody.notes === booking.notes
          ? null
          : new ValidatorError({ message: "Notes was not updated" }),
      ];
    }
    return errors.filter(Boolean);
  };

  public validateBookingUpdate = (
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
      ...this.updateCheck(data, createdBooking, configData.deliveryMethods),
      ...this.bookingScenarioHelper.bookingCheck({
        newBooking: result.data,
        oldBooking: createdBooking,
        configData,
        rebooked: result.request.body.productId !== undefined,
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
