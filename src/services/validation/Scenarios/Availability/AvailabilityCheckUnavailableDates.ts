import { ApiClient } from "../../ApiClient";
import { AvailabilityScenarioHelper } from "../../helpers/AvailabilityScenarioHelper";
import { Scenario, ScenarioResult } from "../Scenario";

export class AvailabilityCheckUnavailableDatesScenario
  implements Scenario<null>
{
  private apiClient: ApiClient;
  private productId: string;
  private optionId: string;
  private localDateStart: string;
  private localDateEnd: string;
  private availabilityType: string;
  constructor({
    apiClient,
    productId,
    optionId,
    localDateStart,
    localDateEnd,
    availabilityType,
  }: {
    apiClient: ApiClient;
    productId: string;
    optionId: string;
    localDateStart: string;
    localDateEnd: string;
    availabilityType: string;
  }) {
    this.apiClient = apiClient;
    this.productId = productId;
    this.optionId = optionId;
    this.localDateStart = localDateStart;
    this.localDateEnd = localDateEnd;
    this.availabilityType = availabilityType;
  }
  private availabilityScenarioHelper = new AvailabilityScenarioHelper();

  public validate = async (): Promise<ScenarioResult<null>> => {
    const result = await this.apiClient.getAvailability({
      productId: this.productId,
      optionId: this.optionId,
      localDateStart: this.localDateStart,
      localDateEnd: this.localDateEnd,
    });
    const name = `Availability Check Unavailable Dates (${this.availabilityType})`;

    return this.availabilityScenarioHelper.validateUnavailability({
      name,
      ...result,
    });
  };
}
