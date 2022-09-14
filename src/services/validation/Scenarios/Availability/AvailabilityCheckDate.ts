import { Availability, AvailabilityType } from "@octocloud/types";
import { Scenario } from "../Scenario";
import { AvailabilityScenarioHelper } from "../../helpers/AvailabilityScenarioHelper";
import { Config } from "../../config/Config";
import { DateHelper } from "../../../../helpers/DateHelper";
import { addDays, eachDayOfInterval } from "date-fns";

export class AvailabilityCheckDateScenario implements Scenario<Availability[]> {
  private config = Config.getInstance();
  private apiClient = this.config.getApiClient();

  private availabilityScenarioHelper = new AvailabilityScenarioHelper();

  public validate = async () => {
    const dates = eachDayOfInterval({
      start: new Date(),
      end: addDays(new Date(), 30),
    }).map((date) => {
      return DateHelper.availabilityDateFormat(date);
    });
    const result = await this.apiClient.getAvailability({
      productId:
        this.config.getStartTimeProducts().availabilityAvailable.productId,
      optionId:
        this.config.getStartTimeProducts().availabilityAvailable.optionId,
      localDate: dates[Math.floor(Math.random() * dates.length)],
    });
    const name = `Availability Check Date (${AvailabilityType.START_TIME})`;
    return this.availabilityScenarioHelper.validateAvailability({
      name,
      result,
      availabilityType: AvailabilityType.START_TIME,
    });
  };
}
