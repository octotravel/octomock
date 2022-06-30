import * as R from "ramda";
import { InvalidProductIdErrorValidator } from "../../../../validators/backendValidator/Error/InvalidProductIdErrorValidator";
import { ApiClient } from "../../ApiClient";
import { Scenario, ScenarioResult } from "../../Scenario";

export class AvailabilityErrorScenario implements Scenario<null> {
  private apiClient: ApiClient;
  private productId: string;
  private optionId: string;
  constructor({
    apiClient,
    productId,
    optionId,
  }: {
    apiClient: ApiClient;
    productId: string;
    optionId: string;
  }) {
    this.apiClient = apiClient;
    this.productId = productId;
    this.optionId = optionId;
  }

  public validate = async (): Promise<ScenarioResult<null>> => {
    const { result, error } = await this.apiClient.getAvailability({
      productId: this.productId,
      optionId: this.optionId,
    });
    const name = `availability with bad id`;
    if (result) {
      // test case failed
      return {
        name,
        success: false,
        errors: [],
        data: null,
      };
    }

    const errors = new InvalidProductIdErrorValidator().validate(error);
    if (!R.isEmpty(errors)) {
      return {
        name,
        success: false,
        errors: errors.map((error) => error.message),
        data: null,
      };
    }
    return {
      name,
      success: true,
      errors: [],
      data: null,
    };
  };
}
