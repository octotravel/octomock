import { CapabilityId, Product } from "@octocloud/types";
import { ApiClient } from "../../ApiClient";
import { Scenario } from "../Scenario";
import { ProductScenarioHelper } from "../../helpers/ProductScenarioHelper";

export class GetProductsScenario implements Scenario<Product[]> {
  private apiClient: ApiClient;
  private capabilities: CapabilityId[];
  constructor({
    apiClient,
    capabilities,
  }: {
    apiClient: ApiClient;
    capabilities: CapabilityId[];
  }) {
    this.apiClient = apiClient;
    this.capabilities = capabilities;
  }
  private productScenarioHelper = new ProductScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.getProducts();
    const name = "Get Products";

    return this.productScenarioHelper.validateProducts(
      {
        ...result,
        name,
      },
      this.capabilities
    );
  };
}
