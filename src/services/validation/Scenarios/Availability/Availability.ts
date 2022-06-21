import * as R from "ramda";
import { Availability, CapabilityId } from "@octocloud/types";
import { ApiClient } from "../../ApiClient";
import { Scenario } from "../../Scenario";
import { AvailabilityValidator } from "../../../../validators/backendValidator/Availability/AvailabilityValidator";

export class AvailabilityScenario implements Scenario<Availability[]> {
  private apiClient: ApiClient;
  private productId: string;
  private optionId: string;
  private capabilities: CapabilityId[];
  constructor({
    apiClient,
    productId,
    optionId,
    capabilities,
  }: {
    apiClient: ApiClient;
    productId: string;
    optionId: string;
    capabilities: CapabilityId[];
  }) {
    this.apiClient = apiClient;
    this.productId = productId;
    this.optionId = optionId;
    this.capabilities = capabilities;
  }

  public validate = async () => {
    const { result, error } = await this.apiClient.getAvailability({
      productId: this.productId,
      optionId: this.optionId,
    });
    const name = "Correct availability";
    if (error) {
      return {
        name,
        success: false,
        errors: [],
        data: result,
      };
    }
    const errors = [];
    result.map((result) => {
      errors.push(
        new AvailabilityValidator({
          capabilities: this.capabilities,
        }).validate(result)
      );
    });
    if (!R.isEmpty(errors)) {
      return {
        name,
        success: false,
        errors: errors,
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
