import { AvailabilityCalendar, AvailabilityUnit } from "@octocloud/types";
import { ApiClient } from "../../api/ApiClient";
import { Scenario } from "../Scenario";
import { AvailabilityCalendarScenarioHelper } from "../../helpers/AvailabilityCalendarScenarioHelper";

export class AvailabilityCalendarUnavailableDatesScenario
  implements Scenario<AvailabilityCalendar[]>
{
  private apiClient: ApiClient;
  private productId: string;
  private optionId: string;
  private localDateStart: string;
  private localDateEnd: string;
  private units: AvailabilityUnit[];
  private availabilityType: string;
  constructor({
    apiClient,
    productId,
    optionId,
    localDateStart,
    localDateEnd,
    units,
    availabilityType,
  }: {
    apiClient: ApiClient;
    productId: string;
    optionId: string;
    localDateStart: string;
    localDateEnd: string;
    units?: AvailabilityUnit[];
    availabilityType: string;
  }) {
    this.apiClient = apiClient;
    this.productId = productId;
    this.optionId = optionId;
    this.localDateStart = localDateStart;
    this.localDateEnd = localDateEnd;
    this.units = units;
    this.availabilityType = availabilityType;
  }
  private availabilityCalendarScenarioHelper =
    new AvailabilityCalendarScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.getAvailabilityCalendar({
      productId: this.productId,
      optionId: this.optionId,
      localDateStart: this.localDateStart,
      localDateEnd: this.localDateEnd,
      units: this.units,
    });
    const name = `Availability Calendar Unavailable Dates (${this.availabilityType})`;

    return this.availabilityCalendarScenarioHelper.validateAvailability({
      result,
      name,
    });
  };
}
