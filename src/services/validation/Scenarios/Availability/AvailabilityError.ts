import * as R from "ramda";
import { ApiClient } from "../../ApiClient";
import { Scenario, ScenarioResult } from "../../Scenario";

export class AvailabilityErrorScenario implements Scenario<null> {
  private apiClient: ApiClient;
  private productId: string;
  private optionId: string;
  private availabilityIds: string[];
  constructor({
    apiClient,
    productId,
    optionId,
    availabilityIds,
  }: {
    apiClient: ApiClient;
    productId: string;
    optionId: string;
    availabilityIds: string[];
  }) {
    this.apiClient = apiClient;
    this.productId = productId;
    this.optionId = optionId;
    this.availabilityIds = availabilityIds;
  }

  public validate = async (): Promise<ScenarioResult<null>> => {
    const { result, error } = await this.apiClient.getAvailability({
      productId: this.productId,
      optionId: this.optionId,
      availabilityIds: this.availabilityIds,
    });
    const name = `Availability with bad id`;
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
