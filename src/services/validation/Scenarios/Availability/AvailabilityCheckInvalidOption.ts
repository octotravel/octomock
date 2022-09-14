import { DateHelper } from "../../../../helpers/DateHelper";
import { InvalidOptionIdErrorValidator } from "../../../../validators/backendValidator/Error/InvalidOptionIdErrorValidator";
import { Config } from "../../config/Config";
import { AvailabilityScenarioHelper } from "../../helpers/AvailabilityScenarioHelper";
import { Scenario, ScenarioResult } from "../Scenario";

export class AvailabilityCheckInvalidOptionScenario implements Scenario<any> {
  private config = Config.getInstance();
  private apiClient = this.config.getApiClient();
  private availabilityScenarioHelper = new AvailabilityScenarioHelper();

  public validate = async (): Promise<ScenarioResult<any>> => {
    const result = await this.apiClient.getAvailability({
      productId:
        this.config.getStartTimeProducts().availabilityAvailable.productId,
      optionId: this.config.invalidOptionId,
      localDate: DateHelper.getDate(new Date().toISOString()),
    });
    const name = `Availability Check Invalid Option (400 INVALID_OPTION_ID)`;
    const error = "Response should be INVALID_OPTION_ID";

    return this.availabilityScenarioHelper.validateError(
      {
        name,
        result,
      },
      error,
      new InvalidOptionIdErrorValidator()
    );
  };
}
