import * as R from "ramda";
import { CapabilityId, Product } from "@octocloud/types";
import { ProductValidator } from "../../../../validators/backendValidator/Product/ProductValidator";
import { ApiClient } from "../../ApiClient";
import { Scenario } from "../../Scenario";

export class ProductScenario implements Scenario<Product> {
  private apiClient: ApiClient;
  private productId: string;
  private capabilities: CapabilityId[];
  constructor({
    apiClient,
    productId,
    capabilities,
  }: {
    apiClient: ApiClient;
    productId: string;
    capabilities: CapabilityId[];
  }) {
    this.apiClient = apiClient;
    this.productId = productId;
    this.capabilities = capabilities;
  }

  public validate = async () => {
    const { result, error } = await this.apiClient.getProduct({
      id: this.productId,
    });
    const name = "Correct product";
    if (error) {
      const data = error as unknown;
      return {
        name,
        success: false,
        errors: [error.body.errorMessage as string],
        data: data as Product,
      };
    }
    const errors = new ProductValidator({
      capabilities: this.capabilities,
    }).validate(result);
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
