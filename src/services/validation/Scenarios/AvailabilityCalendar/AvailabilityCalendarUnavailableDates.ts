import {
  AvailabilityCalendar,
  AvailabilityUnit,
  Product,
} from "@octocloud/types";
import { ApiClient } from "../../api/ApiClient";
import { Scenario } from "../Scenario";
import { AvailabilityCalendarScenarioHelper } from "../../helpers/AvailabilityCalendarScenarioHelper";

export class AvailabilityCalendarUnavailableDatesScenario
  implements Scenario<AvailabilityCalendar[]>
{
  private apiClient: ApiClient;
  private product: Product;
  private optionId: string;
  private localDateStart: string;
  private localDateEnd: string;
  private units: AvailabilityUnit[];
  private availabilityType: string;
  constructor({
    apiClient,
    product,
    optionId,
    localDateStart,
    localDateEnd,
    units,
    availabilityType,
  }: {
    apiClient: ApiClient;
    product: Product;
    optionId: string;
    localDateStart: string;
    localDateEnd: string;
    units?: AvailabilityUnit[];
    availabilityType: string;
  }) {
    this.apiClient = apiClient;
    this.product = product;
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
      productId: this.product.id,
      optionId: this.optionId,
      localDateStart: this.localDateStart,
      localDateEnd: this.localDateEnd,
      units: this.units,
    });
    const name = `Availability Calendar Unavailable Dates (${this.availabilityType})`;

    return this.availabilityCalendarScenarioHelper.validateAvailability({
      result,
      name,
      product: this.product,
    });
  };
}
