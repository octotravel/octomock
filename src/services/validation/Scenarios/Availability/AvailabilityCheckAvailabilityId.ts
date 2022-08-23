import { Availability, CapabilityId } from "@octocloud/types";
import { ApiClient } from "../../ApiClient";
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
  private capabilities: CapabilityId[];
  constructor({
    apiClient,
    productId,
    optionId,
    availabilityIds,
    availabilityType,
    capabilities,
  }: {
    apiClient: ApiClient;
    productId: string;
    optionId: string;
    availabilityIds: string[];
    availabilityType: string;
    capabilities: CapabilityId[];
  }) {
    this.apiClient = apiClient;
    this.productId = productId;
    this.optionId = optionId;
    this.availabilityIds = availabilityIds;
    this.availabilityType = availabilityType;
    this.capabilities = capabilities;
  }
  private availabilityScenarioHelper = new AvailabilityScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.getAvailability({
      productId: this.productId,
      optionId: this.optionId,
      availabilityIds: this.availabilityIds,
    });

    const name = `Availability Check AvailabilityId (${this.availabilityType})`;

    return this.availabilityScenarioHelper.validateAvailability(
      {
        name,
        ...result,
      },
      this.capabilities
    );
  };
}
