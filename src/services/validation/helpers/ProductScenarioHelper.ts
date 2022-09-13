import { ProductValidator } from "./../../../validators/backendValidator/Product/ProductValidator";
import * as R from "ramda";
import { Product } from "@octocloud/types";
import { ScenarioHelper } from "./ScenarioHelper";
import { Result } from "../api/types";
import { Config } from "../config/Config";

export interface ProductScenarioData<T> {
  name: string;
  result: Result<T>;
}

export class ProductScenarioHelper extends ScenarioHelper {
  private config = Config.getInstance();

  public validateProducts = (data: ProductScenarioData<Product[]>) => {
    const validator = new ProductValidator({
      capabilities: this.config.getCapabilityIDs(),
    });
    const { result } = data;
    if (result.response.error) {
      return this.handleResult({
        ...data,
        success: false,
        errors: [],
      });
    }

    let errors = result.data.map(validator.validate).flat();

    if (R.isEmpty(errors)) {
      errors = [...this.config.setProducts(result.data)];
    }

    return this.handleResult({
      ...data,
      success: R.isEmpty(errors),
      errors,
    });
  };

  public validateProduct = (data: ProductScenarioData<Product>) => {
    const validator = new ProductValidator({
      capabilities: this.config.getCapabilityIDs(),
    });
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
