import * as R from "ramda";
import { ScenarioHelper } from "./ScenarioHelper";
import { ModelValidator } from "./../../../validators/backendValidator/ValidatorHelpers";
import { SupplierValidator } from "../../../validators/backendValidator/Supplier/SupplierValidator";
import { CapabilityId, Supplier } from "@octocloud/types";
import { ScenarioResult } from "../Scenarios/Scenario";

export interface SupplierScenarioData {
  name: string;
  request: any;
  response: any;
}

export class SupplierScenarioHelper {
  private scenarioHelper = new ScenarioHelper();

  private getErrors = (suppliers: any, capabilities: CapabilityId[]) => {
    return suppliers.reduce((acc, result) => {
      return [
        ...acc,
        ...new SupplierValidator({ capabilities }).validate(result),
      ];
    }, []);
  };

  public validateSupplier = (
    data: SupplierScenarioData,
    capabilities: CapabilityId[]
  ): ScenarioResult<Supplier[]> => {
    if (data.response.error) {
      return this.scenarioHelper.handleResult({
        ...data,
        success: false,
        errors: [],
      });
    }

    const errors = this.getErrors(data.response.data.body, capabilities);
    return this.scenarioHelper.handleResult({
      ...data,
      success: R.isEmpty(errors),
      errors,
    });
  };

  public validateSupplierError = (
    data: SupplierScenarioData,
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
