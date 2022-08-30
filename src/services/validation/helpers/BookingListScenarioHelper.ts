import { Booking, CapabilityId } from "@octocloud/types";
import * as R from "ramda";
import { BookingValidator } from "../../../validators/backendValidator/Booking/BookingValidator";
import { ModelValidator } from "../../../validators/backendValidator/ValidatorHelpers";
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
  ): string[] => {
    let errors = [];

    if (R.isEmpty(bookings)) {
      return ["No booking found"];
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
          : "Some supplierReferences do not match request",
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
          : "Some resellerReferences do not match request",
      ];
    }

    return errors.filter(Boolean);
  };

  public validateBookingList = (
    data: ScenarioHelperData<Booking[]>,
    configData: ScenarioConfigData
  ) => {
    if (data.response.error) {
      return this.scenarioHelper.handleResult({
        ...data,
        success: false,
        errors: [],
      });
    }
    const checkErrors = [
      ...this.listCheck(data.response.data.body, configData),
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

  public validateBookingListError = (
    data: ScenarioHelperData<Booking[]>,
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
