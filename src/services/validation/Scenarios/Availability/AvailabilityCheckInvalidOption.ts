import { Availability } from "@octocloud/types";
import { InvalidOptionIdErrorValidator } from "../../../../validators/backendValidator/Error/InvalidOptionIdErrorValidator";
import { ApiClient } from "../../api/ApiClient";
import { AvailabilityScenarioHelper } from "../../helpers/AvailabilityScenarioHelper";
import { Scenario, ScenarioResult } from "../Scenario";

export class AvailabilityCheckInvalidOptionScenario
  implements Scenario<Availability[]>
{
  private apiClient: ApiClient;
  private productId: string;
  private optionId: string;
  private localDate: string;
  constructor({
    apiClient,
    productId,
    optionId,
    localDate,
  }: {
    apiClient: ApiClient;
    productId: string;
    optionId: string;
    localDate: string;
  }) {
    this.apiClient = apiClient;
    this.productId = productId;
    this.optionId = optionId;
    this.localDate = localDate;
  }
  private availabilityScenarioHelper = new AvailabilityScenarioHelper();

  public validate = async (): Promise<ScenarioResult<Availability[]>> => {
    const result = await this.apiClient.getAvailability({
      productId: this.productId,
      optionId: this.optionId,
      localDate: this.localDate,
    });
    const name = `Availability Check Invalid Option (400 INVALID_OPTION_ID)`;
    const error = "Response should be INVALID_OPTION_ID";

    return this.availabilityScenarioHelper.validateAvailabilityError(
      {
        name,
        result,
      },
      error,
      new InvalidOptionIdErrorValidator()
    );
  };
}
