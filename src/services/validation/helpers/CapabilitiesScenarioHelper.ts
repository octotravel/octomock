import * as R from "ramda";
import { ScenarioHelper } from "./ScenarioHelper";
import { ValidatorError } from "../../../validators/backendValidator/ValidatorHelpers";
import { Capability } from "@octocloud/types";
import { CapabilityValidator } from "../../../validators/backendValidator/Capability/CapabilityValidator";
import { Result } from "../api/types";

export interface CapabilitiesScenarioData {
  name: string;
  result: Result<Capability[]>;
}

export class CapabilitiesScenarioHelper extends ScenarioHelper {
  private getErrors = (capabilities: Capability[]): ValidatorError[] => {
    return capabilities.reduce((acc, result) => {
      return [...acc, ...new CapabilityValidator({}).validate(result)];
    }, []);
  };

  public validateCapabilities = (data: CapabilitiesScenarioData) => {
    const { result } = data;
    if (result.response.error) {
      return this.handleResult({
        ...data,
        success: false,
        errors: [],
      });
    }

    const errors = this.getErrors(result.response.data.body);
    return this.handleResult({
      ...data,
      success: R.isEmpty(errors),
      errors,
    });
  };
}
