import * as R from "ramda";
import { InvalidProductIdErrorValidator } from "../../../../validators/backendValidator/Error/InvalidProductIdErrorValidator";
import { ApiClient } from "../../ApiClient";
import { Scenario, ScenarioResult } from "../../Scenario";

export class ProductErrorScenario implements Scenario<null> {
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

  public validate = async (): Promise<ScenarioResult<null>> => {
    const { result, error } = await this.apiClient.getProduct({
      id: this.productId,
    });
    if (result) {
      // test case failed
      return {
        success: false,
        errors: [],
        data: null,
      };
    }

    const errors = new InvalidProductIdErrorValidator().validate(error);
    if (!R.isEmpty(errors)) {
      return {
        success: false,
        errors: errors,
        data: null,
      };
    }
    return {
      success: true,
      errors: [],
      data: null,
    };
  };
}
