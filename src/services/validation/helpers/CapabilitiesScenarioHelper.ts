import * as R from "ramda";
import { ScenarioHelper } from "./ScenarioHelper";
import { Capability } from "@octocloud/types";
import { CapabilityValidator } from "../../../validators/backendValidator/Capability/CapabilityValidator";
import { Result } from "../api/types";

export interface CapabilitiesScenarioData {
  name: string;
  result: Result<Capability[]>;
}

export class CapabilitiesScenarioHelper extends ScenarioHelper {
  public validateCapabilities = (data: CapabilitiesScenarioData) => {
    const validator = new CapabilityValidator({});
    const { result } = data;
    if (result.response.error) {
      return this.handleResult({
        ...data,
        success: false,
        errors: [],
      });
    }

    const errors = result.data.map(validator.validate).flat(1);
    return this.handleResult({
      ...data,
      success: R.isEmpty(errors),
      errors,
    });
  };
}
