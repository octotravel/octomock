import { ScenarioHelper, ScenarioHelperData } from "./ScenarioHelper";
import { SupplierValidator } from "../../../validators/backendValidator/Supplier/SupplierValidator";
import { Supplier } from "@octocloud/types";
import { ScenarioResult } from "../Scenarios/Scenario";
import { Config } from "../config/Config";

export class SupplierScenarioHelper extends ScenarioHelper {
  private config = Config.getInstance();
  public validateSupplier = (
    data: ScenarioHelperData<Supplier>
  ): ScenarioResult<Supplier> => {
    const { result } = data;
    if (result.response.error) {
      return this.handleResult({
        ...data,
        success: false,
        errors: [],
      });
    }

    const errors = new SupplierValidator({
      capabilities: this.config.getCapabilityIDs(),
    }).validate(result.data);
    return this.handleResult({
      ...data,
      errors,
    });
  };
}
