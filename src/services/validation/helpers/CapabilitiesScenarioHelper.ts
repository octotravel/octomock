import { ScenarioHelper, ScenarioHelperData } from "./ScenarioHelper";
import { Capability } from "@octocloud/types";
import { CapabilityValidator } from "../../../validators/backendValidator/Capability/CapabilityValidator";

export class CapabilitiesScenarioHelper extends ScenarioHelper {
  public validateCapabilities = (data: ScenarioHelperData<null | Capability[]>) => {
    const validator = new CapabilityValidator({});
    const { result } = data;
    if (result.response.error) {
      return this.handleResult({
        ...data,
        success: false,
        errors: [],
      });
    }
    result.data;
    const errors = result.data.map(validator.validate).flat(1);
    return this.handleResult({
      ...data,
      errors,
    });
  };
}
