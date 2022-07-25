import * as R from "ramda";
import { CapabilityId, Product } from "@octocloud/types";
import { ProductValidator } from "../../../../validators/backendValidator/Product/ProductValidator";
import { ApiClient } from "../../ApiClient";
import { Scenario } from "../Scenario";

export class GetProductsScenario implements Scenario<Product[]> {
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
    const { request, response } = await this.apiClient.getProducts();
    const name = "Get Products";
    if (response.error) {
      return {
        name,
        success: false,
        request,
        response: {
          body: null,
          status: response.error.status,
          error: {
            body: response.error.body,
          },
        },
        errors: [],
      };
    }
    const errors = response.data.body
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
        request,
        response: {
          body: response.data.body,
          status: response.data.status,
          error: null,
        },
        errors: errors.map((error) => error.message),
      };
    }
    return {
      name,
      success: true,
      request,
      response: {
        body: response.data.body,
        status: response.data.status,
        error: null,
      },
      errors: [],
    };
  };
}
