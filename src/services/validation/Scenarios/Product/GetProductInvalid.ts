import { InvalidProductIdErrorValidator } from "../../../../validators/backendValidator/Error/InvalidProductIdErrorValidator";
import { ApiClient } from "../../api/ApiClient";
import { ProductScenarioHelper } from "../../helpers/ProductScenarioHelper";
import { Scenario, ScenarioResult } from "../Scenario";

export class GetProductInvalidScenario implements Scenario<any> {
  private apiClient: ApiClient;
  private productId: string;
  constructor({
    apiClient,
    productId,
  }: {
    apiClient: ApiClient;
    productId: string;
  }) {
    this.apiClient = apiClient;
    this.productId = productId;
  }
  private productScenarioHelper = new ProductScenarioHelper();

  public validate = async (): Promise<ScenarioResult<any>> => {
    const result = await this.apiClient.getProduct({
      id: this.productId,
    });
    const name = `Get Product Invalid (400 INVALID_PRODUCT_ID)`;
    const error = "Response should be INVALID_PRODUCT_ID";

    return this.productScenarioHelper.validateProductError(
      {
        result,
        name,
      },
      error,
      new InvalidProductIdErrorValidator()
    );
  };
}
