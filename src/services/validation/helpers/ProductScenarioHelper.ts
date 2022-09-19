import { ProductValidator } from "./../../../validators/backendValidator/Product/ProductValidator";
import { Product } from "@octocloud/types";
import { ScenarioHelper } from "./ScenarioHelper";
import { Result } from "../api/types";
import { Config } from "../config/Config";
import { ValidatorError } from "../../../validators/backendValidator/ValidatorHelpers";

export interface ProductScenarioData<T> {
  name: string;
  result: Result<T>;
}

export class ProductScenarioHelper extends ScenarioHelper {
  private config = Config.getInstance();
  private validator = new ProductValidator({
    capabilities: this.config.getCapabilityIDs(),
  });

  public validateProducts = (data: ProductScenarioData<Product[]>) => {
    const { result } = data;
    if (result.response.error) {
      return this.handleResult({
        ...data,
        success: false,
        errors: [],
      });
    }
    const products = result.data;
    const errors = new Array<ValidatorError>();
    const configErrors = this.config.setProducts(products);
    errors.push(...configErrors);
    const validatorErrors = products.map(this.validator.validate).flat(1);
    errors.push(...validatorErrors);

    return this.handleResult({
      ...data,
      errors,
    });
  };

  public validateProduct = (data: ProductScenarioData<Product>) => {
    const { result } = data;
    if (result.response.error) {
      return this.handleResult({
        ...data,
        success: false,
        errors: [],
      });
    }

    const errors = this.validator.validate(result.data);
    return this.handleResult({
      ...data,
      errors,
    });
  };
}
