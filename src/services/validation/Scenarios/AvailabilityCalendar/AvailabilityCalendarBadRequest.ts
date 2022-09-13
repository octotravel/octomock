import { AvailabilityCalendar, AvailabilityUnit } from "@octocloud/types";
import { BadRequestErrorValidator } from "../../../../validators/backendValidator/Error/BadRequestErrorValidator";
import { ApiClient } from "../../api/ApiClient";
import { AvailabilityCalendarScenarioHelper } from "../../helpers/AvailabilityCalendarScenarioHelper";
import { Scenario, ScenarioResult } from "../Scenario";

export class AvailabilityCalendarBadRequestScenario
  implements Scenario<AvailabilityCalendar[]>
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
    localDateStart?: string;
    localDateEnd?: string;
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

  public validate = async (): Promise<
    ScenarioResult<AvailabilityCalendar[]>
  > => {
    const result = await this.apiClient.getAvailabilityCalendar({
      productId: this.productId,
      optionId: this.optionId,
      localDateStart: this.localDateStart,
      localDateEnd: this.localDateEnd,
      units: this.units,
    });

    const name = `Availability Calendar BAD_REQUEST (400 BAD_REQUEST)`;
    const error = "Response should be BAD_REQUEST";

    return this.availabilityCalendarScenarioHelper.validateAvailabilityError(
      {
        result,
        name,
      },
      error,
      new BadRequestErrorValidator()
    );
  };
}
