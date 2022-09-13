import { Product } from "@octocloud/types";
import { Config } from "../../config/Config";
import { ProductScenarioHelper } from "../../helpers/ProductScenarioHelper";
import { Scenario } from "../Scenario";

export class GetProductScenario implements Scenario<Product> {
  private config = Config.getInstance();
  private apiClient = this.config.getApiClient();
  private productScenarioHelper = new ProductScenarioHelper();

  public validate = async () => {
    const product = this.config.getProduct();
    const result = await this.apiClient.getProduct({
      id: product.id,
    });
    const name = `Get Product`;

    return this.productScenarioHelper.validateProduct({
      result,
      name,
    });
  };
}
