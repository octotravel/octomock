import { AvailabilityCalendar } from "@octocloud/types";
import { addDays } from "date-fns";
import { DateHelper } from "../../../../helpers/DateHelper";
import { BadRequestErrorValidator } from "../../../../validators/backendValidator/Error/BadRequestErrorValidator";
import { Config } from "../../config/Config";
import descriptions from "../../consts/descriptions";
import { AvailabilityCalendarScenarioHelper } from "../../helpers/AvailabilityCalendarScenarioHelper";
import { Scenario, ScenarioResult } from "../Scenario";

export class AvailabilityCalendarBadRequestScenario
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
      optionId: product.options[0].id,
      localDateStart: undefined,
      localDateEnd: DateHelper.getDate(addDays(new Date(), 30).toISOString()),
    });

    const name = `Availability Calendar BAD_REQUEST (400 BAD_REQUEST)`;
    const error = "Response should be BAD_REQUEST";
    const description = descriptions.availabilityCalendarBadRequest;

    return this.availabilityCalendarScenarioHelper.validateError(
      {
        result,
        name,
        description,
      },
      error,
      new BadRequestErrorValidator()
    );
  };
}
