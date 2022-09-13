import * as R from "ramda";
import { ScenarioHelper } from "./ScenarioHelper";
import {
  ModelValidator,
  ValidatorError,
} from "./../../../validators/backendValidator/ValidatorHelpers";
import { CapabilityId } from "@octocloud/types";
import { ProductValidator } from "../../../validators/backendValidator/Product/ProductValidator";
import { Result } from "../api/types";

export interface ProductScenarioData<T> {
  name: string;
  result: Result<T>;
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

  public validateProduct = <T>(
    data: ProductScenarioData<T>,
    capabilities: CapabilityId[]
  ) => {
    const { result } = data;
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

  public validateProductError = <T>(
    data: ProductScenarioData<T>,
    error: string,
    validator: ModelValidator
  ) => {
    const { result } = data;
    if (result.response.data) {
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

    const errors = validator.validate(result.response.error);
    return this.scenarioHelper.handleResult({
      ...data,
      success: R.isEmpty(errors),
      errors: errors,
    });
  };
}
