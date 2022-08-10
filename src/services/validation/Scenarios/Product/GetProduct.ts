import { CapabilityId, Product } from "@octocloud/types";
import { ApiClient } from "../../ApiClient";
import { ProductScenarioHelper } from "../../helpers/ProductScenarioHelper";
import { Scenario } from "../Scenario";

export class GetProductScenario implements Scenario<Product> {
  private apiClient: ApiClient;
  private productId: string;
  private availabilityType: string;
  private capabilities: CapabilityId[];
  constructor({
    apiClient,
    productId,
    availabilityType,
    capabilities,
  }: {
    apiClient: ApiClient;
    productId: string;
    availabilityType: string;
    capabilities: CapabilityId[];
  }) {
    this.apiClient = apiClient;
    this.productId = productId;
    this.availabilityType = availabilityType;
    this.capabilities = capabilities;
  }
  private productScenarioHelper = new ProductScenarioHelper();

  public validate = async () => {
    const result = await this.apiClient.getProduct({
      id: this.productId,
    });
    const name = `Get Product (${this.availabilityType})`;

    return this.productScenarioHelper.validateProduct(
      {
        ...result,
        name,
      },
      this.capabilities
    );
  };
}
