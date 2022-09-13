import { Availability } from "@octocloud/types";
import { ApiClient } from "../../api/ApiClient";
import { Scenario } from "../Scenario";
import { AvailabilityScenarioHelper } from "../../helpers/AvailabilityScenarioHelper";

export class AvailabilityCheckDateScenario implements Scenario<Availability[]> {
  private apiClient: ApiClient;
  private productId: string;
  private optionId: string;
  private localDate: string;
  private availabilityType: string;
  private availabilityScenarioHelper = new AvailabilityScenarioHelper();
  constructor({
    apiClient,
    productId,
    optionId,
    localDate,
    availabilityType,
  }: {
    apiClient: ApiClient;
    productId: string;
    optionId: string;
    localDate: string;
    availabilityType: string;
  }) {
    this.apiClient = apiClient;
    this.productId = productId;
    this.optionId = optionId;
    this.localDate = localDate;
    this.availabilityType = availabilityType;
  }

  public validate = async () => {
    const result = await this.apiClient.getAvailability({
      productId: this.productId,
      optionId: this.optionId,
      localDate: this.localDate,
    });
    const name = `Availability Check Date (${this.availabilityType})`;

    return this.availabilityScenarioHelper.validateUnavailability({
      name,
      result,
    });
  };
}
