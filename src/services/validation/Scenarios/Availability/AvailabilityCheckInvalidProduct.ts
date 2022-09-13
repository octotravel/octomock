import { Availability } from "@octocloud/types";
import { InvalidProductIdErrorValidator } from "../../../../validators/backendValidator/Error/InvalidProductIdErrorValidator";
import { ApiClient } from "../../api/ApiClient";
import { AvailabilityScenarioHelper } from "../../helpers/AvailabilityScenarioHelper";
import { Scenario, ScenarioResult } from "../Scenario";

export class AvailabilityCheckInvalidProductScenario
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

    const name = `Availability Check Invalid Product (400 INVALID_PRODUCT_ID)`;
    const error = "Response should be INVALID_PRODUCT_ID";

    return this.availabilityScenarioHelper.validateAvailabilityError(
      {
        name,
        result,
      },
      error,
      new InvalidProductIdErrorValidator()
    );
  };
}
