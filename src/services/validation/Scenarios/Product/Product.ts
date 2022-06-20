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
    if (error) {
      return {
        success: false,
        errors: [],
        data: result,
      };
    }
    const errors = new ProductValidator({
      capabilities: this.capabilities,
    }).validate(result);
    if (!R.isEmpty(errors)) {
      return {
        success: false,
        errors: errors,
        data: result,
      };
    }
    return {
      success: true,
      errors: [],
      data: result,
    };
  };
}
