import { Product } from "@octocloud/types";
import { Scenario } from "../Scenario";
import { ProductScenarioHelper } from "../../helpers/ProductScenarioHelper";
import { Config } from "../../config/Config";
import descriptions from "../../consts/descriptions";

export class GetProductsScenario implements Scenario<Product[]> {
  private config = Config.getInstance();
  private apiClient = this.config.getApiClient();

  private productScenarioHelper = new ProductScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.getProducts();
    const name = "Get Products";
    const description = descriptions.getProducts;

    return this.productScenarioHelper.validateProducts({
      result,
      name,
      description,
    });
  };
}
