import * as R from "ramda";
import { Booking } from "@octocloud/types";
import { BookingValidator } from "../../../validators/backendValidator/Booking/BookingValidator";
import {
  ScenarioConfigData,
  ScenarioHelper,
  ScenarioHelperData,
} from "./ScenarioHelper";

export class BookingGetScenarioHelper extends ScenarioHelper {
  public validateBookingGet = (
    data: ScenarioHelperData<Booking>,
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

    const errors = new BookingValidator({
      capabilities: configData.capabilities,
    }).validate(result.data);
    return this.handleResult({
      ...data,
      success: R.isEmpty(errors),
      errors,
    });
  };
}
