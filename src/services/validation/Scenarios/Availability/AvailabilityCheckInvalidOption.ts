import { InvalidOptionIdErrorValidator } from "../../../../validators/backendValidator/Error/InvalidOptionIdErrorValidator";
import { Config } from "../../config/Config";
import { AvailabilityScenarioHelper } from "../../helpers/AvailabilityScenarioHelper";
import { Scenario, ScenarioResult } from "../Scenario";

export class AvailabilityCheckInvalidOptionScenario implements Scenario<any> {
  private config = Config.getInstance();
  private apiClient = this.config.getApiClient();
  private availabilityScenarioHelper = new AvailabilityScenarioHelper();

  public validate = async (): Promise<ScenarioResult<any>> => {
    const [product] = this.config.productConfig.productsForAvailabilityCheck;
    const result = await this.apiClient.getAvailability({
      productId: product.id,
      optionId: this.config.invalidOptionId,
      localDateStart: this.config.localDateStart,
      localDateEnd: this.config.localDateEnd,
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
