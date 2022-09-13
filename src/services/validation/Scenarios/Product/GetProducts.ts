import { Product } from "@octocloud/types";
import { Scenario } from "../Scenario";
import { ProductScenarioHelper } from "../../helpers/ProductScenarioHelper";
import { Config } from "../../config/Config";

export class GetProductsScenario implements Scenario<Product[]> {
  private config = Config.getInstance();
  private apiClient = this.config.getApiClient();

  private productScenarioHelper = new ProductScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.getProducts();
    const name = "Get Products";

    return this.productScenarioHelper.validateProducts({
      result,
      name,
    });
  };
}
