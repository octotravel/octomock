import * as R from "ramda";
import { Availability, CapabilityId } from "@octocloud/types";
import { ApiClient } from "../../ApiClient";
import { Scenario } from "../../Scenario";
import { AvailabilityValidator } from "../../../../validators/backendValidator/Availability/AvailabilityValidator";

export class AvailabilityScenario implements Scenario<Availability[]> {
  private apiClient: ApiClient;
  private productId: string;
  private optionId: string;
  private localDateStart: string;
  private localDateEnd: string;
  private localDate: string;
  private availabilityIds: string[];
  private capabilities: CapabilityId[];
  constructor({
    apiClient,
    productId,
    optionId,
    localDateStart,
    localDateEnd,
    localDate,
    availabilityIds,
    capabilities,
  }: {
    apiClient: ApiClient;
    productId: string;
    optionId: string;
    localDateStart?: string;
    localDateEnd?: string;
    localDate?: string;
    availabilityIds?: string[];
    capabilities: CapabilityId[];
  }) {
    this.apiClient = apiClient;
    this.productId = productId;
    this.optionId = optionId;
    this.localDateStart = localDateStart;
    this.localDateEnd = localDateEnd;
    this.localDate = localDate;
    this.availabilityIds = availabilityIds;
    this.capabilities = capabilities;
  }

  public validate = async () => {
    const { result, error } = await this.apiClient.getAvailability({
      productId: this.productId,
      optionId: this.optionId,
      localDateStart: this.localDateStart,
      localDateEnd: this.localDateEnd,
      localDate: this.localDate,
      availabilityIds: this.availabilityIds,
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
        ...new AvailabilityValidator({
          capabilities: this.capabilities,
        }).validate(result)
      );
    });
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
