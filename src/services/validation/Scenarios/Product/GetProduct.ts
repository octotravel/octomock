import * as R from "ramda";
import { CapabilityId, Product } from "@octocloud/types";
import { ProductValidator } from "../../../../validators/backendValidator/Product/ProductValidator";
import { ApiClient } from "../../ApiClient";
import { Scenario } from "../Scenario";

export class GetProductScenario implements Scenario<Product> {
  private apiClient: ApiClient;
  private productId: string;
  private availabilityType: string;
  private capabilities: CapabilityId[];
  constructor({
    apiClient,
    productId,
    availabilityType,
    capabilities,
  }: {
    apiClient: ApiClient;
    productId: string;
    availabilityType: string;
    capabilities: CapabilityId[];
  }) {
    this.apiClient = apiClient;
    this.productId = productId;
    this.availabilityType = availabilityType;
    this.capabilities = capabilities;
  }

  public validate = async () => {
    const { request, response } = await this.apiClient.getProduct({
      id: this.productId,
    });
    const name = `Get Product (${this.availabilityType})`;
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
    const errors = new ProductValidator({
      capabilities: this.capabilities,
    }).validate(response.data.body);
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
