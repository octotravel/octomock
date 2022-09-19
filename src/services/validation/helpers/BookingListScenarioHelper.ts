import { Booking, CapabilityId } from "@octocloud/types";
import * as R from "ramda";
import { BookingValidator } from "../../../validators/backendValidator/Booking/BookingValidator";
import {
  ErrorType,
  ValidatorError,
} from "../../../validators/backendValidator/ValidatorHelpers";
import {
  ScenarioConfigData,
  ScenarioHelper,
  ScenarioHelperData,
} from "./ScenarioHelper";

export class BookingListScenarioHelper extends ScenarioHelper {
  private getErrors = (bookings: Booking[], capabilities: CapabilityId[]) => {
    return bookings.reduce((acc, result) => {
      return [
        ...acc,
        ...new BookingValidator({
          capabilities,
        }).validate(result),
      ];
    }, []);
  };

  private listCheck = (
    bookings: Booking[],
    configData: ScenarioConfigData
  ): ValidatorError[] => {
    let errors = [];

    if (R.isEmpty(bookings)) {
      return [
        new ValidatorError({
          type: ErrorType.CRITICAL,
          message: "No booking found",
        }),
      ];
    }

    if (configData.supplierReference) {
      const supplierReferenceCheck = bookings
        .map((booking) => {
          return booking.supplierReference === configData.supplierReference;
        })
        .every((status) => status);
      errors = [
        ...errors,
        supplierReferenceCheck
          ? null
          : new ValidatorError({
              message: "Some supplierReferences do not match request",
            }),
      ];
    }

    if (configData.resellerReference) {
      const resellerReferenceCheck = bookings
        .map((booking) => {
          return booking.resellerReference === configData.resellerReference;
        })
        .every((status) => status);
      errors = [
        ...errors,
        resellerReferenceCheck
          ? null
          : new ValidatorError({
              message: "Some resellerReferences do not match request",
            }),
      ];
    }

    return errors.filter(Boolean);
  };

  public validateBookingList = (
    data: ScenarioHelperData<Booking[]>,
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

    const bookings = R.is(Array, result.data) ? result.data : [];

    const checkErrors = [...this.listCheck(bookings, configData)];
    const validatorErrors = this.getErrors(bookings, configData.capabilities);
    const errors = [...checkErrors, ...validatorErrors];
    return this.handleResult({
      ...data,
      success: R.isEmpty(errors),
      errors,
    });
  };
}
