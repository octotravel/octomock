import { DateHelper } from "../../../../helpers/DateHelper";
import { InvalidProductIdErrorValidator } from "../../../../validators/backendValidator/Error/InvalidProductIdErrorValidator";
import { Config } from "../../config/Config";
import { AvailabilityScenarioHelper } from "../../helpers/AvailabilityScenarioHelper";
import { Scenario, ScenarioResult } from "../Scenario";

export class AvailabilityCheckInvalidProductScenario implements Scenario<any> {
  private config = Config.getInstance();
  private apiClient = this.config.getApiClient();
  private availabilityScenarioHelper = new AvailabilityScenarioHelper();

  public validate = async (): Promise<ScenarioResult<any>> => {
    const result = await this.apiClient.getAvailability({
      productId: this.config.invalidProductId,
      optionId: this.config.getStartTimeProducts()[0].getOption().id,
      localDate: DateHelper.getDate(new Date().toISOString()),
    });

    const name = `Availability Check Invalid Product (400 INVALID_PRODUCT_ID)`;
    const error = "Response should be INVALID_PRODUCT_ID";

    return this.availabilityScenarioHelper.validateError(
      {
        name,
        result,
      },
      error,
      new InvalidProductIdErrorValidator()
    );
  };
}
