import * as R from "ramda";
import { ScenarioHelper } from "./ScenarioHelper";
import {
  ModelValidator,
  ValidatorError,
} from "../../../validators/backendValidator/ValidatorHelpers";
import { Capability } from "@octocloud/types";
import { CapabilityValidator } from "../../../validators/backendValidator/Capability/CapabilityValidator";
import { Result } from "../api/types";

export interface CapabilitiesScenarioData {
  name: string;
  result: Result<Capability[]>;
}

export class CapabilitiesScenarioHelper {
  private scenarioHelper = new ScenarioHelper();

  private getErrors = (capabilities: Capability[]): ValidatorError[] => {
    return capabilities.reduce((acc, result) => {
      return [...acc, ...new CapabilityValidator({}).validate(result)];
    }, []);
  };

  public validateCapabilities = (data: CapabilitiesScenarioData) => {
    const { result } = data;
    if (result.response.error) {
      return this.scenarioHelper.handleResult({
        ...data,
        success: false,
        errors: [],
      });
    }

    const errors = this.getErrors(result.response.data.body);
    return this.scenarioHelper.handleResult({
      ...data,
      success: R.isEmpty(errors),
      errors,
    });
  };

  public validateCapabilitiesError = (
    data: CapabilitiesScenarioData,
    error: string,
    validator: ModelValidator
  ) => {
    const { result } = data;
    if (result.response.data) {
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
