import { Availability, CapabilityId } from "@octocloud/types";
import { ApiClient } from "../../api/ApiClient";
import { Scenario } from "../Scenario";
import { AvailabilityScenarioHelper } from "../../helpers/AvailabilityScenarioHelper";

export class AvailabilityCheckDateScenario implements Scenario<Availability[]> {
  private apiClient: ApiClient;
  private productId: string;
  private optionId: string;
  private localDate: string;
  private availabilityType: string;
  private capabilities: CapabilityId[];
  private availabilityScenarioHelper = new AvailabilityScenarioHelper();
  constructor({
    apiClient,
    productId,
    optionId,
    localDate,
    availabilityType,
    capabilities,
  }: {
    apiClient: ApiClient;
    productId: string;
    optionId: string;
    localDate: string;
    availabilityType: string;
    capabilities: CapabilityId[];
  }) {
    this.apiClient = apiClient;
    this.productId = productId;
    this.optionId = optionId;
    this.localDate = localDate;
    this.availabilityType = availabilityType;
    this.capabilities = capabilities;
  }

  public validate = async () => {
    const { request, response } = await this.apiClient.getAvailability({
      productId: this.productId,
      optionId: this.optionId,
      localDate: this.localDate,
    });
    const name = `Availability Check Date (${this.availabilityType})`;

    return this.availabilityScenarioHelper.validateAvailability(
      {
        name,
        request,
        response,
      },
      this.capabilities
    );
  };
}
