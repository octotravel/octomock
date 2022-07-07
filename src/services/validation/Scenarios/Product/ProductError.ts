import * as R from "ramda";
import { InvalidProductIdErrorValidator } from "../../../../validators/backendValidator/Error/InvalidProductIdErrorValidator";
import { ApiClient } from "../../ApiClient";
import { Scenario, ScenarioResult } from "../../Scenario";

export class ProductErrorScenario implements Scenario<any> {
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
    const { result, error } = await this.apiClient.getProduct({
      id: this.productId,
    });
    const name = `Product with bad id`;
    if (result) {
      // test case failed
      return {
        name,
        success: false,
        errors: [],
        data: result,
      };
    }

    const errors = new InvalidProductIdErrorValidator().validate(error);
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
