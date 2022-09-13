import { Booking, CapabilityId } from "@octocloud/types";
import * as R from "ramda";
import { BookingValidator } from "../../../validators/backendValidator/Booking/BookingValidator";
import {
  ModelValidator,
  ValidatorError,
} from "../../../validators/backendValidator/ValidatorHelpers";
import {
  ScenarioConfigData,
  ScenarioHelper,
  ScenarioHelperData,
} from "./ScenarioHelper";

export class BookingListScenarioHelper {
  private scenarioHelper = new ScenarioHelper();

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
      return this.scenarioHelper.handleResult({
        ...data,
        success: false,
        errors: [],
      });
    }
    const checkErrors = [...this.listCheck(result.data, configData)];
    if (!R.isEmpty(checkErrors)) {
      return this.scenarioHelper.handleResult({
        ...data,
        success: false,
        errors: checkErrors,
      });
    }
    const errors = this.getErrors(result.data, configData.capabilities);
    return this.scenarioHelper.handleResult({
      ...data,
      success: R.isEmpty(errors),
      errors,
    });
  };

  public validateBookingListError = (
    data: ScenarioHelperData<Booking[]>,
    error: string,
    validator: ModelValidator
  ) => {
    const { result } = data;
    if (result.data) {
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

    const errors = validator.validate(result.response.error);
    return this.scenarioHelper.handleResult({
      ...data,
      success: R.isEmpty(errors),
      errors,
    });
  };
}
