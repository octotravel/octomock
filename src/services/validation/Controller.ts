import { ProductErrorScenario } from "./Scenarios/Product/ProductError";
import { Product } from "@octocloud/types";
import { ApiClient } from "./ApiClient";
import { Config } from "./config/Config";
import { ProductScenario } from "./Scenarios/Product/Product";
import { ScenarioResult } from "./Scenario";

// class PrimiteFlows {

//     public validate = (): Promise<ScenarioResult> => {
//         // new ProductFlow().validate()
//         // new AvailabilityFlow().validate()
//     }
// }

export class ValidationController {
  private config: Config;
  private apiClient: ApiClient;
  constructor({ config }: { config: Config }) {
    this.config = config;
    this.apiClient = new ApiClient({
      url: config.url,
      capabilities: config.capabilities,
    });
  }

  public validate = async () => {
    // validateProduct
    // new PrimiteFlows().validate()
    // new ComplextFlows().validate()
    // const { data } await ProductScenario().validate()
    // const productId = data.id
  };

  public validateProduct = async (): Promise<
    Promise<ScenarioResult<Product>>[]
  > => {
    return this.config.getProductConfigs().map((productConfig) => {
      return new ProductScenario({
        apiClient: this.apiClient,
        productId: productConfig.productId,
        capabilities: this.config.capabilities,
      }).validate();
    });
  };
  public validateProductError = async (): Promise<ScenarioResult<null>> => {
    return new ProductErrorScenario({
      apiClient: this.apiClient,
      productId: "badProductID",
    }).validate();
  };
}
