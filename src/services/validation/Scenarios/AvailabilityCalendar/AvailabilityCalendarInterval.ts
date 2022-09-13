import { AvailabilityCalendar } from "@octocloud/types";
import { Scenario } from "../Scenario";
import { AvailabilityCalendarScenarioHelper } from "../../helpers/AvailabilityCalendarScenarioHelper";
import { Config } from "../../config/Config";
import { DateHelper } from "../../../../helpers/DateHelper";
import { addDays } from "date-fns";

export class AvailabilityCalendarIntervalScenario
  implements Scenario<AvailabilityCalendar[]>
{
  private config = Config.getInstance();
  private apiClient = this.config.getApiClient();

  private availabilityCalendarScenarioHelper =
    new AvailabilityCalendarScenarioHelper();

  public validate = async () => {
    const product = this.config.getProduct();
    const result = await this.apiClient.getAvailabilityCalendar({
      productId: product.id,
      optionId: product.options[0].id,
      localDateStart: DateHelper.getDate(new Date().toISOString()),
      localDateEnd: DateHelper.getDate(addDays(new Date(), 30).toISOString()),
    });
    const name = `Availability Calendar Interval (${product.availabilityType})`;

    return this.availabilityCalendarScenarioHelper.validateAvailability({
      result,
      name,
    });
  };
}
