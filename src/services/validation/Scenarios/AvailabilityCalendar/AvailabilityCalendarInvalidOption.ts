import { AvailabilityCalendar } from "@octocloud/types";
import { addDays } from "date-fns";
import { DateHelper } from "../../../../helpers/DateHelper";
import { InvalidOptionIdErrorValidator } from "../../../../validators/backendValidator/Error/InvalidOptionIdErrorValidator";
import { Config } from "../../config/Config";
import descriptions from "../../consts/descriptions";
import { AvailabilityCalendarScenarioHelper } from "../../helpers/AvailabilityCalendarScenarioHelper";
import { Scenario, ScenarioResult } from "../Scenario";

export class AvailabilityCalendarInvalidOptionScenario
  implements Scenario<AvailabilityCalendar[]>
{
  private config = Config.getInstance();
  private apiClient = this.config.getApiClient();
  private availabilityCalendarScenarioHelper =
    new AvailabilityCalendarScenarioHelper();

  public validate = async (): Promise<
    ScenarioResult<AvailabilityCalendar[]>
  > => {
    const product = this.config.getProduct();
    const result = await this.apiClient.getAvailabilityCalendar({
      productId: product.id,
      optionId: this.config.invalidOptionId,
      localDateStart: DateHelper.getDate(new Date().toISOString()),
      localDateEnd: DateHelper.getDate(addDays(new Date(), 30).toISOString()),
    });
    const name = `Availability Calendar Invalid Option (400 INVALID_OPTION_ID)`;
    const error = "Response should be INVALID_OPTION_ID";
    const description = descriptions.invalidOption;

    return this.availabilityCalendarScenarioHelper.validateError(
      {
        result,
        name,
        description,
      },
      error,
      new InvalidOptionIdErrorValidator()
    );
  };
}
