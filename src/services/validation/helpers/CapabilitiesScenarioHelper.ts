import * as R from "ramda";
import { ScenarioHelper } from "./ScenarioHelper";
import { ModelValidator } from "../../../validators/backendValidator/ValidatorHelpers";
import { CapabilityId } from "@octocloud/types";

export interface CapabilitiesScenarioData {
  name: string;
  request: any;
  response: any;
}

export class CapabilitiesScenarioHelper {
  private scenarioHelper = new ScenarioHelper();

  private getErrors = (_capabilities: CapabilityId[]) => {
    return [];
  };

  public validateCapabilities = (data: CapabilitiesScenarioData) => {
    if (data.response.error) {
      return this.scenarioHelper.handleResult({
        ...data,
        success: false,
        errors: [],
      });
    }

    const errors = this.getErrors(data.response.data.body);
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
