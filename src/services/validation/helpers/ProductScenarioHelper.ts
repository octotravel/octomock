import { ProductValidator } from "./../../../validators/backendValidator/Product/ProductValidator";
import * as R from "ramda";
import { CapabilityId, Product } from "@octocloud/types";
import { ScenarioHelper } from "./ScenarioHelper";
import { Result } from "../api/types";

export interface ProductScenarioData<T> {
  name: string;
  result: Result<T>;
}

export class ProductScenarioHelper extends ScenarioHelper {
  public validateProducts = (
    data: ProductScenarioData<Product[]>,
    capabilities: CapabilityId[]
  ) => {
    const validator = new ProductValidator({ capabilities });
    const { result } = data;
    if (result.response.error) {
      return this.handleResult({
        ...data,
        success: false,
        errors: [],
      });
    }

    const errors = result.data.map(validator.validate).flat();
    return this.handleResult({
      ...data,
      success: R.isEmpty(errors),
      errors,
    });
  };

  public validateProduct = (
    data: ProductScenarioData<Product>,
    capabilities: CapabilityId[]
  ) => {
    const validator = new ProductValidator({ capabilities });
    const { result } = data;
    if (result.response.error) {
      return this.handleResult({
        ...data,
        success: false,
        errors: [],
      });
    }

    const errors = validator.validate(result.data);
    return this.handleResult({
      ...data,
      success: R.isEmpty(errors),
      errors,
    });
  };
}
