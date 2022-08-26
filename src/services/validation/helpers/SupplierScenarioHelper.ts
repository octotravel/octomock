import R from "ramda";
import { ScenarioHelper } from "./ScenarioHelper";
import { ModelValidator } from "./../../../validators/backendValidator/ValidatorHelpers";
import { SupplierValidator } from "../../../validators/backendValidator/Supplier/SupplierValidator";
import { CapabilityId } from "@octocloud/types";

export interface SupplierScenarioData {
  name: string;
  request: any;
  response: any;
}

export class SupplierScenarioHelper {
  private scenarioHelper = new ScenarioHelper();

  private getErrors = (suppliers: any, capabilities: CapabilityId[]) => {
    if (Array.isArray(suppliers)) {
      return suppliers.reduce((acc, result) => {
        return [
          ...acc,
          ...new SupplierValidator({ capabilities }).validate(result),
        ];
      }, []);
    }
    return new SupplierValidator({ capabilities }).validate(suppliers);
  };

  public validateSupplier = (
    data: SupplierScenarioData,
    capabilities: CapabilityId[]
  ) => {
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
