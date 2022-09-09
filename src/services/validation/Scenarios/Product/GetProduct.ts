import { CapabilityId, Product } from "@octocloud/types";
import { ValidatorError } from "../../../../validators/backendValidator/ValidatorHelpers";
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
    const name = `Get Product`;
    if (this.productId === null) {
      return this.productScenarioHelper.handlePreError({
        name,
        success: false,
        errors: [
          new ValidatorError({
            message: "Atleast one product must be available",
          }),
        ],
      });
    }
    const result = await this.apiClient.getProduct({
      id: this.productId,
    });

    return this.productScenarioHelper.validateProduct(
      {
        ...result,
        name,
      },
      this.capabilities
    );
  };
}
