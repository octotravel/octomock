import { Availability } from "@octocloud/types";
import { DateHelper } from "../../../../helpers/DateHelper";
import { BadRequestErrorValidator } from "../../../../validators/backendValidator/Error/BadRequestErrorValidator";
import { Config } from "../../config/Config";
import { AvailabilityScenarioHelper } from "../../helpers/AvailabilityScenarioHelper";
import { Scenario, ScenarioResult } from "../Scenario";

export class AvailabilityCheckBadRequestScenario
  implements Scenario<Availability[]>
{
  private config = Config.getInstance();
  private apiClient = this.config.getApiClient();
  private availabilityScenarioHelper = new AvailabilityScenarioHelper();

  public validate = async (): Promise<ScenarioResult<Availability[]>> => {
    const result = await this.apiClient.getAvailability({
      productId:
        this.config.getStartTimeProducts().availabilityAvailable.productId,
      optionId:
        this.config.getStartTimeProducts().availabilityAvailable.optionId,
      localDateStart: DateHelper.getDate(new Date().toISOString()),
      localDateEnd: DateHelper.getDate(new Date().toISOString()),
      availabilityIds: [
        this.config.getStartTimeProducts().availabilityAvailable.availabilityId,
      ],
    });

    const name = `Availability Check BAD_REQUEST (400 BAD_REQUEST)`;
    const error = "Response should be BAD_REQUEST";
    return this.availabilityScenarioHelper.validateError(
      {
        name,
        result,
      },
      error,
      new BadRequestErrorValidator()
    );
  };
}
