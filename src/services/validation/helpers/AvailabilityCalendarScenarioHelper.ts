import * as R from "ramda";
import { AvailabilityCalendar, Product } from "@octocloud/types";
import { ScenarioHelper } from "./ScenarioHelper";
import {
  ErrorType,
  ValidatorError,
} from "./../../../validators/backendValidator/ValidatorHelpers";
import { AvailabilityCalendarValidator } from "../../../validators/backendValidator/AvailabilityCalendar/AvailabilityCalendarValidator";
import { Result } from "../api/types";
import { Config } from "../config/Config";

export interface AvailabilityScenarioData {
  name: string;
  result: Result<AvailabilityCalendar[]>;
  product: Product;
}

export class AvailabilityCalendarScenarioHelper extends ScenarioHelper {
  private config = Config.getInstance();

  public validateAvailability = (data: AvailabilityScenarioData) => {
    const { result, product } = data;
    const availabilities = R.is(Array, result.data) ? result.data : [];
    if (result.response.error) {
      return this.handleResult({
        ...data,
        success: false,
        errors: [],
      });
    }
    const errors = [];

    if (R.isEmpty(availabilities)) {
      errors.push(
        new ValidatorError({
          type: ErrorType.CRITICAL,
          message: "No availabilities were provided",
        })
      );
    }

    const validationErrors = availabilities
      .map((availability, i) =>
        new AvailabilityCalendarValidator({
          capabilities: this.config.getCapabilityIDs(),
          path: `[${i}]`,
          availabilityType: product.availabilityType,
        }).validate(availability)
      )
      .flat();

    errors.push(...validationErrors);

    return this.handleResult({
      ...data,
      success: this.isSuccess(errors),
      errors: errors,
    });
  };
}
