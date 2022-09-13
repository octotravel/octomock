import {
  AvailabilityCalendar,
  AvailabilityStatus,
  CapabilityId,
} from "@octocloud/types";
import * as R from "ramda";
import { ScenarioHelper } from "./ScenarioHelper";
import { ValidatorError } from "./../../../validators/backendValidator/ValidatorHelpers";
import { AvailabilityCalendarValidator } from "../../../validators/backendValidator/AvailabilityCalendar/AvailabilityCalendarValidator";
import { Result } from "../api/types";

export interface AvailabilityScenarioData {
  name: string;
  result: Result<AvailabilityCalendar[]>;
}

export class AvailabilityCalendarScenarioHelper extends ScenarioHelper {
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

  private checkUnavailabilityStatus = (
    availability: AvailabilityCalendar[]
  ) => {
    return availability
      .map((availability) => {
        return (
          availability.status === AvailabilityStatus.CLOSED ||
          (availability.status === AvailabilityStatus.SOLD_OUT &&
            !availability.available)
        );
      })
      .some((status) => !status);
  };

  private getErrors = (response: any, capabilities: CapabilityId[]) => {
    return response.data.body.reduce((acc, result) => {
      return [
        ...acc,
        ...new AvailabilityCalendarValidator({
          capabilities,
        }).validate(result),
      ];
    }, []);
  };

  public validateAvailability = (
    data: AvailabilityScenarioData,
    capabilities: CapabilityId[]
  ) => {
    const { result } = data;
    if (result.response.error) {
      return this.handleResult({
        ...data,
        success: false,
        errors: [],
      });
    }

    if (R.isEmpty(result.response.data.body)) {
      return this.handleResult({
        ...data,
        success: false,
        errors: [
          new ValidatorError({
            message: "Availability has to be available",
          }),
        ],
      });
    }
    if (this.checkAvailabilityStatus(result.response.data.body)) {
      return this.handleResult({
        ...data,
        success: false,
        errors: [
          new ValidatorError({
            message:
              "Availability can not be SOLD_OUT or CLOSED or not available",
          }),
        ],
      });
    }

    const errors = this.getErrors(result.response, capabilities);
    return this.handleResult({
      ...data,
      success: R.isEmpty(errors),
      errors,
    });
  };

  public validateUnavailability = (
    data: AvailabilityScenarioData,
    capabilities: CapabilityId[]
  ) => {
    const { result } = data;
    if (result.response.error) {
      return this.handleResult({
        ...data,
        success: false,
        errors: [],
      });
    }
    if (!R.isEmpty(result.response.data.body)) {
      if (this.checkUnavailabilityStatus(result.response.data.body)) {
        return this.handleResult({
          ...data,
          success: false,
          errors: [
            new ValidatorError({
              message:
                "Availability should be empty or SOLD_OUT/CLOSED and not available",
            }),
          ],
        });
      }
    }

    const errors = this.getErrors(result.response, capabilities);
    return this.handleResult({
      ...data,
      success: R.isEmpty(errors),
      errors,
    });
  };
}
