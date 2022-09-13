import { AvailabilityCalendar, AvailabilityStatus } from "@octocloud/types";
import * as R from "ramda";
import { ScenarioHelper } from "./ScenarioHelper";
import { ValidatorError } from "./../../../validators/backendValidator/ValidatorHelpers";
import { AvailabilityCalendarValidator } from "../../../validators/backendValidator/AvailabilityCalendar/AvailabilityCalendarValidator";
import { Result } from "../api/types";
import { Config } from "../config/Config";

export interface AvailabilityScenarioData {
  name: string;
  result: Result<AvailabilityCalendar[]>;
}

export class AvailabilityCalendarScenarioHelper extends ScenarioHelper {
  private config = Config.getInstance();

  private checkAvailabilityStatus = (availability: AvailabilityCalendar[]) => {
    return availability
      .map((availability) => {
        return (
          !availability.available ||
          availability.status === AvailabilityStatus.CLOSED ||
          availability.status === AvailabilityStatus.SOLD_OUT
        );
      })
      .some((status) => status);
  };

  public validateAvailability = (data: AvailabilityScenarioData) => {
    const validator = new AvailabilityCalendarValidator({
      capabilities: this.config.getCapabilityIDs(),
    });
    const { result } = data;
    if (result.response.error) {
      return this.handleResult({
        ...data,
        success: false,
        errors: [],
      });
    }

    const errors = [
      R.isEmpty(result.data)
        ? new ValidatorError({
            message: "Availability has to be available",
          })
        : null,
      this.checkAvailabilityStatus(result.data)
        ? new ValidatorError({
            message:
              "Availability can not be SOLD_OUT or CLOSED or not available",
          })
        : null,
      ...result.data.map(validator.validate).flat(),
    ].filter(Boolean);

    return this.handleResult({
      ...data,
      success: R.isEmpty(errors),
      errors,
    });
  };
}
