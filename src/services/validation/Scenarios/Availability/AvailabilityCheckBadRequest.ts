import { BadRequestErrorValidator } from "../../../../validators/backendValidator/Error/BadRequestErrorValidator";
import { ApiClient } from "../../api/ApiClient";
import { AvailabilityScenarioHelper } from "../../helpers/AvailabilityScenarioHelper";
import { Scenario, ScenarioResult } from "../Scenario";

export class AvailabilityCheckBadRequestScenario implements Scenario<null> {
  private apiClient: ApiClient;
  private productId: string;
  private optionId: string;
  private localDate: string;
  private localDateStart: string;
  private localDateEnd: string;
  private availabilityIds: string[];

  constructor({
    apiClient,
    productId,
    optionId,
    localDate,
    localDateStart,
    localDateEnd,
    availabilityIds,
  }: {
    apiClient: ApiClient;
    productId: string;
    optionId: string;
    localDate?: string;
    localDateStart?: string;
    localDateEnd?: string;
    availabilityIds?: string[];
  }) {
    this.apiClient = apiClient;
    this.productId = productId;
    this.optionId = optionId;
    this.localDate = localDate;
    this.localDateStart = localDateStart;
    this.localDateEnd = localDateEnd;
    this.availabilityIds = availabilityIds;
  }
  private availabilityScenarioHelper = new AvailabilityScenarioHelper();

  public validate = async (): Promise<ScenarioResult<null>> => {
    const result = await this.apiClient.getAvailability({
      productId: this.productId,
      optionId: this.optionId,
      localDate: this.localDate,
      localDateStart: this.localDateStart,
      localDateEnd: this.localDateEnd,
      availabilityIds: this.availabilityIds,
    });

    const name = `Availability Check BAD_REQUEST (400 BAD_REQUEST)`;
    const error = "Response should be BAD_REQUEST";
    return this.availabilityScenarioHelper.validateAvailabilityError(
      {
        name,
        ...result,
      },
      error,
      new BadRequestErrorValidator()
    );
  };
}
