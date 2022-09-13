import * as R from "ramda";
import { ScenarioHelper } from "./ScenarioHelper";
import { ValidatorError } from "./../../../validators/backendValidator/ValidatorHelpers";
import { CapabilityId } from "@octocloud/types";
import { ProductValidator } from "../../../validators/backendValidator/Product/ProductValidator";
import { Result } from "../api/types";

export interface ProductScenarioData<T> {
  name: string;
  result: Result<T>;
}

export class ProductScenarioHelper extends ScenarioHelper {
  private getErrors = (
    products: any,
    capabilities: CapabilityId[]
  ): ValidatorError[] => {
    if (Array.isArray(products)) {
      ``;
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
      return this.handleResult({
        ...data,
        success: false,
        errors: [],
      });
    }

    const errors = this.getErrors(result.response.data.body, capabilities);
    return this.handleResult({
      ...data,
      success: R.isEmpty(errors),
      errors,
    });
  };
}
