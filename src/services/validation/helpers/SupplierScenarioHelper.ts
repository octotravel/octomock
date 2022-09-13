import * as R from "ramda";
import { ScenarioHelper } from "./ScenarioHelper";
import { SupplierValidator } from "../../../validators/backendValidator/Supplier/SupplierValidator";
import { CapabilityId, Supplier } from "@octocloud/types";
import { ScenarioResult } from "../Scenarios/Scenario";
import { Result } from "../api/types";

export interface SupplierScenarioData {
  name: string;
  result: Result<Supplier>;
}

export class SupplierScenarioHelper {
  private scenarioHelper = new ScenarioHelper();

  private getErrors = (supplier: Supplier, capabilities: CapabilityId[]) => {
    return new SupplierValidator({ capabilities }).validate(supplier);
  };

  public validateSupplier = (
    data: SupplierScenarioData,
    capabilities: CapabilityId[]
  ): ScenarioResult<Supplier> => {
    const { result } = data;
    console.log(result);
    if (result.response.error) {
      return this.scenarioHelper.handleResult({
        ...data,
        success: false,
        errors: [],
      });
    }

    const errors = this.getErrors(result.response.data.body, capabilities);
    return this.scenarioHelper.handleResult({
      ...data,
      success: R.isEmpty(errors),
      errors,
    });
  };
}
