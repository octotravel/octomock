import * as R from "ramda";
import { ScenarioHelper } from "./ScenarioHelper";
import {
  ModelValidator,
  ValidatorError,
} from "./../../../validators/backendValidator/ValidatorHelpers";
import { CapabilityId } from "@octocloud/types";
import { ProductValidator } from "../../../validators/backendValidator/Product/ProductValidator";

export interface ProductScenarioData {
  name: string;
  request: any;
  response: any;
}

export class ProductScenarioHelper extends ScenarioHelper {
  private scenarioHelper = new ScenarioHelper();

  private getErrors = (
    products: any,
    capabilities: CapabilityId[]
  ): ValidatorError[] => {
    if (Array.isArray(products)) {
      return products.reduce((acc, result) => {
        return [
          ...acc,
          ...new ProductValidator({
            capabilities,
          }).validate(result),
        ];
      }, []);
    }
    return new ProductValidator({ capabilities }).validate(products);
  };

  public validateProduct = (
    data: ProductScenarioData,
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

  public validateProductError = (
    data: ProductScenarioData,
    error: string,
    validator: ModelValidator
  ) => {
    if (data.response.data) {
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

    const errors = validator.validate(data.response.error);
    return this.scenarioHelper.handleResult({
      ...data,
      success: R.isEmpty(errors),
      errors: errors,
    });
  };
}
