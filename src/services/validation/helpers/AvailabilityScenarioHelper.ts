import {
  Availability,
  AvailabilityStatus,
  CapabilityId,
} from "@octocloud/types";
import * as R from "ramda";
import { AvailabilityValidator } from "../../../validators/backendValidator/Availability/AvailabilityValidator";
import { ScenarioHelper } from "./ScenarioHelper";
import {
  ModelValidator,
  ValidatorError,
} from "./../../../validators/backendValidator/ValidatorHelpers";
import { Result } from "../api/types";

export interface AvailabilityScenarioData {
  name: string;
  result: Result<Availability[]>;
}

export class AvailabilityScenarioHelper {
  private scenarioHelper = new ScenarioHelper();

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

  private getErrors = (response: any, capabilities: CapabilityId[]) => {
    return response.data.body.reduce((acc, result) => {
      return [
        ...acc,
        ...new AvailabilityValidator({
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
      return this.scenarioHelper.handleResult({
        ...data,
        success: false,
        errors: [],
      });
    }

    if (R.isEmpty(result.data)) {
      return this.scenarioHelper.handleResult({
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
      return this.scenarioHelper.handleResult({
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
    return this.scenarioHelper.handleResult({
      ...data,
      success: R.isEmpty(errors),
      errors,
    });
  };

  public validateAvailabilityError = (
    data: AvailabilityScenarioData,
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

  public validateUnavailability = (
    data: AvailabilityScenarioData,
    capabilities: CapabilityId[]
  ) => {
    const { result } = data;
    if (result.response.error) {
      return this.scenarioHelper.handleResult({
        ...data,
        success: false,
        errors: [],
      });
    }
    if (!R.isEmpty(result.data)) {
      if (this.checkUnavailabilityStatus(result.data)) {
        return this.scenarioHelper.handleResult({
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
    return this.scenarioHelper.handleResult({
      ...data,
      success: R.isEmpty(errors),
      errors,
    });
  };
}
