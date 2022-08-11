import { CapabilityId } from "@octocloud/types";
import R from "ramda";
import { BookingValidator } from "../../../validators/backendValidator/Booking/BookingValidator";
import { ScenarioHelper } from "./ScenarioHelper";

export interface BookingReservationScenarioData {
  name: string;
  request: any;
  response: any;
}

export class BookingReservationScenarioHelper {
  private scenarioHelper = new ScenarioHelper();

  private getErrors = (booking: any, capabilities: CapabilityId[]) => {
    return new BookingValidator({ capabilities }).validate(booking);
  };

  public validateBookingReservation = (
    data: BookingReservationScenarioData,
    capabilities: CapabilityId[]
  ) => {
    if (data.response.error) {
      return this.scenarioHelper.handleResult({
        ...data,
        success: false,
        errors: [],
      });
    }

    const errors = this.getErrors(data.response.data.body, capabilities);
    return this.scenarioHelper.handleResult({
      ...data,
      success: R.isEmpty(errors),
      errors,
    });
  };

  // public validateAvailabilityError = (
  //   data: AvailabilityScenarioData,
  //   error: string,
  //   validator: ModelValidator
  // ) => {
  //   if (data.response.data) {
  //     return this.scenarioHelper.handleResult({
  //       ...data,
  //       success: false,
  //       errors: [error],
  //     });
  //   }

  //   const errors = validator.validate(data.response.error);
  //   return this.scenarioHelper.handleResult({
  //     ...data,
  //     success: R.isEmpty(errors),
  //     errors: errors.map((error) => error.message),
  //   });
  // };
}
