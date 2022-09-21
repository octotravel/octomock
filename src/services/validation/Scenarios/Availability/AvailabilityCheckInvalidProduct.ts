import { InvalidProductIdErrorValidator } from "../../../../validators/backendValidator/Error/InvalidProductIdErrorValidator";
import { Config } from "../../config/Config";
import descriptions from "../../consts/descriptions";
import { AvailabilityScenarioHelper } from "../../helpers/AvailabilityScenarioHelper";
import { Scenario, ScenarioResult } from "../Scenario";

export class AvailabilityCheckInvalidProductScenario implements Scenario<any> {
  private config = Config.getInstance();
  private apiClient = this.config.getApiClient();
  private availabilityScenarioHelper = new AvailabilityScenarioHelper();

  public validate = async (): Promise<ScenarioResult<any>> => {
    const [product] = this.config.productConfig.productsForAvailabilityCheck;
    const result = await this.apiClient.getAvailability({
      productId: this.config.invalidProductId,
      optionId: product.options[0].id,
      localDateStart: this.config.localDateStart,
      localDateEnd: this.config.localDateEnd,
    });

    const name = `Availability Check Invalid Product (400 INVALID_PRODUCT_ID)`;
    const error = "Response should be INVALID_PRODUCT_ID";
    const description = descriptions.invalidProduct;

    return this.availabilityScenarioHelper.validateError(
      {
        name,
        result,
        description,
      },
      error,
      new InvalidProductIdErrorValidator()
    );
  };
}
