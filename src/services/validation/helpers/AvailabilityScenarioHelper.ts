import {
  Availability,
  AvailabilityStatus,
  CapabilityId,
} from "@octocloud/types";
import R from "ramda";
import { AvailabilityValidator } from "../../../validators/backendValidator/Availability/AvailabilityValidator";
import { ScenarioHelper } from "./ScenarioHelper";
import { ModelValidator } from "./../../../validators/backendValidator/ValidatorHelpers";

export interface AvailabilityScenarioData {
  name: string;
  request: any;
  response: any;
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
    if (data.response.error) {
      return this.scenarioHelper.handleResult({
        ...data,
        success: false,
        errors: [],
      });
    }

    if (R.isEmpty(data.response.data.body)) {
      return this.scenarioHelper.handleResult({
        ...data,
        success: false,
        errors: ["Availability has to be available"],
      });
    }
    if (this.checkAvailabilityStatus(data.response.data.body)) {
      return this.scenarioHelper.handleResult({
        ...data,
        success: false,
        errors: ["Availability can not be SOLD_OUT or CLOSED or not available"],
      });
    }

    const errors = this.getErrors(data.response, capabilities);
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

  public validateUnavailability = (data: AvailabilityScenarioData) => {
    if (!R.isEmpty(data.response.data.body)) {
      if (this.checkUnavailabilityStatus(data.response.data.body)) {
        return this.scenarioHelper.handleResult({
          ...data,
          success: false,
          errors: [
            "Availability should be empty or SOLD_OUT/CLOSED and not available",
          ],
        });
      }
    }

    return this.scenarioHelper.handleResult({
      ...data,
      success: data.response.error === null,
      errors: [],
    });
  };
}
