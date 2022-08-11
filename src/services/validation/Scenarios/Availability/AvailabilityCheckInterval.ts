import { Availability, CapabilityId } from "@octocloud/types";
import { ApiClient } from "../../ApiClient";
import { Scenario } from "../Scenario";
import { AvailabilityScenarioHelper } from "../../helpers/AvailabilityScenarioHelper";

export class AvailabilityCheckIntervalScenario
  implements Scenario<Availability[]>
{
  private apiClient: ApiClient;
  private productId: string;
  private optionId: string;
  private localDateStart: string;
  private localDateEnd: string;
  private availabilityType: string;
  private capabilities: CapabilityId[];
  private availabilityScenarioHelper = new AvailabilityScenarioHelper();
  constructor({
    apiClient,
    productId,
    optionId,
    localDateStart,
    localDateEnd,
    availabilityType,
    capabilities,
  }: {
    apiClient: ApiClient;
    productId: string;
    optionId: string;
    localDateStart: string;
    localDateEnd: string;
    availabilityType: string;
    capabilities: CapabilityId[];
  }) {
    this.apiClient = apiClient;
    this.productId = productId;
    this.optionId = optionId;
    this.localDateStart = localDateStart;
    this.localDateEnd = localDateEnd;
    this.availabilityType = availabilityType;
    this.capabilities = capabilities;
  }

  public validate = async () => {
    const result = await this.apiClient.getAvailability({
      productId: this.productId,
      optionId: this.optionId,
      localDateStart: this.localDateStart,
      localDateEnd: this.localDateEnd,
    });
    const name = `Availability Check Interval (${this.availabilityType})`;

    return this.availabilityScenarioHelper.validateAvailability(
      {
        ...result,
        name,
      },
      this.capabilities
    );
  };
}
