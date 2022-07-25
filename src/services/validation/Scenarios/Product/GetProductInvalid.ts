import * as R from "ramda";
import { InvalidProductIdErrorValidator } from "../../../../validators/backendValidator/Error/InvalidProductIdErrorValidator";
import { ApiClient } from "../../ApiClient";
import { Scenario, ScenarioResult } from "../Scenario";

export class GetProductInvalidScenario implements Scenario<any> {
  private apiClient: ApiClient;
  private productId: string;
  constructor({
    apiClient,
    productId,
  }: {
    apiClient: ApiClient;
    productId: string;
  }) {
    this.apiClient = apiClient;
    this.productId = productId;
  }

  public validate = async (): Promise<ScenarioResult<any>> => {
    const { request, response } = await this.apiClient.getProduct({
      id: this.productId,
    });
    const name = `Get Product Invalid`;
    if (response.data) {
      return {
        name,
        success: false,
        request,
        response: {
          body: response.data.status,
          status: response.data.status,
          error: null,
        },
        errors: ["Response should be INVALID_PRODUCT_ID"],
      };
    }

    const errors = new InvalidProductIdErrorValidator().validate(
      response.error
    );
    if (!R.isEmpty(errors)) {
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
        errors: errors.map((error) => error.message),
      };
    }
    return {
      name,
      success: true,
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
  };
}
