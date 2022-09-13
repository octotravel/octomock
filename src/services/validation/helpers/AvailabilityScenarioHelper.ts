import { Availability, AvailabilityStatus } from "@octocloud/types";
import * as R from "ramda";
import { AvailabilityValidator } from "../../../validators/backendValidator/Availability/AvailabilityValidator";
import { ScenarioHelper } from "./ScenarioHelper";
import { ValidatorError } from "./../../../validators/backendValidator/ValidatorHelpers";
import { Result } from "../api/types";
import { Config } from "../config/Config";

export interface AvailabilityScenarioData {
  name: string;
  result: Result<Availability[]>;
}

export class AvailabilityScenarioHelper extends ScenarioHelper {
  private config = Config.getInstance();
  private checkAvailabilityStatus = (availability: Availability[]) => {
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

  private checkUnavailabilityStatus = (availability: Availability[]) => {
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

  private getErrors = (response: any) => {
    return response.data.body.reduce((acc, result) => {
      return [
        ...acc,
        ...new AvailabilityValidator({
          capabilities: this.config.getCapabilityIDs(),
        }).validate(result),
      ];
    }, []);
  };

  public validateAvailability = (data: AvailabilityScenarioData) => {
    const { result } = data;
    if (result.response.error) {
      return this.handleResult({
        ...data,
        success: false,
        errors: [],
      });
    }

    if (R.isEmpty(result.data)) {
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
    if (this.checkAvailabilityStatus(result.data)) {
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

    const errors = this.getErrors(result.response);
    return this.handleResult({
      ...data,
      success: R.isEmpty(errors),
      errors,
    });
  };

  public validateUnavailability = (data: AvailabilityScenarioData) => {
    const { result } = data;
    if (result.response.error) {
      return this.handleResult({
        ...data,
        success: false,
        errors: [],
      });
    }
    if (!R.isEmpty(result.data)) {
      if (this.checkUnavailabilityStatus(result.data)) {
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

    const errors = this.getErrors(result.response);
    return this.handleResult({
      ...data,
      success: R.isEmpty(errors),
      errors,
    });
  };
}
