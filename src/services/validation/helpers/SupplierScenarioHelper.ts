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

export class SupplierScenarioHelper extends ScenarioHelper {
  public validateSupplier = (
    data: SupplierScenarioData,
    capabilities: CapabilityId[]
  ): ScenarioResult<Supplier> => {
    const { result } = data;
    if (result.response.error) {
      return this.handleResult({
        ...data,
        success: false,
        errors: [],
      });
    }

    const errors = new SupplierValidator({ capabilities }).validate(
      result.data
    );
    return this.handleResult({
      ...data,
      success: R.isEmpty(errors),
      errors,
    });
  };
}
