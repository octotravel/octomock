import * as R from "ramda";
import { CapabilityId, Product } from "@octocloud/types";
import { ProductValidator } from "../../../../validators/backendValidator/Product/ProductValidator";
import { ApiClient } from "../../ApiClient";
import { Scenario } from "../../Scenario";

export class ProductsScenario implements Scenario<Product[]> {
  private apiClient: ApiClient;
  private capabilities: CapabilityId[];
  constructor({
    apiClient,
    capabilities,
  }: {
    apiClient: ApiClient;
    capabilities: CapabilityId[];
  }) {
    this.apiClient = apiClient;
    this.capabilities = capabilities;
  }

  public validate = async () => {
    const { result, error } = await this.apiClient.getProducts();
    const name = "Correct products";
    if (error) {
      return {
        name,
        success: false,
        errors: [],
        data: result,
      };
    }
    const errors = result
      .map((product) => {
        return new ProductValidator({
          capabilities: this.capabilities,
        }).validate(product);
      })
      .flat(1);
    if (!R.isEmpty(errors)) {
      return {
        name,
        success: false,
        errors: errors.map((error) => error.message),
        data: result,
      };
    }
    return {
      name,
      success: true,
      errors: [],
      data: result,
    };
  };
}
