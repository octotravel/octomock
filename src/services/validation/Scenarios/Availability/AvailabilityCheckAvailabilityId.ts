import { Availability } from "@octocloud/types";
import { ApiClient } from "../../api/ApiClient";
import { Scenario } from "../Scenario";
import { AvailabilityScenarioHelper } from "../../helpers/AvailabilityScenarioHelper";

export class AvailabilityCheckAvailabilityIdScenario
  implements Scenario<Availability[]>
{
  private apiClient: ApiClient;
  private productId: string;
  private optionId: string;
  private availabilityIds: string[];
  private availabilityType: string;
  constructor({
    apiClient,
    productId,
    optionId,
    availabilityIds,
    availabilityType,
  }: {
    apiClient: ApiClient;
    productId: string;
    optionId: string;
    availabilityIds: string[];
    availabilityType: string;
  }) {
    this.apiClient = apiClient;
    this.productId = productId;
    this.optionId = optionId;
    this.availabilityIds = availabilityIds;
    this.availabilityType = availabilityType;
  }
  private availabilityScenarioHelper = new AvailabilityScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.getAvailability({
      productId: this.productId,
      optionId: this.optionId,
      availabilityIds: this.availabilityIds,
    });

    const name = `Availability Check AvailabilityId (${this.availabilityType})`;

    return this.availabilityScenarioHelper.validateUnavailability({
      name,
      result,
    });
  };
}
