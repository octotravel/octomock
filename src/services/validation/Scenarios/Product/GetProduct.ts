import { CapabilityId, Product } from "@octocloud/types";
import { ApiClient } from "../../ApiClient";
import { ProductScenarioHelper } from "../../helpers/ProductScenarioHelper";
import { Scenario } from "../Scenario";

export class GetProductScenario implements Scenario<Product> {
  private apiClient: ApiClient;
  private productId: string;
  private capabilities: CapabilityId[];
  constructor({
    apiClient,
    productId,
    capabilities,
  }: {
    apiClient: ApiClient;
    productId: string;
    capabilities: CapabilityId[];
  }) {
    this.apiClient = apiClient;
    this.productId = productId;
    this.capabilities = capabilities;
  }
  private productScenarioHelper = new ProductScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.getProduct({
      id: this.productId,
    });
    const name = `Get Product`;

    return this.productScenarioHelper.validateProduct(
      {
        ...result,
        name,
      },
      this.capabilities
    );
  };
}
