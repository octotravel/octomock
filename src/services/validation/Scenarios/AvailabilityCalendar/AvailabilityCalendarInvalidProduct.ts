import { AvailabilityUnit } from "@octocloud/types";
import { InvalidProductIdErrorValidator } from "../../../../validators/backendValidator/Error/InvalidProductIdErrorValidator";
import { ApiClient } from "../../ApiClient";
import { AvailabilityCalendarScenarioHelper } from "../../helpers/AvailabilityCalendarScenarioHelper";
import { Scenario, ScenarioResult } from "../Scenario";

export class AvailabilityCalendarInvalidProductScenario
  implements Scenario<null>
{
  private apiClient: ApiClient;
  private productId: string;
  private optionId: string;
  private localDateStart: string;
  private localDateEnd: string;
  private units: AvailabilityUnit[];
  constructor({
    apiClient,
    productId,
    optionId,
    localDateStart,
    localDateEnd,
    units,
  }: {
    apiClient: ApiClient;
    productId: string;
    optionId: string;
    localDateStart: string;
    localDateEnd: string;
    units?: AvailabilityUnit[];
  }) {
    this.apiClient = apiClient;
    this.productId = productId;
    this.optionId = optionId;
    this.localDateStart = localDateStart;
    this.localDateEnd = localDateEnd;
    this.units = units;
  }
  private availabilityCalendarScenarioHelper =
    new AvailabilityCalendarScenarioHelper();

  public validate = async (): Promise<ScenarioResult<null>> => {
    const result = await this.apiClient.getAvailabilityCalendar({
      productId: this.productId,
      optionId: this.optionId,
      localDateStart: this.localDateStart,
      localDateEnd: this.localDateEnd,
      units: this.units,
    });

    const name = `Availability Calendar Invalid Product (400 INVALID_PRODUCT_ID)`;
    const error = "Response should be INVALID_PRODUCT_ID";

    return this.availabilityCalendarScenarioHelper.validateAvailabilityError(
      {
        ...result,
        name,
      },
      error,
      new InvalidProductIdErrorValidator()
    );
  };
}
