import { InvalidProductIdErrorValidator } from "../../../../validators/backendValidator/Error/InvalidProductIdErrorValidator";
import { Config } from "../../config/Config";
import { ProductScenarioHelper } from "../../helpers/ProductScenarioHelper";
import { Scenario, ScenarioResult } from "../Scenario";

export class GetProductInvalidScenario implements Scenario<any> {
  private config = Config.getInstance();
  private apiClient = this.config.getApiClient();
  private productScenarioHelper = new ProductScenarioHelper();

  public validate = async (): Promise<ScenarioResult<any>> => {
    const result = await this.apiClient.getProduct({
      id: this.config.invalidProductId,
    });
    const name = `Get Product Invalid (400 INVALID_PRODUCT_ID)`;
    const error = "Response should be INVALID_PRODUCT_ID";

    return this.productScenarioHelper.validateError(
      {
        result,
        name,
      },
      error,
      new InvalidProductIdErrorValidator()
    );
  };
}
