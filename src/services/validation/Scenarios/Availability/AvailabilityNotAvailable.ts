import * as R from "ramda";
import { ApiClient } from "../../ApiClient";
import { Scenario, ScenarioResult } from "../../Scenario";

export class AvailabilityNotAvailableScenario implements Scenario<null> {
  private apiClient: ApiClient;
  private productId: string;
  private optionId: string;
  private localDateStart: string;
  private localDateEnd: string;
  constructor({
    apiClient,
    productId,
    optionId,
    localDateStart,
    localDateEnd,
  }: {
    apiClient: ApiClient;
    productId: string;
    optionId: string;
    localDateStart: string;
    localDateEnd: string;
  }) {
    this.apiClient = apiClient;
    this.productId = productId;
    this.optionId = optionId;
    this.localDateStart = localDateStart;
    this.localDateEnd = localDateEnd;
  }

  public validate = async (): Promise<ScenarioResult<null>> => {
    const { result, error } = await this.apiClient.getAvailability({
      productId: this.productId,
      optionId: this.optionId,
      localDateStart: this.localDateStart,
      localDateEnd: this.localDateEnd,
    });
    const name = `availability not available`;
    if (!R.isEmpty(result)) {
      // test case failed
      return {
        name,
        success: false,
        errors: ["Availability should be empty"],
        data: null,
      };
    }

    if (error) {
      return {
        name,
        success: false,
        errors: [error.body.message[0]],
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
