import { ProductErrorScenario } from "./Scenarios/Product/ProductError";
import { Product } from "@octocloud/types";
import { ApiClient } from "./ApiClient";
import { Config } from "./config/Config";
import { ProductScenario } from "./Scenarios/Product/Product";
import { ScenarioResult } from "./Scenario";

class ProductFlow {
  private config: Config;
  private apiClient: ApiClient;
  constructor({ config }: { config: Config }) {
    this.config = config;
    this.apiClient = new ApiClient({
      url: config.url,
      capabilities: config.capabilities,
    });
  }
  public validate = async (): Promise<ScenarioResult<null>> => {
    await this.validateProduct();
    await this.validateProductError();
    return {
      success: true,
      errors: [],
      data: null,
    };
  };

  private validateProduct = async (): Promise<
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
  private validateProductError = async (): Promise<ScenarioResult<null>> => {
    return new ProductErrorScenario({
      apiClient: this.apiClient,
      productId: "badProductID",
    }).validate();
  };
}

class PrimiteFlows {
  private config: Config;
  constructor({ config }: { config: Config }) {
    this.config = config;
  }
  public validate = (): Promise<ScenarioResult<void>> => {
    const config = this.config;
    return new ProductFlow({ config }).validate();
    // new AvailabilityFlow().validate()
  };
}

export class ValidationController {
  private config: Config;
  constructor({ config }: { config: Config }) {
    this.config = config;
  }

  public validate = async () => {
    const config = this.config;
    // validateProduct
    new PrimiteFlows({ config }).validate();

    // new ComplextFlows().validate()
    // const { data } await ProductScenario().validate()
    // const productId = data.id
    return null;
  };
}
